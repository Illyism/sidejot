import { MainNav } from '@/components/main-nav'
import { MobileNav } from '@/components/mobile-nav'
import { ModeSwitcher } from '@/components/mode-switcher'
import { ActiveSession } from './app/active-session'
import { SettingsPopup } from './app/settings'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <div className="flex h-14 items-center px-4">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <ActiveSession />
          <nav className="flex items-center gap-0.5">
            <SettingsPopup />
            <ModeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  )
}
