"use client"

import { useState, useEffect, useRef } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import skillsData from "@/data/skills.json"

function SkillTile({
  name,
  icon,
  color,
  onHover,
  onLeave,
}: {
  name: string
  icon: string
  color: string
  onHover: () => void
  onLeave: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex flex-col items-center group"
      onMouseEnter={() => {
        setHovered(true)
        onHover()
      }}
      onMouseLeave={() => {
        setHovered(false)
        onLeave()
      }}
      aria-label={name}
      role="img"
    >
      {/* Icon tile */}
      <div
        className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex flex-col items-center justify-center cursor-default transition-all duration-300 border select-none relative overflow-hidden"
        style={{
          backgroundColor: hovered ? `${color}22` : `${color}0a`,
          borderColor: hovered ? `${color}60` : `${color}18`,
          transform: hovered ? "translateY(-6px) scale(1.08)" : "translateY(0) scale(1)",
          boxShadow: hovered ? `0 16px 32px -8px ${color}25, 0 0 0 1px ${color}15` : "none",
        }}
      >
        {/* Glow backdrop on hover */}
        <div
          className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`,
          }}
        />
        <span
          className="text-2xl md:text-[28px] relative z-10 transition-transform duration-300"
          style={{ transform: hovered ? "scale(1.15)" : "scale(1)" }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          className="font-mono text-[9px] md:text-[10px] mt-0.5 relative z-10 transition-all duration-300 leading-none"
          style={{ color: hovered ? color : `${color}99` }}
          title={name}
        >
          {name.length > 8 ? name.slice(0, 7) + "…" : name}
        </span>
      </div>
    </div>
  )
}

/* Typing animation display for the hovered skill */
function SkillTypingDisplay({
  skill,
}: {
  skill: { name: string; icon: string; color: string } | null
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!skill) {
      setDisplayedText("")
      return
    }

    setDisplayedText("")
    let charIndex = 0
    const text = skill.name
    intervalRef.current = setInterval(() => {
      charIndex++
      setDisplayedText(text.slice(0, charIndex))
      if (charIndex >= text.length && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, 60)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [skill])

  /* Blink cursor */
  useEffect(() => {
    const blink = setInterval(() => setShowCursor((c) => !c), 530)
    return () => clearInterval(blink)
  }, [])

  const hasContent = skill && displayedText.length > 0

  return (
    <div
      className="flex items-center justify-center gap-3 h-16 transition-opacity duration-200"
      style={{ opacity: hasContent ? 1 : 0 }}
    >
      {skill && (
        <>
          <span className="text-3xl md:text-4xl">{skill.icon}</span>
          <span
            className="font-mono text-2xl md:text-3xl font-bold"
            style={{ color: skill.color }}
          >
            {displayedText}
            <span
              className="inline-block w-[3px] h-[1em] ml-0.5 align-middle rounded-sm"
              style={{
                backgroundColor: skill.color,
                opacity: showCursor ? 1 : 0,
              }}
            />
          </span>
        </>
      )}
    </div>
  )
}

export function SkillsSection() {
  const [hoveredSkill, setHoveredSkill] = useState<{
    name: string
    icon: string
    color: string
  } | null>(null)

  return (
    <section
      id="skills"
      className="section-snap min-h-screen w-full flex items-center px-6 md:px-16 py-24"
    >
      <div className="w-full max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-14">
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

        {/* Single unified skill grid */}
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-5 md:gap-6 justify-items-center pt-4">
            {skillsData.skills.map((skill) => (
              <SkillTile
                key={skill.name}
                name={skill.name}
                icon={skill.icon}
                color={skill.color}
                onHover={() => setHoveredSkill(skill)}
                onLeave={() => setHoveredSkill(null)}
              />
            ))}
          </div>
        </ScrollReveal>

        {/* Typing animation display below the grid */}
        <ScrollReveal direction="up" delay={200}>
          <div className="mt-10">
            <SkillTypingDisplay skill={hoveredSkill} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
