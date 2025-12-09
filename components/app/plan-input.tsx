'use client'
import { generatePlanSchema } from '@/app/api/tasks/generate/schema'
import { Button } from '@/components/ui/button'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { TimerEndType, TimerType, db } from '@/lib/db'
import { getTimeOfDay, getDeviceType } from '@/lib/utils'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { differenceInMinutes, setHours, setMinutes } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BrainCog,
  Lightbulb,
  Paperclip,
  PauseIcon,
  PlayIcon,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Icons } from '../icons'
import { Card } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { PlanHistory } from './plan-history'

import { fetchWithKey } from '@/lib/fetch'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
export const lastGeneratedPlanAtom = atomWithStorage<
  typeof generatePlanSchema._output | null
>('lastGeneratedPlan', null)

interface Task {
  content: string
  duration: number
  tags: string[]
}

export function PlanInput() {
  const [lastGeneratedPlan, setLastGeneratedPlan] = useAtom(
    lastGeneratedPlanAtom,
  )

  const { object, isLoading, error, submit } = useObject({
    api: '/api/tasks/generate',
    schema: generatePlanSchema,
    initialValue: lastGeneratedPlan,
    fetch: fetchWithKey,
    onFinish: async (result) => {
      if (result.object) {
        setLastGeneratedPlan(result.object)

        await db.saveChatHistory('task-generation', inputValue, result.object, {
          timeOfDay: getTimeOfDay(new Date()),
          deviceType: getDeviceType(),
        })
        return
      }
      if (result.error) {
        console.error(result.error)
      }
      toast.error('Something went wrong')
    },
  })
  const today = new Date()

  const plan = useLiveQuery(async () => {
    return db.getPlan(today)
  })

  const [inputValue, setInputValue] = useState(plan?.content ?? '')

  const debouncedUpdate = useDebouncedCallback(async (content: string) => {
    await db.updatePlan(today, content)
  }, 500)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    debouncedUpdate(newValue)
  }

  useEffect(() => {
    if (plan?.content !== undefined) {
      setInputValue(plan.content)
    }
  }, [plan?.content])

  const handleGenerateTasks = async () => {
    try {
      const input = plan?.content ?? inputValue
      if (!input) {
        throw new Error('Please enter a plan first')
      }
      const now = new Date()

      // Get preferences from the plan, or use defaults
      const workingHours = plan?.preferences?.workingHours ?? {
        start: 6,
        end: 18,
      }
      const endOfWorkDay = setHours(setMinutes(now, 0), workingHours.end)
      const timeLeft = differenceInMinutes(endOfWorkDay, now)
      const availablePomodoros = Math.floor(timeLeft / 25)

      submit({
        content: input,
        currentTime: now.toISOString(),
        endOfWorkDay: endOfWorkDay.toISOString(),
        timeLeft,
        availablePomodoros,
        context: {
          dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
          isWeekend: [0, 6].includes(now.getDay()),
          timeOfDay: getTimeOfDay(now),
          deviceType: getDeviceType(),
          preferredWorkingHours: {
            start: workingHours.start,
            end: workingHours.end,
          },
        },
      })
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  const tasks = useMemo(
    () =>
      object?.tasks?.filter(
        (task): task is Task => task !== undefined && !!task?.content,
      ) ?? [],
    [object?.tasks],
  )

  const backlog = useMemo(
    () =>
      object?.backlog?.filter(
        (task): task is Task => task !== undefined && !!task?.content,
      ) ?? [],
    [object?.backlog],
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">
        What do you want to get done today?
      </h1>

      <div className="relative mb-4">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="text-red-500 bg-red-500/10 border-t border-x border-red-500/20 rounded-t-xl px-3 pt-2 -mb-2 pb-4 text-sm font-medium h-10"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {error.message}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="relative z-10 bg-card p-0 border border-border focus-within:border-primary rounded-xl">
          <Textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask Sidejot a question..."
            className="overflow-auto pb-1.5 text-sm placeholder:text-gray-500 resize-none"
          />

          <div className="flex items-center justify-between gap-2 p-2">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-accent cursor-not-allowed"
                    title="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
              <PlanHistory onSelect={setInputValue} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full dark:bg-neutral-800"
              onClick={handleGenerateTasks}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {object?.reasoning && <Reasoning reasoning={object.reasoning} />}

      {tasks.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-medium mb-2">Today</h2>
          <TaskList tasks={tasks} />
        </div>
      )}
      {backlog.length > 0 && (
        <div className="mt-4 opacity-50">
          <h2 className="text-lg font-medium mb-2">Backlog</h2>
          <TaskList tasks={backlog} />
        </div>
      )}

      {object?.notes && <Notes notes={object.notes} />}

      {!tasks.length && <Suggestions />}
    </div>
  )
}

const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task, i) => (
        <TaskCard key={i} task={task} />
      ))}
    </div>
  )
}

const TaskCard = ({ task }: { task: Task }) => {
  const handleStartDraftTask = async () => {
    await db.startTimerSession(task.content, TimerType.WORK)
  }

  const handleStop = async () => {
    await db.completeTimerSession(task.content, TimerEndType.INTERRUPTED)
  }

  const activeSession = useLiveQuery(() => db.getActiveSession())
  const isActive = activeSession?.content === task.content

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium">{task.content}</h3>
          {task.duration && (
            <p className="text-xs text-muted-foreground">
              {task.duration} minutes
            </p>
          )}
          {task.tags?.length ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags?.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-0.5 text-xs rounded-full bg-neutral-200 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {isActive ? (
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
            onClick={handleStop}
          >
            <PauseIcon className="h-4 w-4 text-blue-500" />
            <span className="sr-only">Stop Task</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
            onClick={handleStartDraftTask}
          >
            <PlayIcon className="h-4 w-4 text-primary" />
            <span className="sr-only">Start Task</span>
          </Button>
        )}
      </div>
    </div>
  )
}

const Reasoning = ({ reasoning }: { reasoning: string }) => {
  return (
    <div className="flex gap-4 items-start mt-4">
      <BrainCog className="size-6 min-w-6 mt-3.5 text-muted-foreground" />
      <Card className="text-sm flex-1">{reasoning}</Card>
    </div>
  )
}

const Notes = ({ notes }: { notes: string }) => {
  return (
    <div className="flex gap-4 items-start mt-4">
      <Lightbulb className="size-6 min-w-6 mt-3.5 text-muted-foreground" />
      <Card className="text-sm flex-1">{notes}</Card>
    </div>
  )
}

const Suggestions = () => {
  const [suggestions] = useState<string[]>([
    'Clean my room',
    'Write a blog post',
    'Learn something new',
  ])

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="ghost"
          className="text-xs p-2 rounded-full h-6"
        >
          <Sparkles className="h-3 w-3" />
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
