import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import type { ApiResponse, SkinParameter } from '../types/skin'

const RECOMMENDATION_TABS = [
  'Morning Routine',
  'Evening Routine',
  'Weekly Treatments',
  'Lifestyle Tips',
] as const

type Tab = (typeof RECOMMENDATION_TABS)[number]

const GRADE_COLORS: Record<string, string> = {
  excellent: 'bg-emerald-100 text-emerald-700',
  good: 'bg-green-100 text-green-700',
  normal: 'bg-blue-100 text-blue-700',
  fair: 'bg-yellow-100 text-yellow-700',
  poor: 'bg-red-100 text-red-700',
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#7c3aed' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-bold text-gray-900">{score}</div>
        <div className="text-xs text-gray-500 mt-0.5">/ 100</div>
      </div>
    </div>
  )
}

function ParameterCard({ name, param }: { name: string; param: SkinParameter }) {
  const pct = Math.round((param.score / param.maximum_score) * 100)
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-violet-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-sm">{name}</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {param.label}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 w-10 text-right">
          {param.score}/{param.maximum_score}
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{param.comment}</p>
    </div>
  )
}

import { useState } from 'react'

export default function Results() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: { report: ApiResponse; imageUrl?: string } | null }
  const [activeTab, setActiveTab] = useState<Tab>('Morning Routine')

  if (!state?.report) return <Navigate to="/" replace />

  const { skin_report } = state.report
  const imageUrl = state.imageUrl
  const gradeClass = GRADE_COLORS[skin_report.skin_grade.toLowerCase()] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔬</span>
            <span className="font-semibold text-gray-900">SkinScan</span>
          </div>
          {/* <button
            onClick={() => navigate('/scan')}
            className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Scan Again
          </button> */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Score card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-row items-center gap-5">
          {/* Captured photo */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                alt="Captured face"
                className="w-24 h-24 rounded-2xl object-cover scale-x-[-1] ring-2 ring-violet-100"
              />
            </div>
          )}

          {/* Score gauge */}
          <ScoreGauge score={skin_report.skin_score} />

          {/* Grade & age */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Skin Score</p>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 capitalize">{skin_report.skin_grade} skin</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${gradeClass}`}>
                {skin_report.skin_grade}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1.5">
              Skin age:{' '}
              <span className="font-semibold text-gray-800">{skin_report.estimated_skin_age} yrs</span>
            </p>
          </div>
        </div>

        {/* Parameters */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Skin Parameters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(skin_report.parameters).map(([name, param]) => (
              <ParameterCard key={name} name={name} param={param} />
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Personalised Recommendations</h2>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
            {RECOMMENDATION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${activeTab === tab
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {skin_report.summary_and_recommendations[activeTab].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-8 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/scan')}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-2xl transition-colors cursor-pointer shadow-sm"
          >
            Scan Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
          <p className="text-xs text-gray-400">Your skin changes — scan regularly for updated insights.</p>
        </div>
      </main>
    </div>
  )
}
