"use client"

import { BookOpen, Trophy, GraduationCap, Heart } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import resumeData from "@/data/resume.json"
import contactData from "@/data/contact.json"

export function FooterSection() {
  return (
    <footer
      id="footer"
      className="w-full px-6 md:px-16 py-24 border-t border-border/50"
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              <span className="text-[#ae81ff]">{"// "}</span>
              More About Me
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              Education, publications, and achievements
            </p>
            <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#ae81ff] to-[#e6db74]" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Education */}
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 h-full group hover:border-[#e6db74]/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-[#e6db74]/10 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap size={24} className="text-[#e6db74]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Education</h3>
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-semibold text-sm">{resumeData.education.degree}</p>
                <p className="text-muted-foreground text-sm">{resumeData.education.university}</p>
                <p className="text-[#e6db74] font-mono text-xs">Expected {resumeData.education.expectedGraduation}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Publications */}
          <ScrollReveal direction="up" delay={200}>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 h-full group hover:border-[#66d9ef]/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-[#66d9ef]/10 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={24} className="text-[#66d9ef]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Publications</h3>
              </div>
              <div className="space-y-4">
                {resumeData.publications.map((pub, i) => (
                  <div key={i} className="border-l-2 border-[#66d9ef]/30 pl-3 hover:border-[#66d9ef] transition-colors">
                    <p className="text-foreground/90 text-sm leading-snug">{pub.title}</p>
                    <p className="text-muted-foreground text-xs mt-1 font-mono">{pub.venue} • {pub.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Awards */}
          <ScrollReveal direction="up" delay={300}>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 h-full group hover:border-[#f92672]/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-[#f92672]/10 group-hover:scale-110 transition-transform duration-300">
                  <Trophy size={24} className="text-[#f92672]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Awards</h3>
              </div>
              <div className="space-y-4">
                {resumeData.awards.map((award, i) => (
                  <div key={i} className="flex items-start gap-3 group/award">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#f92672] shrink-0 group-hover/award:scale-150 transition-transform" />
                    <div>
                      <p className="text-foreground/90 text-sm font-semibold">{award.title}</p>
                      <p className="text-[#f92672] text-xs font-mono">{award.achievement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Footer Credits */}
        <ScrollReveal direction="up" delay={400}>
          <div className="mt-16 pt-8 border-t border-border/30 text-center">
            <p className="text-muted-foreground text-sm font-mono flex items-center justify-center gap-1">
              Built with <Heart size={14} className="text-[#f92672] inline animate-pulse" /> by {contactData.name}
            </p>
            <p className="text-muted-foreground/50 text-xs font-mono mt-2">
              &copy; {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
