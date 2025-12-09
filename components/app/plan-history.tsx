'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { db } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { History } from 'lucide-react'
import { toast } from 'sonner'

interface PlanHistoryProps {
  onSelect: (content: string) => void
}

export function PlanHistory({ onSelect }: PlanHistoryProps) {
  const history = useLiveQuery(async () => {
    return db.getChatHistory('task-generation', 5)
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <History className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {history?.length ? (
          history?.map((entry, i) => (
            <DropdownMenuItem
              key={i}
              className="flex flex-col items-start gap-1 py-2"
              onClick={() => {
                onSelect(entry.input as string)
                toast.success('Previous plan restored')
              }}
            >
              <div className="text-sm font-medium truncate w-full">
                {entry.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem>No history</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
