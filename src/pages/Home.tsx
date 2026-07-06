import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { auth, googleProvider, signInWithPopup, signOut } from '../services/firebase'
import { createUserIfNotExists } from '../services/firestore'
import PreviousReports from '../components/PreviousReports'

const features = [
  { label: 'Wrinkles' },
  { label: 'Acne' },
  { label: 'Pores' },
  { label: 'Dark Circles' },
  { label: 'Hydration' },
  { label: 'Oil Intensity' },
  { label: 'Redness' },
  { label: 'Blackheads' },
  { label: 'Skin Tone' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [showReports, setShowReports] = useState(false)

  async function handleGoogleLogin() {
    const result = await signInWithPopup(auth, googleProvider)
    const { uid, displayName, email } = result.user
    await createUserIfNotExists(uid, displayName ?? '', email ?? '')
  }

  async function handleSignOut() {
    await signOut(auth)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">SkinScan</span>
        </div>
        <div className="flex items-center gap-3">
          {!loading && user && (
            <>
              <img
                src={user.photoURL ?? undefined}
                alt={user.displayName ?? 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </>
          )}
          {!loading && !user && (
            <span className="text-sm text-violet-600 font-medium bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
              AI-Powered
            </span>
          )}
        </div>
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

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-48 bg-violet-100 rounded-2xl animate-pulse" />
              <div className="h-10 w-40 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => navigate('/scan')}
                className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all duration-150 cursor-pointer"
              >
                Start Skin Scan →
              </button>
              <button
                onClick={() => setShowReports(true)}
                className="text-sm text-violet-600 hover:text-violet-800 font-medium px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer"
              >
                View Previous Reports
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 active:scale-95 text-gray-800 text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg border border-gray-200 transition-all duration-150 cursor-pointer"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Login to Proceed
            </button>
          )}

          <p className="mt-4 text-sm text-gray-400">Results in seconds · Analysed securely</p>
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

      {showReports && user && (
        <PreviousReports userId={user.uid} onClose={() => setShowReports(false)} />
      )}
    </div>
  )
}
