"use client"

import { useRef, useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { OverviewSection } from "@/components/sections/overview-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { SkillsSection } from "@/components/sections/skills-section"

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("overview")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Handle navigation click - scroll to section
  const handleNavigate = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "projects", "skills"]
      const viewportMiddle = window.scrollY + window.innerHeight / 2

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId)
        if (section) {
          const rect = section.getBoundingClientRect()
          const sectionTop = window.scrollY + rect.top
          const sectionBottom = sectionTop + rect.height

          if (viewportMiddle >= sectionTop && viewportMiddle < sectionBottom) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="relative">
      <Navigation activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Vertical Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="vertical-scroll pt-16"
      >
        <OverviewSection />
        <ProjectsSection />
        <SkillsSection />
      </div>

      {/* Section Indicators */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border z-50">
        {["overview", "projects", "skills"].map((section) => (
          <button
            key={section}
            onClick={() => handleNavigate(section)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeSection === section
                ? "w-6 bg-[#a6e22e]"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to ${section}`}
          />
        ))}
      </div>
    </main>
  )
}
