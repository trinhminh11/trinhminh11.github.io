"use client"

import { User, FolderGit2, Wrench } from "lucide-react"

interface NavigationProps {
  activeSection: string
  onNavigate: (section: string) => void
}

const navItems = [
  { id: "overview", label: "Overview", icon: User },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "skills", label: "Skills", icon: Wrench },
]

export function Navigation({ activeSection, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => onNavigate("overview")}>
            <span className="text-[#a6e22e] font-mono text-lg font-bold group-hover:text-[#66d9ef] transition-colors duration-300">{"<"}</span>
            <span className="font-mono font-semibold text-foreground">TTM</span>
            <span className="text-[#a6e22e] font-mono text-lg font-bold group-hover:text-[#66d9ef] transition-colors duration-300">{"/>"}</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm
                    transition-all duration-300
                    ${
                      isActive
                        ? "text-[#a6e22e]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#a6e22e] rounded-full nav-indicator" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative p-2 rounded-lg transition-all duration-300
                    ${
                      isActive
                        ? "text-[#a6e22e]"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                  aria-label={item.label}
                >
                  <Icon size={20} />
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#a6e22e] rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
