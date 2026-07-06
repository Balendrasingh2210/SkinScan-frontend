import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '✦', label: 'Wrinkles' },
  { icon: '✦', label: 'Acne' },
  { icon: '✦', label: 'Pores' },
  { icon: '✦', label: 'Dark Circles' },
  { icon: '✦', label: 'Hydration' },
  { icon: '✦', label: 'Oil Intensity' },
  { icon: '✦', label: 'Redness' },
  { icon: '✦', label: 'Blackheads' },
  { icon: '✦', label: 'Skin Tone' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">SkinScan</span>
        </div>
        <span className="text-sm text-violet-600 font-medium bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
          AI-Powered
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            Free instant analysis
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
            Know your skin,<br />
            <span className="text-violet-600">inside out.</span>
          </h1>

          <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto">
            Take a quick selfie and get a comprehensive AI skin report — covering 9 skin parameters with personalised care recommendations.
          </p>

          <button
            onClick={() => navigate('/scan')}
            className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all duration-150 cursor-pointer"
          >
            Start Skin Scan →
          </button>

          <p className="mt-4 text-sm text-gray-400">No sign-up required · Results in seconds</p>
        </div>

        {/* Feature chips */}
        <div className="mt-16 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">What we analyse</p>
          <div className="flex flex-wrap justify-center gap-2">
            {features.map(({ label }) => (
              <span
                key={label}
                className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-full shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        Your photo is analysed securely and never stored.
      </footer>
    </div>
  )
}
