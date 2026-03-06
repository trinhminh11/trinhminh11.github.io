"use client"

import { Code, Brain, Cloud, Server } from "lucide-react"
import skillsData from "@/data/skills.json"

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  code: Code,
  brain: Brain,
  cloud: Cloud,
  server: Server,
}

const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
  "Programming Languages": { bg: "bg-[#a6e22e]/10", text: "text-[#a6e22e]", bar: "bg-[#a6e22e]" },
  "AI/ML & Data": { bg: "bg-[#f92672]/10", text: "text-[#f92672]", bar: "bg-[#f92672]" },
  "MLOps & Cloud": { bg: "bg-[#66d9ef]/10", text: "text-[#66d9ef]", bar: "bg-[#66d9ef]" },
  Backend: { bg: "bg-[#e6db74]/10", text: "text-[#e6db74]", bar: "bg-[#e6db74]" },
}

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="section-snap min-h-screen w-screen md:w-screen flex items-center px-6 md:px-16 py-24"
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <span className="text-[#66d9ef]">{"// "}</span>
            Technical Skills
          </h2>
          <p className="text-muted-foreground font-mono text-sm">
            Technologies I work with daily
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillsData.categories.map((category, categoryIndex) => {
            const Icon = iconMap[category.icon] || Code
            const colors = categoryColors[category.name] || {
              bg: "bg-[#ae81ff]/10",
              text: "text-[#ae81ff]",
              bar: "bg-[#ae81ff]",
            }

            return (
              <div
                key={categoryIndex}
                className="bg-card rounded-xl border border-border p-6 card-glow"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon size={24} className={colors.text} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono text-foreground">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full skill-bar`}
                          style={{ "--bar-width": `${skill.proficiency}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Skills Tags */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm mb-4 font-mono">
            {"// "}Other technologies I&apos;ve worked with
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Cassandra",
              "SSE",
              "GitLab",
              "REST",
              "WebSocket",
              "BLIP-v2",
              "CLIP",
              "NER",
              "Vertex AI",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-muted rounded-full text-sm font-mono text-foreground/70 hover:text-[#ae81ff] hover:bg-[#ae81ff]/10 transition-colors cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
