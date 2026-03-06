"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import skillsData from "@/data/skills.json"

interface Skill {
  name: string
  icon: string
  color: string
  proficiency: number
  description: string
}

const skills = skillsData.skills as Skill[]

/* SVG Star Icons — full, half-filled, and empty */
function StarIcon({ type, color, index }: { type: "full" | "half" | "empty"; color: string; index: number }) {
  const d = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  const size = 20

  if (type === "full") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d={d} />
      </svg>
    )
  }

  if (type === "half") {
    const clipId = `star-half-${color.replace("#", "")}-${index}`
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
        <path d={d} fill={color} clipPath={`url(#${clipId})`} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
    </svg>
  )
}

/* Proficiency stars — renders instantly, no animation */
function ProficiencyStars({ proficiency, color }: { proficiency: number; color: string }) {
  const full = Math.floor(proficiency)
  const hasHalf = proficiency % 1 >= 0.5

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        let type: "full" | "half" | "empty"
        if (i < full) type = "full"
        else if (i === full && hasHalf) type = "half"
        else type = "empty"
        return <StarIcon key={i} type={type} color={color} index={i} />
      })}
    </div>
  )
}

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
      <div
        className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex flex-col items-center justify-center cursor-default transition-all duration-300 border select-none relative overflow-hidden"
        style={{
          backgroundColor: hovered ? `${color}22` : `${color}0a`,
          borderColor: hovered ? `${color}60` : `${color}18`,
          transform: hovered ? "translateY(-6px) scale(1.08)" : "translateY(0) scale(1)",
          boxShadow: hovered ? `0 16px 32px -8px ${color}25, 0 0 0 1px ${color}15` : "none",
        }}
      >
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

/* ------------------------------------------------------------------ */
/*  Skill Info Box — right-side panel with typing animation + stars   */
/* ------------------------------------------------------------------ */

