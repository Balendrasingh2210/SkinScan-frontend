import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReports } from '../services/api'
import type { ReportItem } from '../types/skin'

const GRADE_COLORS: Record<string, string> = {
  excellent: 'bg-emerald-100 text-emerald-700',
  good: 'bg-green-100 text-green-700',
  normal: 'bg-blue-100 text-blue-700',
  fair: 'bg-yellow-100 text-yellow-700',
  poor: 'bg-red-100 text-red-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  userId: string
  onClose: () => void
}

export default function PreviousReports({ userId, onClose }: Props) {
  const navigate = useNavigate()
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getReports(userId)
      .then((data) => setReports(data.reports))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  function openReport(item: ReportItem) {
    onClose()
    navigate('/results', {
      state: { report: { skin_report: item.report, timestamp: item.timestamp } },
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle / header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Previous Reports</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Loading reports…</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && reports.length === 0 && (
            <p className="text-center py-12 text-gray-400 text-sm">No reports yet.</p>
          )}

          {reports.map((item) => {
            const grade = item.report.skin_grade.toLowerCase()
            const gradeClass = GRADE_COLORS[grade] ?? 'bg-gray-100 text-gray-700'
            return (
              <button
                key={item.id}
                onClick={() => openReport(item)}
                className="w-full text-left bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 rounded-2xl px-4 py-4 flex items-center gap-4 transition-colors cursor-pointer"
              >
                {/* Score circle */}
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-700 font-bold text-base">{item.report.skin_score}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-800 capitalize">{item.report.skin_grade} skin</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${gradeClass}`}>
                      {item.report.skin_grade}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(item.timestamp)}</p>
                </div>

                <span className="text-gray-300 text-lg">›</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
