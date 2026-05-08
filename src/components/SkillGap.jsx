import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import useAuthStore from '../store/useAuthStore'

export default function SkillGap({ jobId }) {
  const user = useAuthStore((s) => s.user)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!user || user.role !== 'jobseeker') return null

  async function analyze() {
    setAnalysis('')
    setError('')
    setDone(false)
    setLoading(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/ai/skill-gap/${jobId}`,
        { method: 'GET', credentials: 'include' },
      )

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Analysis failed.')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done: finished, value } = await reader.read()
        if (finished) break
        const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          const d = line.slice(6)
          if (d === '[DONE]') break
          setAnalysis((prev) => prev + d)
        }
      }
      setDone(true)
    } catch {
      setError('Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-semibold text-brand-800">AI Skill Gap Analysis</h3>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white px-4 py-1.5 rounded-lg transition-colors"
        >
          {loading ? 'Analyzing...' : done ? 'Re-analyze' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {(analysis || loading) && !error && (
        <div className="mt-2 bg-white rounded-lg p-4 border border-brand-100 prose prose-sm prose-gray max-w-none">
          <ReactMarkdown>{analysis}</ReactMarkdown>
          {loading && <span className="inline-block w-1.5 h-4 bg-brand-400 ml-0.5 animate-pulse" />}
        </div>
      )}

      {!analysis && !loading && !error && (
        <p className="text-sm text-brand-700">
          Compare your uploaded resume against this job's requirements.
          {!user.resumeUrl && <span className="font-medium"> Upload your resume in Profile first.</span>}
        </p>
      )}
    </div>
  )
}