function SkillInfoBox({ hoveredSkill }: { hoveredSkill: Skill | null }) {
  const [displaySkill, setDisplaySkill] = useState<Skill | null>(null)
  const [displayedName, setDisplayedName] = useState("")
  const [displayedDesc, setDisplayedDesc] = useState("")
  const [isTypingName, setIsTypingName] = useState(false)
  const [isTypingDesc, setIsTypingDesc] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  const animRef = useRef<{ cancel: boolean }>({ cancel: false })
  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCycleIdx = useRef(-1)
  const lastHoveredRef = useRef<Skill | null>(null)

  /* helpers -------------------------------------------------------- */
  const clearCycleTimeout = useCallback(() => {
    if (cycleTimeoutRef.current) {
      clearTimeout(cycleTimeoutRef.current)
      cycleTimeoutRef.current = null
    }
  }, [])

  const pickRandom = useCallback((): Skill => {
    let idx: number
    do { idx = Math.floor(Math.random() * skills.length) }
    while (idx === lastCycleIdx.current && skills.length > 1)
    lastCycleIdx.current = idx
    return skills[idx]
  }, [])

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

  /* show skill with typing animation (used on unhover) ------------ */
  const showSkillAnimated = useCallback(
    async (skill: Skill, tok: { cancel: boolean }) => {
      setDisplaySkill(skill)
      setDisplayedName("")
      setDisplayedDesc("")

      // type name
      setIsTypingName(true)
      for (let i = 1; i <= skill.name.length; i++) {
        if (tok.cancel) return
        setDisplayedName(skill.name.slice(0, i))
        await sleep(50)
      }
      setIsTypingName(false)

      await sleep(200)
      if (tok.cancel) return

      // type description
      setIsTypingDesc(true)
      for (let i = 1; i <= skill.description.length; i++) {
        if (tok.cancel) return
        setDisplayedDesc(skill.description.slice(0, i))
        await sleep(18)
      }
      setIsTypingDesc(false)
    },
    [],
  )

  /* type text forward --------------------------------------------- */
  const animateSkill = useCallback(
    async (skill: Skill, tok: { cancel: boolean }) => {
      setDisplaySkill(skill)
      setDisplayedName("")
      setDisplayedDesc("")

      // type name
      setIsTypingName(true)
      for (let i = 1; i <= skill.name.length; i++) {
        if (tok.cancel) return
        setDisplayedName(skill.name.slice(0, i))
        await sleep(50)
      }
      setIsTypingName(false)

      await sleep(200)
      if (tok.cancel) return

      // type description
      setIsTypingDesc(true)
      for (let i = 1; i <= skill.description.length; i++) {
        if (tok.cancel) return
        setDisplayedDesc(skill.description.slice(0, i))
        await sleep(18)
      }
      setIsTypingDesc(false)
    },
    [],
  )

  /* delete text backward ------------------------------------------ */
  const deleteSkill = useCallback(
    async (skill: Skill, tok: { cancel: boolean }) => {
      // delete description
      setIsTypingDesc(true)
      for (let i = skill.description.length - 1; i >= 0; i--) {
        if (tok.cancel) return
        setDisplayedDesc(skill.description.slice(0, i))
        await sleep(10)
      }
      setDisplayedDesc("")
      setIsTypingDesc(false)

      // delete name
      setIsTypingName(true)
      for (let i = skill.name.length - 1; i >= 0; i--) {
        if (tok.cancel) return
        setDisplayedName(skill.name.slice(0, i))
        await sleep(30)
      }
      setDisplayedName("")
      setIsTypingName(false)
    },
    [],
  )

  /* auto-cycle loop ----------------------------------------------- */
  const startCycle = useCallback(
    async (tok: { cancel: boolean }) => {
      while (!tok.cancel) {
        const skill = pickRandom()
        await animateSkill(skill, tok)
        if (tok.cancel) return

        await sleep(3000)
        if (tok.cancel) return

        await deleteSkill(skill, tok)
        if (tok.cancel) return

        await sleep(400)
      }
    },
    [animateSkill, deleteSkill, pickRandom],
  )

  /* animate unhover then resume cycling ----------------------------- */
  const animateUnhoverThenCycle = useCallback(
    async (skill: Skill, tok: { cancel: boolean }) => {
      await showSkillAnimated(skill, tok)
      if (tok.cancel) return
      cycleTimeoutRef.current = setTimeout(() => {
        if (!tok.cancel) startCycle(tok)
      }, 2500)
    },
    [showSkillAnimated, startCycle],
  )

  /* react to hover changes ---------------------------------------- */
  useEffect(() => {
    animRef.current.cancel = true
    clearCycleTimeout()

    const tok = { cancel: false }
    animRef.current = tok

    if (hoveredSkill) {
      // on hover: cancel current animation, show hovered skill with typing
      lastHoveredRef.current = hoveredSkill
      animateSkill(hoveredSkill, tok)
    } else {
      // on unhover: animate the last-hovered skill with typing, then after a
      // pause resume auto-cycling
      const last = lastHoveredRef.current
      if (last) {
        animateUnhoverThenCycle(last, tok)
      } else {
        cycleTimeoutRef.current = setTimeout(() => {
          if (!tok.cancel) startCycle(tok)
        }, 300)
      }
    }

    return () => {
      tok.cancel = true
      clearCycleTimeout()
    }
  }, [hoveredSkill, animateSkill, animateUnhoverThenCycle, startCycle, clearCycleTimeout])

  /* cursor blink -------------------------------------------------- */
  useEffect(() => {
    const id = setInterval(() => setShowCursor(c => !c), 530)
    return () => clearInterval(id)
  }, [])

  const cursorOpacity = showCursor ? 1 : 0

  /* render -------------------------------------------------------- */
  return (
    <div
      className="bg-card/40 backdrop-blur-sm rounded-xl border border-border p-5 md:p-6 flex flex-col min-h-[260px] lg:h-full transition-colors duration-500"
      style={{
        borderColor: displaySkill ? `${displaySkill.color}30` : undefined,
        boxShadow: displaySkill ? `0 0 40px -12px ${displaySkill.color}15` : undefined,
      }}
    >
      {/* terminal chrome */}
      <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-border/50">
        <div className="w-2.5 h-2.5 rounded-full bg-[#f92672]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#e6db74]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#a6e22e]" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">skill_details.py</span>
      </div>

      {displaySkill ? (
        <div className="flex-1 flex flex-col gap-3 md:gap-4">
          {/* icon + name + stars */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl md:text-4xl">{displaySkill.icon}</span>
            <span
              className="font-mono text-xl md:text-2xl font-bold"
              style={{ color: displaySkill.color }}
            >
              {displayedName}
              {isTypingName && (
                <span
                  className="inline-block w-[3px] h-[0.85em] ml-0.5 align-middle rounded-sm"
                  style={{ backgroundColor: displaySkill.color, opacity: cursorOpacity }}
                />
              )}
            </span>
            {/* proficiency stars — right-aligned, static instant change */}
            <div className="ml-auto">
              <ProficiencyStars proficiency={displaySkill.proficiency} color={displaySkill.color} />
            </div>
          </div>

          {/* description */}
          <p className="text-base md:text-lg text-foreground/70 font-mono leading-relaxed">
            {displayedDesc}
            {isTypingDesc && (
              <span
                className="inline-block w-[2px] h-[0.85em] ml-0.5 align-middle rounded-sm"
                style={{ backgroundColor: displaySkill.color, opacity: cursorOpacity }}
              />
            )}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-mono text-sm text-center">
            Hover over a skill to explore…
          </p>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Skills Section                                                    */
/* ================================================================== */

export function SkillsSection() {
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null)

  return (
    <section
      id="skills"
      className="section-snap min-h-screen w-full flex items-center px-6 md:px-16 py-16"
    >
      <div className="w-full max-w-7xl mx-auto">
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

        {/* Two-column layout: grid | info box */}
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
            {/* Left — skill grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 md:gap-5 justify-items-center">
                {skills.map((skill) => (
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
            </div>

            {/* Right — info box */}
            <div className="lg:col-span-2">
              <SkillInfoBox hoveredSkill={hoveredSkill} />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
