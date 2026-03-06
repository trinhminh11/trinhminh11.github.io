"use client"

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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const currentRole = roles[roleIndex]

  const tick = useCallback(() => {
    if (isPaused) return

    if (isDeleting) {
      setDisplayText((prev) => prev.slice(0, -1))
      if (displayText === "") {
        setIsDeleting(false)
        setRoleIndex((prev) => (prev + 1) % roles.length)
      }
    } else {
      setDisplayText((prev) => currentRole.slice(0, prev.length + 1))
      if (displayText === currentRole) {
        setIsPaused(true)
        setTimeout(() => {
          setIsPaused(false)
          setIsDeleting(true)
        }, pauseDuration)
      }
    }
  }, [displayText, isDeleting, isPaused, currentRole, roles.length, pauseDuration])

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed
    const timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
  }, [tick, isDeleting, typingSpeed, deletingSpeed])

  return (
    <span className="inline-flex items-center">
      <span className="text-[#a6e22e]">{displayText}</span>
      <span className="cursor-blink ml-0.5 text-[#f8f8f2] font-light">|</span>
    </span>
  )
}
