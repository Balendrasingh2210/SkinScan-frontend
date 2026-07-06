import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeSkin } from '../services/api'
import { saveReport, createUserIfNotExists } from '../services/firestore'
import { useAuth } from '../hooks/useAuth'

type CameraState = 'loading' | 'ready' | 'denied' | 'analyzing' | 'api-error' | 'error'

export default function Scan() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CameraState>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setState('denied')
        } else {
          setState('error')
          setErrorMsg(err.message || 'Could not access camera.')
        }
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '')

    setState('analyzing')
    try {
      const data = await analyzeSkin(base64)
      if (user) {
        await createUserIfNotExists(user.uid, user.displayName ?? '', user.email ?? '')
        await saveReport(user.uid, data.skin_report)
      }
      navigate('/results', { state: { report: data, imageUrl: dataUrl } })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      setState('api-error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
        >
          ← Back
        </button>
        <span className="text-white font-semibold">Skin Scan</span>
      </header>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-6">
        <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">

          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Face outline guide */}
          {state === 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-2 border-violet-400/60 rounded-[50%]" />
            </div>
          )}

          {/* Loading overlay */}
          {state === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Starting camera…</p>
            </div>
          )}

          {/* Analyzing overlay */}
          {state === 'analyzing' && (
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-white font-semibold text-lg">Analysing your skin…</p>
                <p className="text-gray-400 text-sm mt-1">This takes a few seconds</p>
              </div>
            </div>
          )}

          {/* Permission denied */}
          {state === 'denied' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="text-5xl">📷</span>
              <p className="text-white font-semibold">Camera access denied</p>
              <p className="text-gray-400 text-sm">
                Please allow camera access in your browser settings and reload the page.
              </p>
            </div>
          )}

          {/* API / analysis error — camera stays alive, user can retry */}
          {state === 'api-error' && (
            <div className="absolute inset-0 bg-gray-950/75 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="text-4xl">😕</span>
              <p className="text-white font-semibold text-base leading-snug">{errorMsg}</p>
              <button
                onClick={() => setState('ready')}
                className="mt-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Generic error */}
          {state === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="text-5xl">⚠️</span>
              <p className="text-white font-semibold">Something went wrong</p>
              <p className="text-gray-400 text-sm">{errorMsg}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-violet-400 underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Hint text */}
        {state === 'ready' && (
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Centre your face in the oval, ensure good lighting, then tap the button.
          </p>
        )}

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={state !== 'ready'}
          className="w-18 h-18 rounded-full bg-white border-4 border-violet-500 shadow-lg shadow-violet-900/40 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-150 cursor-pointer"
          aria-label="Capture photo and analyse"
        >
          <span className="sr-only">Capture</span>
        </button>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
