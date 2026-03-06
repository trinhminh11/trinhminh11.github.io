"use client"

import { useEffect, useRef, useState } from "react"
import { Code, Brain, Cloud, Server } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import skillsData from "@/data/skills.json"

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  code: Code,
  brain: Brain,
  cloud: Cloud,
  server: Server,
}

const categoryColors: Record<string, { bg: string; text: string; bar: string; glow: string }> = {
  "Programming Languages": { bg: "rgba(166,226,46,0.1)", text: "#a6e22e", bar: "#a6e22e", glow: "rgba(166,226,46,0.3)" },
  "AI/ML & Data": { bg: "rgba(249,38,114,0.1)", text: "#f92672", bar: "#f92672", glow: "rgba(249,38,114,0.3)" },
  "MLOps & Cloud": { bg: "rgba(102,217,239,0.1)", text: "#66d9ef", bar: "#66d9ef", glow: "rgba(102,217,239,0.3)" },
  Backend: { bg: "rgba(230,219,116,0.1)", text: "#e6db74", bar: "#e6db74", glow: "rgba(230,219,116,0.3)" },
}

function AnimatedBar({ proficiency, color, delay }: { proficiency: number; color: string; delay: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  const proficiencyRef = useRef(proficiency)
  const delayRef = useRef(delay)
  proficiencyRef.current = proficiency
  delayRef.current = delay

  useEffect(() => {
    const el = barRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(proficiencyRef.current), delayRef.current)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={barRef} className="h-2 bg-muted/50 rounded-full overflow-hidden relative">
      <div
        className="h-full rounded-full transition-all ease-out relative"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transitionDuration: "1200ms",
          boxShadow: width > 0 ? `0 0 8px ${color}40` : "none",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
            animation: width > 0 ? "shimmer 2s infinite" : "none",
          }}
        />
      </div>
    </div>
  )
}

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="section-snap min-h-screen w-full flex items-center px-6 md:px-16 py-24"
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              <span className="text-[#66d9ef]">{"// "}</span>
              Technical Skills
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              Technologies I work with daily
            </p>
            <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#66d9ef] to-[#ae81ff]" />
          </div>
        </ScrollReveal>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillsData.categories.map((category, categoryIndex) => {
            const Icon = iconMap[category.icon] || Code
            const colors = categoryColors[category.name] || {
              bg: "rgba(174,129,255,0.1)",
              text: "#ae81ff",
              bar: "#ae81ff",
              glow: "rgba(174,129,255,0.3)",
            }

            return (
              <ScrollReveal
                key={categoryIndex}
                direction={categoryIndex % 2 === 0 ? "left" : "right"}
                delay={categoryIndex * 100}
              >
                <div
                  className="skill-card group bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 transition-all duration-500 hover:shadow-lg"
                  style={{ "--skill-glow": colors.glow } as React.CSSProperties}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <Icon size={24} style={{ color: colors.text }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {category.skills.length} technologies
                      </p>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-4">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="group/skill">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-mono text-foreground group-hover/skill:text-foreground transition-colors">
                            {skill.name}
                          </span>
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{ color: colors.text }}
                          >
                            {skill.proficiency}%
                          </span>
                        </div>
                        <AnimatedBar
                          proficiency={skill.proficiency}
                          color={colors.bar}
                          delay={skillIndex * 80}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Additional Skills Tags */}
        <ScrollReveal direction="up" delay={400}>
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
              ].map((tech, i) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-muted/50 backdrop-blur-sm rounded-full text-sm font-mono text-foreground/70 hover:text-[#ae81ff] hover:bg-[#ae81ff]/10 transition-all duration-300 cursor-default hover:scale-105 border border-transparent hover:border-[#ae81ff]/20"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
