import { useState, useEffect, useCallback } from "react"

interface TypingAnimationProps {
  roles: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
}

export function TypingAnimation({
  roles,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState("")
  const [roleIndex, setRoleIndex] = useState(0)
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing")

  const currentRole = roles[roleIndex]

  const tick = useCallback(() => {
    if (phase === "typing") {
      if (displayText.length < currentRole.length) {
        setDisplayText(currentRole.slice(0, displayText.length + 1))
      } else {
        setPhase("pausing")
      }
    } else if (phase === "deleting") {
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1))
      } else {
        setRoleIndex((i) => (i + 1) % roles.length)
        setPhase("typing")
      }
    }
  }, [phase, displayText, currentRole, roles.length])

  useEffect(() => {
    if (phase === "pausing") {
      const timeout = setTimeout(() => setPhase("deleting"), pauseDuration)
      return () => clearTimeout(timeout)
    }

    const speed = phase === "typing" ? typingSpeed : deletingSpeed
    const timeout = setTimeout(tick, speed)
    return () => clearTimeout(timeout)
  }, [phase, tick, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className="inline-flex items-center">
      {/* Static space — never typed, never deleted, never collapses */}
      <span>&nbsp;</span>
      <span>{displayText}</span>
      <span className="ml-0.5 inline-block w-[2px] h-[1.1em] bg-current align-middle animate-[blink_1s_step-end_infinite]" />
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  )
}
