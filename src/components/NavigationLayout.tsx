'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Activity, Bot, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
]

export function NavigationLayout({ children, userEmail }: { children: React.ReactNode, userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  // If we are on the login page, just render children without navigation
  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border shadow-sm z-10">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-6 bg-primary text-primary-foreground font-bold tracking-tight text-xl">
            SmartDeFi
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-3 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex items-center border-t border-border p-4">
             <div className="flex-1 w-full flex flex-col items-start truncate space-y-3">
               {userEmail && <span className="text-xs text-muted-foreground truncate w-full px-2">{userEmail}</span>}
               <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                 <LogOut className="mr-3 h-4 w-4" />
                 Sign out
               </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden md:pl-64">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between bg-primary p-4 text-primary-foreground shadow-sm">
          <div className="text-xl font-bold">SmartDeFi</div>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-b border-border absolute top-[72px] inset-x-0 z-50 shadow-lg">
            <nav className="px-4 pt-2 pb-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon className="mr-4 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                   <LogOut className="mr-4 h-5 w-5" />
                   Sign out
                </Button>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-background">
          <div className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
