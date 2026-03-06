"use client"

import { useState } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import skillsData from "@/data/skills.json"

const categoryColors: Record<string, string> = {
  "Programming Languages": "#a6e22e",
  "AI/ML & Data": "#f92672",
  "MLOps & Cloud": "#66d9ef",
  Backend: "#e6db74",
}

/* Two-letter abbreviation for each skill icon tile */
const skillAbbrev: Record<string, string> = {
  Python: "Py",
  SQL: "SQ",
  Java: "Jv",
  "C/C++": "C+",
  LLMs: "LM",
  PyTorch: "PT",
  Langchain: "LC",
  LangGraph: "LG",
  Neo4j: "N4",
  Qdrant: "Qd",
  Milvus: "Mv",
  HuggingFace: "HF",
  Docker: "Dk",
  Kubernetes: "K8",
  "GitHub Actions": "GA",
  GCP: "GC",
  AWS: "AW",
  FastAPI: "FA",
  REST: "RE",
  WebSocket: "WS",
  PostgreSQL: "PG",
  Redis: "Rd",
  Celery: "Ce",
  Cassandra: "Ca",
  SSE: "SS",
  GitLab: "GL",
  "BLIP-v2": "BL",
  CLIP: "CL",
  NER: "NR",
  "Vertex AI": "VA",
}

function SkillTile({ name, color, delay }: { name: string; color: string; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const abbr = skillAbbrev[name] || name.slice(0, 2).toUpperCase()

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Skill name tooltip - above */}
      <span
        className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-xs whitespace-nowrap px-2 py-1 rounded-md pointer-events-none transition-all duration-300 z-10"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(6px)",
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        {name}
      </span>

      {/* Icon tile */}
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center cursor-default transition-all duration-300 border select-none"
        style={{
          backgroundColor: hovered ? `${color}20` : `${color}08`,
          borderColor: hovered ? `${color}60` : `${color}15`,
          transform: hovered ? "translateY(-8px) scale(1.15)" : "translateY(0) scale(1)",
          boxShadow: hovered ? `0 12px 24px -8px ${color}30` : "none",
        }}
      >
        <span
          className="font-mono font-bold text-lg md:text-xl transition-colors duration-300"
          style={{ color: hovered ? color : `${color}90` }}
        >
          {abbr}
        </span>
      </div>
    </div>
  )
}

export function SkillsSection() {
  /* Flatten all skills with their category color for the grid */
  const allSkills = skillsData.categories.flatMap((cat) =>
    cat.skills.map((skill) => ({
      ...skill,
      color: categoryColors[cat.name] || "#ae81ff",
      category: cat.name,
    }))
  )

  /* Extra / other technologies */
  const otherSkills = [
    "Cassandra", "SSE", "GitLab", "REST", "WebSocket",
    "BLIP-v2", "CLIP", "NER", "Vertex AI",
  ]

  return (
    <section
      id="skills"
      className="section-snap min-h-screen w-full flex items-center px-6 md:px-16 py-24"
    >
      <div className="w-full max-w-5xl mx-auto">
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

        {/* Legend */}
        <ScrollReveal direction="up" delay={50}>
          <div className="flex flex-wrap gap-4 mb-10">
            {skillsData.categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors[cat.name] || "#ae81ff" }}
                />
                <span className="text-xs font-mono text-muted-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Skills Icon Grid */}
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 md:gap-5 justify-items-center pt-6">
            {allSkills.map((skill, i) => (
              <SkillTile
                key={skill.name}
                name={skill.name}
                color={skill.color}
                delay={i * 30}
              />
            ))}
          </div>
        </ScrollReveal>

        {/* Other technologies row */}
        <ScrollReveal direction="up" delay={300}>
          <div className="mt-16 text-center">
            <p className="text-muted-foreground text-sm mb-6 font-mono">
              {"// "}Other technologies I&apos;ve worked with
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-9 gap-4 md:gap-5 justify-items-center pt-4">
              {otherSkills.map((name, i) => (
                <SkillTile
                  key={name}
                  name={name}
                  color="#ae81ff"
                  delay={i * 30}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
