import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import ReactMarkdown from 'react-markdown'
import useAuthStore from '../store/useAuthStore'
import useToastStore from '../store/useToastStore'
import SkillGap from './SkillGap'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const showToast = useToastStore((s) => s.show)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)
  const [applied, setApplied] = useState(false)
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/jobs/${id}`)
        setJob(data.data)
        const userId = user?.id ?? user?._id?.toString()
        const alreadyApplied = data.data.applications?.some((a) => {
          const applicantId = a.applicant?._id?.toString() ?? a.applicant?.toString()
          return applicantId === userId
        })
        setApplied(alreadyApplied)
      } catch {
        setError('Job not found or unavailable.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user])

  async function onApply(data) {
    try {
      await api.post(`/jobs/${id}/apply`, data)
      setApplied(true)
      setApplyOpen(false)
      resetForm()
    } catch {
      // error surfaces via react-hook-form root
    }
  }

  async function updateStatus(appId, status) {
    try {
      await api.patch(`/jobs/${id}/applications/${appId}`, { status })
      setJob((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a._id === appId ? { ...a, status } : a
        ),
      }))
    } catch {
      // silently ignore — status badge stays unchanged
    }
  }

  async function summarize() {
    if (!user) { showToast('Please log in to use AI Summarize', 'info'); navigate('/login'); return; }
    setSummary('')
    setSummarizing(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/ai/summarize/${id}`,
        { method: 'POST', credentials: 'include' },
      )
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          const d = line.slice(6)
          if (d === '[DONE]') break
          setSummary((prev) => prev + d)
        }
      }
    } catch {
      setSummary('Unable to generate summary.')
    } finally {
      setSummarizing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">{error}</p>
        <button onClick={() => navigate('/jobs')} className="mt-4 text-brand-600 font-medium hover:underline text-sm">
          ← Back to Jobs
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-brand-700 font-bold text-2xl">{job.company?.name?.[0] ?? '?'}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-500 mt-0.5">{job.company?.name ?? 'Company'}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-medium">
                {job.applications?.length ?? 0} applicants
              </span>
            </div>
          </div>
        </div>

        {job.skillsRequired?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Skills Required</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill) => (
                <span key={skill} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Job Description</h2>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* AI Summary */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">AI Summary</h2>
            <button
              onClick={summarize}
              disabled={summarizing}
              className="text-xs bg-navy-700 hover:bg-navy-800 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {summarizing ? 'Summarizing...' : summary ? 'Re-summarize' : '✨ Summarize'}
            </button>
          </div>
          {(summary || summarizing) && (
            <div className="bg-gray-50 rounded-xl p-4 prose prose-sm prose-gray max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
              {summarizing && <span className="inline-block w-1.5 h-4 bg-brand-400 ml-0.5 animate-pulse" />}
            </div>
          )}
        </div>

        {/* Apply */}
        {user?.role === 'jobseeker' && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            {applied ? (
              <div className="flex items-center gap-2 text-brand-600 font-medium text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You've already applied to this job
              </div>
            ) : applyOpen ? (
              <form onSubmit={handleSubmit(onApply)} className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-800">Apply for this Role</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Note</label>
                  <textarea
                    rows={4}
                    {...register('coverNote', { required: 'Cover note is required', minLength: { value: 20, message: 'At least 20 characters' } })}
                    placeholder="Tell the recruiter why you're a great fit..."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
                  />
                  {errors.coverNote && <p className="text-red-600 text-xs mt-1">{errors.coverNote.message}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyOpen(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => { if (!user) { navigate('/login'); return; } setApplyOpen(true) }}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        )}
      </div>

      <SkillGap jobId={id} />

      {user?.role === 'recruiter' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h2 className="font-semibold text-gray-900 mb-4">
            Applicants
            <span className="ml-2 text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
              {job.applications?.length ?? 0}
            </span>
          </h2>

          {!job.applications?.length ? (
            <p className="text-sm text-gray-400">No one has applied yet.</p>
          ) : (
            <div className="space-y-4">
              {job.applications.map((app) => (
                <div key={app._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <span className="text-brand-700 font-bold text-sm">
                          {app.applicant?.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.applicant?.name}</p>
                        <p className="text-xs text-gray-500">{app.applicant?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                        app.status === 'reviewed'
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => updateStatus(app._id, app.status === 'reviewed' ? 'applied' : 'reviewed')}
                        className="text-xs text-gray-500 hover:text-brand-600 border border-gray-200 hover:border-brand-400 px-2 py-1 rounded-lg transition-colors"
                      >
                        {app.status === 'reviewed' ? 'Mark Applied' : 'Mark Reviewed'}
                      </button>
                    </div>
                  </div>

                  {app.coverNote && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed">
                      {app.coverNote}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
