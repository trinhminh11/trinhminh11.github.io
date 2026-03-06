"use client"

import { useRef, useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ScrollProgress } from "@/components/scroll-progress"
import { AnimatedBackground } from "@/components/animated-background"
import { OverviewSection } from "@/components/sections/overview-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { SkillsSection } from "@/components/sections/skills-section"
import { FooterSection } from "@/components/sections/footer-section"

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
      <AnimatedBackground />
      <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
      <ScrollProgress />

      {/* Vertical Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="vertical-scroll pt-16 relative z-10"
      >
        <OverviewSection />
        <ProjectsSection />
        <SkillsSection />
        <FooterSection />
      </div>

      {/* Section Indicators */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/60 backdrop-blur-xl px-4 py-2 rounded-full border border-border/50 z-50 shadow-lg">
        {["overview", "projects", "skills"].map((section) => (
          <button
            key={section}
            onClick={() => handleNavigate(section)}
            className={`rounded-full transition-all duration-500 ${
              activeSection === section
                ? "w-8 h-2 bg-[#a6e22e] shadow-[0_0_10px_rgba(166,226,46,0.5)]"
                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to ${section}`}
          />
        ))}
      </div>
    </main>
  )
}
