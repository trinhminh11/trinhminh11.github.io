"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Brain, Server, Image, FileText, ExternalLink, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import projectsData from "@/data/projects.json"

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  brain: Brain,
  server: Server,
  image: Image,
  fileText: FileText,
}

const projectColors = [
  { border: "#a6e22e", bg: "rgba(166,226,46,0.08)", text: "#a6e22e" },
  { border: "#66d9ef", bg: "rgba(102,217,239,0.08)", text: "#66d9ef" },
  { border: "#f92672", bg: "rgba(249,38,114,0.08)", text: "#f92672" },
  { border: "#e6db74", bg: "rgba(230,219,116,0.08)", text: "#e6db74" },
]

const CARD_GAP = 24 // px gap between cards

export function ProjectsSection() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const total = projectsData.projects.length
  const hasLeft = current > 0
  const hasRight = current < total - 1

  // Measure card width from the viewport (card = 80% of viewport, max 1000px)
  useEffect(() => {
    const measure = () => {
      if (viewportRef.current) {
        const vw = viewportRef.current.offsetWidth
        setViewportWidth(vw)
        setCardWidth(Math.min(vw * 0.8, 1000))
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const slide = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating) return
      const next = direction === "left" ? current - 1 : current + 1
      if (next < 0 || next >= total) return
      setIsAnimating(true)
      setCurrent(next)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [current, total, isAnimating],
  )

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current) return
      setIsAnimating(true)
      setCurrent(index)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [current, isAnimating],
  )

  // The strip offset: center current card with adjacent cards peeking from sides
  const stripOffset = cardWidth > 0
    ? -(current * (cardWidth + CARD_GAP)) + (viewportWidth - cardWidth) / 2
    : 0

  return (
    <section
      id="projects"
      className="section-snap min-h-screen w-full flex items-center px-6 md:px-16 py-16"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              <span className="text-[#f92672]">{"// "}</span>
              Projects
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              Production systems that drive real business impact
            </p>
            <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#f92672] to-[#a6e22e]" />
          </div>
        </ScrollReveal>

        {/* Carousel */}
        <ScrollReveal direction="up" delay={100}>
          <div className="relative">
            {/* Navigation arrows */}
            {hasLeft && (
              <button
                onClick={() => slide("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#a6e22e]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(166,226,46,0.15)]"
                aria-label="Previous project"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {hasRight && (
              <button
                onClick={() => slide("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#a6e22e]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(166,226,46,0.15)]"
                aria-label="Next project"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Viewport — clips the horizontal strip */}
            <div ref={viewportRef} className="overflow-hidden rounded-xl">
              {/* Horizontal strip of equally-sized cards */}
              <div
                className="flex"
                style={{
                  gap: `${CARD_GAP}px`,
                  transform: `translateX(${stripOffset}px)`,
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {projectsData.projects.map((project, index) => {
                  const Icon = iconMap[project.icon] || Brain
                  const color = projectColors[index % projectColors.length]
                  const isCurrent = index === current

                  return (
                    <div
                      key={index}
                      className="flex-shrink-0"
                      style={{ width: `${cardWidth}px` }}
                    >
                      <div
                        className={`
                          project-card group relative bg-card/60 backdrop-blur-sm rounded-xl border border-border p-6 md:p-8 overflow-hidden h-full
                          transition-all duration-500
                          ${isCurrent ? "" : "opacity-40 scale-[0.95]"}
                        `}
                        style={{
                          borderLeftWidth: "4px",
                          borderLeftColor: color.border,
                          "--project-color": color.border,
                        } as React.CSSProperties}
                      >
                        {/* Project number badge */}
                        <div
                          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs md:text-sm font-bold opacity-20 group-hover:opacity-40 transition-opacity"
                          style={{ backgroundColor: color.bg, color: color.text }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        {/* Project Header */}
                        <div className="relative z-10 flex items-start justify-between mb-5">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div
                              className="p-2.5 md:p-3 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                              style={{ backgroundColor: color.bg }}
                            >
                              <span style={{ color: color.text }}> <Icon size={26} /> </span>
                            </div>
                            <div>
                              <h3 className="text-lg md:text-xl font-semibold text-foreground">{project.title}</h3>
                              <p className="text-sm md:text-base text-muted-foreground font-mono">
                                {project.company} • {project.period}
                              </p>
                            </div>
                          </div>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-muted-foreground hover:text-[#66d9ef] transition-all duration-300 hover:scale-110"
                              aria-label={`Visit ${project.company}`}
                            >
                              <ExternalLink size={20} />
                            </a>
                          )}
                        </div>

                        {/* Description */}
                        <p className="relative z-10 text-foreground/80 text-sm md:text-base mb-5 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Achievements */}
                        <div className="relative z-10 space-y-2.5 mb-5">
                          {project.achievements.map((achievement, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-sm md:text-base group/item">
                              <CheckCircle
                                size={16}
                                className="mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110"
                                style={{ color: color.text }}
                              />
                              <span className="text-muted-foreground group-hover/item:text-foreground/80 transition-colors">
                                {achievement}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="relative z-10 flex flex-wrap gap-2 md:gap-2.5">
                          {project.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-mono transition-all duration-300 hover:scale-105"
                              style={{ backgroundColor: `${color.border}10`, color: color.text }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {projectsData.projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === current ? "24px" : "8px",
                    height: "8px",
                    backgroundColor:
                      i === current
                        ? projectColors[i % projectColors.length].border
                        : `${projectColors[i % projectColors.length].border}40`,
                  }}
                  aria-label={`Go to project ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
