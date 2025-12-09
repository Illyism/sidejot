'use client'
import { TimerEndType, TimerType, db } from '@/lib/db'
import { cn } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { CoffeeIcon, TargetIcon, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'

const setFavicon = (emoji: string) => {
  const canvas = document.createElement('canvas')
  canvas.height = 32
  canvas.width = 32

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.font = '28px serif'
  ctx.fillText(emoji, 2, 24)

  const link =
    document.querySelector<HTMLLinkElement>('link[rel*="icon"]') ||
    document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'
  link.href = canvas.toDataURL()
  document.head.appendChild(link)
}

export function ActiveSession() {
  const activeSession = useLiveQuery(() => db.getActiveSession())
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!activeSession?.startTime) return

    const originalTitle = document.title
    const isWork = activeSession.type === TimerType.WORK
    const content = activeSession.content || (isWork ? 'Work' : 'Break')

    setFavicon(isWork ? '🎯' : '☕')

    const interval = setInterval(async () => {
      const elapsed = Date.now() - activeSession.startTime.getTime()
      const durationMs = activeSession.duration * 60 * 1000
      const newProgress = Math.min((elapsed / durationMs) * 100, 100)
      setProgress(newProgress)

      const remaining = Math.max(0, durationMs - elapsed)
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
      setTimeLeft(timeString)

      document.title = `${timeString} ${content} - Sidejot`

      if (elapsed >= durationMs) {
        clearInterval(interval)
        document.title = `${content} - Sidejot`
        setFavicon('✅')

        if (activeSession.type === TimerType.WORK) {
          const content = activeSession.content || 'Work'
          await db.completeTimerSession(
            activeSession.sessionId,
            TimerEndType.COMPLETED,
          )
          await db.startTimerSession(content, TimerType.BREAK)
        } else if (activeSession.type === TimerType.BREAK) {
          await db.completeTimerSession(
            activeSession.sessionId,
            TimerEndType.COMPLETED,
          )
          // the user has to click the button to start the next session
        }

        try {
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
          }
        } catch {
          // Ignore errors if vibrate is not supported
        }

        const audio = new Audio('/_static/Hero.aiff')
        audio.play().catch(() => {
          // Ignore errors if audio can't play
        })
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      document.title = originalTitle
      setFavicon('🐿️')
    }
  }, [
    activeSession?.startTime,
    activeSession?.content,
    activeSession?.duration,
    activeSession?.type,
    activeSession?.sessionId,
  ])

  if (!activeSession) return null

  const handleStop = async () => {
    await db.completeTimerSession(
      activeSession.sessionId,
      TimerEndType.INTERRUPTED,
    )
  }

  const isWork = activeSession.type === TimerType.WORK

  return (
    <div className="relative flex items-center gap-2 h-8 min-w-[140px] rounded-md border border-primary/20 bg-background px-2">
      {isWork ? (
        <TargetIcon className="h-3 w-3 text-primary animate-pulse" />
      ) : (
        <CoffeeIcon className="h-3 w-3 text-primary animate-pulse" />
      )}
      <span className="text-xs font-bold font-mono tracking-tight tabular-nums">
        {timeLeft}
      </span>
      {activeSession?.content && (
        <span className="text-xs font-medium tabular-nums tracking-tight">
          {activeSession.content}
        </span>
      )}
      <span
        className={cn(
          'rounded-full uppercase font-bold bg-primary/10 text-primary/50 text-[10px] px-2',
          isWork
            ? 'bg-green-500/20 text-green-500'
            : 'bg-orange-500/20 text-orange-500',
        )}
      >
        {activeSession.type}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-red-500/10 hover:text-red-500"
        onClick={handleStop}
      >
        <Trash className="h-3 w-3" />
      </Button>
      <Progress
        value={progress}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 rounded-none',
          isWork ? 'bg-primary/10' : 'bg-blue-500/10',
        )}
      />
    </div>
  )
}
