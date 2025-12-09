'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface TimePickerProps {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  className?: string
}

export function TimePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  className,
}: TimePickerProps) {
  // Generate times in 15 minute increments
  const times = React.useMemo(() => {
    const result = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        result.push(time)
      }
    }
    return result
  }, [])

  // Filter end times to only show times after start time
  const availableEndTimes = React.useMemo(() => {
    const startIndex = times.indexOf(startTime)
    return times.slice(startIndex + 1)
  }, [times, startTime])

  const handleStartTimeChange = (newTime: string) => {
    onStartTimeChange(newTime)

    // If end time is now before start time, update it
    if (newTime >= endTime) {
      const startIndex = times.indexOf(newTime)
      const nextTime = times[startIndex + 1] || times[startIndex]
      onEndTimeChange(nextTime)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={startTime} onValueChange={handleStartTimeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue>{startTime}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {times.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">-</span>

      <Select value={endTime} onValueChange={onEndTimeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue>{endTime}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableEndTimes.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
