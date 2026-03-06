"use client"

import { useState } from "react"
import { Github, Linkedin, Mail, MapPin, Phone, FileText, GraduationCap } from "lucide-react"
import { TypingAnimation } from "@/components/typing-animation"
import { ScrollReveal } from "@/components/scroll-reveal"
import contactData from "@/data/contact.json"
import overviewData from "@/data/overview.json"
import rawResumeData from "@/data/resume.json"
import type { ResumeData } from "@/types/resume"

const resumeData = rawResumeData as ResumeData

const education = Array.isArray(resumeData.education) && resumeData.education.length > 0
  ? resumeData.education : null

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
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Terminal-style header */}
            <ScrollReveal direction="left" delay={0}>
              <div className="font-mono text-sm text-muted-foreground">
                <span className="text-[#66d9ef]">const</span>{" "}
                <span className="text-[#a6e22e]">developer</span>{" "}
                <span className="text-[#f92672]">=</span>{" "}
                <span className="text-foreground">{"{"}</span>
              </div>
            </ScrollReveal>

            {/* Name and Title */}
            <div className="pl-4 md:pl-8 space-y-6">
              <ScrollReveal direction="left" delay={100}>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2 hero-gradient-text">
                    {contactData.name}
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground font-mono">
                    I am <TypingAnimation roles={overviewData.roles} />
                  </p>
                </div>
              </ScrollReveal>

              {/* Tagline */}
              <ScrollReveal direction="left" delay={200}>
                <div className="space-y-2">
                  <p className="text-lg md:text-xl text-[#e6db74] font-mono">
                    {overviewData.headline}
                  </p>
                  <p className="text-muted-foreground">{overviewData.tagline}</p>
                </div>
              </ScrollReveal>

              {/* Bio */}
              <ScrollReveal direction="left" delay={300}>
                <p className="text-foreground/80 leading-relaxed max-w-2xl text-balance">
                  {overviewData.bio}
                </p>
              </ScrollReveal>

              {/* Resume Button & Contact Icons */}
              <ScrollReveal direction="up" delay={400}>
                <div className="flex flex-wrap items-center gap-4 pt-6">
                  {/* Resume Button */}
                  <a
                    href={resumeData.pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-2 px-6 py-3 bg-[#a6e22e] text-[#272822] font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(166,226,46,0.4)]"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <FileText size={16} className="relative z-10" />
                    <span className="font-mono relative z-10">View Resume</span>
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
              </ScrollReveal>
            </div>

            {/* Closing brace */}
            <ScrollReveal direction="left" delay={500}>
              <div className="font-mono text-sm text-foreground">
                <span>{"}"}</span>
                <span className="text-muted-foreground">;</span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column - Code Block & Education */}
          <div className="lg:col-span-2 space-y-6">
            {/* Floating Code Block */}
            <ScrollReveal direction="right" delay={200}>
              <div className="code-float bg-card/30 backdrop-blur-sm rounded-xl border border-border p-5 font-mono text-xs overflow-hidden">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#f92672]" />
                  <div className="w-3 h-3 rounded-full bg-[#e6db74]" />
                  <div className="w-3 h-3 rounded-full bg-[#a6e22e]" />
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <p><span className="text-[#f92672]">class</span> <span className="text-[#a6e22e]">AIEngineer</span>:</p>
                  <p className="pl-4"><span className="text-[#66d9ef]">def</span> <span className="text-[#a6e22e]">build</span>(self):</p>
                  <p className="pl-8"><span className="text-[#f92672]">return</span> <span className="text-[#e6db74]">&quot;production_ready&quot;</span></p>
                  <p className="pl-4"><span className="text-[#66d9ef]">def</span> <span className="text-[#a6e22e]">deploy</span>(self):</p>
                  <p className="pl-8"><span className="text-[#f92672]">return</span> <span className="text-[#e6db74]">&quot;scalable_systems&quot;</span></p>
                </div>
              </div>
            </ScrollReveal>

            {/* Education badge */}
            {education && (
              <ScrollReveal direction="right" delay={400}>
                <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-5">
                  <div className="flex items-start gap-3">
                    <GraduationCap size={20} className="text-[#ae81ff] mt-0.5 shrink-0" />
                    <div className="space-y-3">
                      {education.map((edu, i) => (
                        <div key={i}>
                          {edu.degree && (
                            <p className="text-sm font-semibold text-foreground">{edu.degree}</p>
                          )}
                          {edu.university && (
                            <p className="text-xs text-muted-foreground mt-0.5">{edu.university}</p>
                          )}
                          {edu.expectedGraduation && (
                            <p className="text-[#e6db74] font-mono text-xs mt-0.5">Expected {edu.expectedGraduation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Terminal activity block */}
            <ScrollReveal direction="right" delay={600}>
              <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-5 font-mono text-xs overflow-hidden">
                <p className="text-muted-foreground mb-2">
                  <span className="text-[#a6e22e]">$</span> git log --oneline -5
                </p>
                <div className="space-y-1 text-muted-foreground/70">
                  <p><span className="text-[#e6db74]">a1b2c3d</span> feat: deploy KG-RAG system</p>
                  <p><span className="text-[#e6db74]">e4f5g6h</span> fix: optimize vector search</p>
                  <p><span className="text-[#e6db74]">i7j8k9l</span> feat: add multi-agent pipeline</p>
                  <p><span className="text-[#e6db74]">m0n1o2p</span> perf: redis caching layer</p>
                  <p><span className="text-[#e6db74]">q3r4s5t</span> feat: auto review pipeline</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
