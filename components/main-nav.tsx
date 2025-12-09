'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icons } from '@/components/icons'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-1 lg:mr-6">
        <Icons.logo className="size-5" />
        <span className="hidden font-black uppercase italic lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Link
          href="/"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/' ? 'text-foreground' : 'text-foreground/60',
          )}
        >
          App
        </Link>
      </nav>
    </div>
  )
}
