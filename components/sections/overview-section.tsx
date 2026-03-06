"use client"

import { useState } from "react"
import { Github, Linkedin, Mail, MapPin, Phone, FileText } from "lucide-react"
import { TypingAnimation } from "@/components/typing-animation"
import contactData from "@/data/contact.json"
import overviewData from "@/data/overview.json"
import resumeData from "@/data/resume.json"

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  github: Github,
  linkedin: Linkedin,
}

const DEFAULT_BG_COLOR = "#a6e22e"
const DEFAULT_OPACITY = "33"
const HOVER_OPACITY = "66"

export function OverviewSection() {
  const [hoveredContact, setHoveredContact] = useState<string | null>(null)

  return (
    <section
      id="overview"
      className="section-snap min-h-screen w-full flex items-center justify-center px-6 md:px-16 py-24"
    >
      <div className="max-w-4xl w-full space-y-8">
        {/* Terminal-style header */}
        <div className="font-mono text-sm text-muted-foreground">
          <span className="text-[#66d9ef]">const</span>{" "}
          <span className="text-[#a6e22e]">developer</span>{" "}
          <span className="text-[#f92672]">=</span>{" "}
          <span className="text-foreground">{"{"}</span>
        </div>

        {/* Name and Title */}
        <div className="pl-4 md:pl-8 space-y-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">
              {contactData.name}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-mono">
              I am <TypingAnimation roles={overviewData.roles} />
            </p>
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <p className="text-lg md:text-xl text-[#e6db74] font-mono">
              {overviewData.headline}
            </p>
            <p className="text-muted-foreground">{overviewData.tagline}</p>
          </div>

          {/* Bio */}
          <p className="text-foreground/80 leading-relaxed max-w-2xl text-balance">
            {overviewData.bio}
          </p>

          {/* Resume Button & Contact Icons */}
          <div className="flex flex-wrap items-center gap-4 pt-6">
            {/* Resume Button */}
            <a
              href={resumeData.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 bg-[#a6e22e] text-[#272822] font-semibold rounded-lg hover:bg-[#a6e22e]/90 transition-all duration-300"
            >
              <FileText size={16} />
              <span className="font-mono">View Resume</span>
            </a>

            {/* Contact Icons - Horizontal with hover expand */}
            <div className="flex items-center gap-2">
              {Object.entries(contactData)
                .filter(([key]) => key !== "name")
                .map(([key, value]) => {
                  if (typeof value === "object" && value !== null && "icon" in value) {
                    const Icon = iconMap[value.icon as string]
                    const href =
                      "url" in value
                        ? value.url
                        : key === "email"
                          ? `mailto:${value.value}`
                          : key === "phone"
                            ? `tel:${value.value}`
                            : undefined
                    const isHovered = hoveredContact === key
                    const bgColor = "backgroundColor" in value ? value.backgroundColor : DEFAULT_BG_COLOR
                    const bgWithOpacity = `${bgColor}${isHovered ? HOVER_OPACITY : DEFAULT_OPACITY}`
                    const textColor = isHovered && "hoverColor" in value ? value.hoverColor : undefined

                    return (
                      <a
                        key={key}
                        href={href}
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-2 p-3 rounded-lg transition-all duration-300 overflow-hidden"
                        onMouseEnter={() => setHoveredContact(key)}
                        onMouseLeave={() => setHoveredContact(null)}
                        style={{
                          maxWidth: isHovered ? "300px" : "48px",
                          transition: "max-width 0.3s ease-in-out, background-color 0.3s, color 0.3s",
                          backgroundColor: bgWithOpacity,
                          color: textColor,
                        }}
                      >
                        {Icon && <Icon size={20} className="shrink-0" />}
                        <span
                          className="font-mono text-sm whitespace-nowrap"
                          style={{
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.2s ease-in-out",
                          }}
                        >
                          {value.value}
                        </span>
                      </a>
                    )
                  }
                  return null
                })}
            </div>
          </div>
        </div>

        {/* Closing brace */}
        <div className="font-mono text-sm text-foreground">
          <span>{"}"}</span>
          <span className="text-muted-foreground">;</span>
        </div>
      </div>
    </section>
  )
}
