"use client"

import { useRef, useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { OverviewSection } from "@/components/sections/overview-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { SkillsSection } from "@/components/sections/skills-section"

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("overview")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle navigation click
  const handleNavigate = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      if (isMobile) {
        section.scrollIntoView({ behavior: "smooth" })
      } else {
        const container = scrollContainerRef.current
        if (container) {
          const sectionIndex = ["overview", "projects", "skills"].indexOf(sectionId)
          container.scrollTo({
            left: sectionIndex * window.innerWidth,
            behavior: "smooth",
          })
        }
      }
    }
  }

  // Track active section on scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || isMobile) return

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft
      const sectionWidth = window.innerWidth
      const sectionIndex = Math.round(scrollPosition / sectionWidth)
      const sections = ["overview", "projects", "skills"]
      setActiveSection(sections[sectionIndex] || "overview")
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [isMobile])

  // Track active section on mobile scroll
  useEffect(() => {
    if (!isMobile) return

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
  }, [isMobile])

  return (
    <main className="relative">
      <Navigation activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Horizontal Scroll Container (Desktop) / Vertical Stack (Mobile) */}
      <div
        ref={scrollContainerRef}
        className="horizontal-scroll h-screen w-screen pt-16"
      >
        <OverviewSection />
        <ProjectsSection />
        <SkillsSection />
      </div>

      {/* Section Indicators (Desktop only) */}
      <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
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
