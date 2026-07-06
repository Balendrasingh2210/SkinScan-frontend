export interface SkinParameter {
  score: number
  maximum_score: number
  comment: string
  label: string
}

export interface SummaryAndRecommendations {
  'Morning Routine': string[]
  'Evening Routine': string[]
  'Weekly Treatments': string[]
  'Lifestyle Tips': string[]
}

export interface SkinReport {
  skin_score: number
  skin_grade: string
  estimated_skin_age: number
  parameters: Record<string, SkinParameter>
  summary_and_recommendations: SummaryAndRecommendations
}

export interface ApiResponse {
  skin_report: SkinReport
  timestamp: string
}
