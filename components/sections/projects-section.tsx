"use client"

import { useState, useCallback } from "react"
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

const PEEK_WIDTH = "60px"

export function ProjectsSection() {
  const [current, setCurrent] = useState(0)
  const [sliding, setSliding] = useState<"left" | "right" | null>(null)
  const total = projectsData.projects.length
  const hasLeft = current > 0
  const hasRight = current < total - 1

  const slide = useCallback(
    (direction: "left" | "right") => {
      if (sliding) return
      const next = direction === "left" ? current - 1 : current + 1
      if (next < 0 || next >= total) return
      setSliding(direction)
      setTimeout(() => {
        setCurrent(next)
        setSliding(null)
      }, 400)
    },
    [current, total, sliding],
  )

  /* Render a single project card */
  const renderCard = (index: number, role: "prev" | "current" | "next") => {
    const project = projectsData.projects[index]
    if (!project) return null
    const Icon = iconMap[project.icon] || Brain
    const color = projectColors[index % projectColors.length]

    const isPeek = role !== "current"

    return (
      <div
        className={`
          project-card group relative bg-card/60 backdrop-blur-sm rounded-xl border border-border p-6 overflow-hidden
          ${isPeek ? "opacity-40 scale-[0.92] pointer-events-none select-none" : ""}
        `}
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: color.border,
          "--project-color": color.border,
          transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",
        } as React.CSSProperties}
      >
        {/* Project number badge */}
        <div
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Project Header */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ backgroundColor: color.bg }}
            >
              <span style={{ color: color.text }}><Icon size={24} className="text-current" /></span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
              <p className="text-sm text-muted-foreground font-mono">
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
              <ExternalLink size={18} />
            </a>
          )}
        </div>

        {/* Description */}
        <p className="relative z-10 text-foreground/80 text-sm mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Achievements */}
        <div className="relative z-10 space-y-2 mb-4">
          {project.achievements.map((achievement, i) => (
            <div key={i} className="flex items-start gap-2 text-sm group/item">
              <CheckCircle
                size={14}
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
        <div className="relative z-10 flex flex-wrap gap-2">
          {project.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-xs font-mono transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: `${color.border}10`, color: color.text }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section
      id="projects"
      className="section-snap min-h-screen w-full flex items-center py-24"
    >
      <div className="w-full max-w-[100vw] px-6 md:px-16">
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
                className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#a6e22e]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(166,226,46,0.15)]"
                aria-label="Previous project"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {hasRight && (
              <button
                onClick={() => slide("right")}
                className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#a6e22e]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(166,226,46,0.15)]"
                aria-label="Next project"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Cards row: prev-peek | current | next-peek */}
            <div className="overflow-hidden rounded-xl">
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `${hasLeft ? PEEK_WIDTH : "0px"} 1fr ${hasRight ? PEEK_WIDTH : "0px"}`,
                  transition: "grid-template-columns 0.4s ease",
                }}
              >
                {/* Left peek */}
                <div className="overflow-hidden min-w-0">
                  {hasLeft && (
                    <div
                      style={{
                        transform: sliding === "right" ? "translateX(100%)" : "translateX(0)",
                        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      {renderCard(current - 1, "prev")}
                    </div>
                  )}
                </div>

                {/* Main card */}
                <div
                  className="min-w-0"
                  style={{
                    transform:
                      sliding === "left"
                        ? "translateX(40px)"
                        : sliding === "right"
                          ? "translateX(-40px)"
                          : "translateX(0)",
                    opacity: sliding ? 0.6 : 1,
                    transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",
                  }}
                >
                  {renderCard(current, "current")}
                </div>

                {/* Right peek */}
                <div className="overflow-hidden min-w-0">
                  {hasRight && (
                    <div
                      style={{
                        transform: sliding === "left" ? "translateX(-100%)" : "translateX(0)",
                        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      {renderCard(current + 1, "next")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {projectsData.projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i !== current && !sliding) {
                      setSliding(i > current ? "right" : "left")
                      setTimeout(() => {
                        setCurrent(i)
                        setSliding(null)
                      }, 400)
                    }
                  }}
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
