import { Link } from 'react-router'
import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'
import api from '../api/axios'

export default function JobCard({ job }) {
  const user = useAuthStore((s) => s.user)
  const [saved, setSaved] = useState(user?.savedJobs?.includes(job._id))
  const [saving, setSaving] = useState(false)

  const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  async function toggleSave(e) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await api.post(`/users/saved/${job._id}`)
      setSaved((s) => !s)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-400 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Company initial avatar */}
        <div className="w-11 h-11 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
          <span className="text-brand-700 font-bold text-lg">
            {job.company?.name?.[0] ?? '?'}
          </span>
        </div>

        {/* Save button */}
        {user?.role === 'jobseeker' && (
          <button
            onClick={toggleSave}
            disabled={saving}
            className="text-gray-400 hover:text-brand-600 transition-colors shrink-0"
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1">
          {job.title}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">{job.company?.name ?? 'Company'}</p>
      </div>

      {job.skillsRequired?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.skillsRequired.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200"
            >
              {skill}
            </span>
          ))}
          {job.skillsRequired.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skillsRequired.length - 4} more</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
        <span>{postedDate}</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>{job.applications?.length ?? 0} applicants</span>
      </div>
    </Link>
  )
}
