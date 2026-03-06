export type EducationEntry = {
  degree?: string
  university?: string
  expectedGraduation?: string
}

export type PublicationEntry = {
  title?: string
  venue?: string
  date?: string
}

export type AwardEntry = {
  title?: string
  achievement?: string
}

export type ResumeData = {
  pdfPath?: string
  displayLabel?: string
  downloadLabel?: string
  education?: EducationEntry[]
  publications?: PublicationEntry[]
  awards?: AwardEntry[]
}
