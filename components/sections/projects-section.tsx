"use client"

import { Brain, Server, Image, FileText, ExternalLink, CheckCircle } from "lucide-react"
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

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="section-snap min-h-screen w-full flex items-center px-6 md:px-16 py-24"
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-12">
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

        {/* Projects Grid with Timeline */}
        <div className="relative">
          {/* Timeline connector on desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#a6e22e]/30 via-[#66d9ef]/30 to-[#f92672]/30" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projectsData.projects.map((project, index) => {
              const Icon = iconMap[project.icon] || Brain
              const color = projectColors[index % projectColors.length]

              return (
                <ScrollReveal
                  key={index}
                  direction={index % 2 === 0 ? "left" : "right"}
                  delay={index * 150}
                >
                  <div
                    className="project-card group relative bg-card/60 backdrop-blur-sm rounded-xl border border-border p-6 transition-all duration-500 hover:border-opacity-60 overflow-hidden"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: color.border,
                      "--project-color": color.border,
                    } as React.CSSProperties}
                  >
                    {/* Hover glow effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color.bg}, transparent 40%)`,
                      }}
                    />

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
                          <Icon size={24} style={{ color: color.text }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground transition-colors duration-300"
                            style={{ "--hover-color": color.text } as React.CSSProperties}
                          >
                            {project.title}
                          </h3>
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
                          style={{
                            backgroundColor: `${color.border}10`,
                            color: color.text,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
