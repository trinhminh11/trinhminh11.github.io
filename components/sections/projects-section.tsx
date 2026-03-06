"use client"

import { Brain, Server, Image, FileText, ExternalLink, CheckCircle } from "lucide-react"
import projectsData from "@/data/projects.json"

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  brain: Brain,
  server: Server,
  image: Image,
  fileText: FileText,
}

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="section-snap min-h-screen w-screen md:w-screen flex items-center px-6 md:px-16 py-24"
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <span className="text-[#f92672]">{"// "}</span>
            Projects
          </h2>
          <p className="text-muted-foreground font-mono text-sm">
            Production systems that drive real business impact
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectsData.projects.map((project, index) => {
            const Icon = iconMap[project.icon] || Brain
            const colors = [
              "border-[#a6e22e]",
              "border-[#66d9ef]",
              "border-[#f92672]",
              "border-[#e6db74]",
            ]
            const bgColors = [
              "bg-[#a6e22e]/10",
              "bg-[#66d9ef]/10",
              "bg-[#f92672]/10",
              "bg-[#e6db74]/10",
            ]
            const textColors = [
              "text-[#a6e22e]",
              "text-[#66d9ef]",
              "text-[#f92672]",
              "text-[#e6db74]",
            ]

            return (
              <div
                key={index}
                className={`group bg-card rounded-xl border-l-4 ${colors[index % 4]} border border-border p-6 card-glow`}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColors[index % 4]}`}>
                      <Icon size={24} className={textColors[index % 4]} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-[#a6e22e] transition-colors">
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
                      className="p-2 text-muted-foreground hover:text-[#66d9ef] transition-colors"
                      aria-label={`Visit ${project.company}`}
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>

                {/* Description */}
                <p className="text-foreground/80 text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Achievements */}
                <div className="space-y-2 mb-4">
                  {project.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={14} className="text-[#a6e22e] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{achievement}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-muted rounded text-xs font-mono text-[#ae81ff]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
