import type { ReactNode } from "react"
import { Header } from "@/components/data-room/Header"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-svh flex flex-col overflow-hidden bg-background text-foreground">
      <Header />
      <main className="flex-1 min-h-0 px-2 pb-4 md:pr-4 overflow-hidden">
        <section className="h-full flex flex-col min-h-0 rounded-[28px] bg-card px-4 py-5 shadow-sm md:px-6 overflow-hidden">
          {children}
        </section>
      </main>
    </div>
  )
}
