'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimePicker } from '@/components/ui/time-picker'
import { AI_CONFIG } from '@/lib/config'
import { db } from '@/lib/db'
import { Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Settings({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void
}) {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [model, setModel] = useState<string>(AI_CONFIG.defaultModel)

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const parseTime = (time: string) => {
    return Number.parseInt(time.split(':')[0])
  }

  useEffect(() => {
    async function loadPreferences() {
      const today = new Date()
      const plan = await db.getPlan(today)
      if (plan?.preferences) {
        const {
          workingHours,
          openRouterKey: savedKey,
          model: savedModel,
        } = plan.preferences
        if (workingHours) {
          const start = workingHours.start
          const end = workingHours.end
          setStartTime(formatTime(start))
          setEndTime(formatTime(end))
        }
        if (savedKey) {
          setOpenRouterKey(savedKey)
        }
        if (savedModel) {
          setModel(savedModel)
        }
      }
    }
    loadPreferences()
  }, [])

  const handleSave = async () => {
    const today = new Date()
    const plan = await db.getOrCreatePlan(today)
    await db.plans.update(plan.id!, {
      preferences: {
        workingHours: {
          start: parseTime(startTime),
          end: parseTime(endTime),
        },
        openRouterKey,
        model,
      },
    })
    setIsOpen(false)
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Working Hours</Label>
        <TimePicker
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />
      </div>

      <div className="grid gap-2  pt-4 border-t">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={AI_CONFIG.defaultModel}
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          The model to use for AI requests. Examples:{' '}
          {Object.values(AI_CONFIG.models).map((m, i) => (
            <span key={m}>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">{m}</code>
              {i < Object.values(AI_CONFIG.models).length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
        <Input
          id="openrouter-key"
          type="password"
          value={openRouterKey}
          onChange={(e) => setOpenRouterKey(e.target.value)}
          placeholder="Enter your OpenRouter API key"
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          Get your API key from{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:text-primary"
          >
            OpenRouter's dashboard
          </a>
          . OpenRouter provides access to hundreds of AI models from multiple providers.
        </p>
      </div>

      <Button onClick={handleSave} className="ml-auto">
        Save changes
      </Button>
    </div>
  )
}

export function SettingsPopup() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 px-0">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Settings setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
