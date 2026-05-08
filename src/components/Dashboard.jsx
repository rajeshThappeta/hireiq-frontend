import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'

/* ─── Jobseeker Dashboard ─── */
function JobseekerDashboard() {
  const [applied, setApplied] = useState([])
  const [saved, setSaved] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [appliedRes, savedRes, recRes] = await Promise.allSettled([
        api.get('/users/applications'),
        api.get('/users/saved/jobs'),
        api.get('/ai/recommendations'),
      ])
      if (appliedRes.status === 'fulfilled') setApplied(appliedRes.value.data.data)
      if (savedRes.status   === 'fulfilled') setSaved(savedRes.value.data.data)
      if (recRes.status     === 'fulfilled') setRecommended(recRes.value.data.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Applied" value={applied.length} color="brand" />
        <StatCard label="Saved Jobs" value={saved.length} color="navy" />
        <StatCard label="Recommendations" value={recommended.length} color="accent" />
      </div>

      <Section title="My Applications">
        {applied.length === 0
          ? <Empty text="No applications yet. Start applying!" />
          : applied.map((app) => <ApplicationRow key={app._id ?? app.job?._id} application={app} />)}
      </Section>

      <Section title="Saved Jobs">
        {saved.length === 0
          ? <Empty text="No saved jobs. Bookmark jobs to revisit them." />
          : saved.map((job) => <JobRow key={job._id} job={job} />)}
      </Section>

      <Section title="✨ AI Job Recommendations">
        {recommended.length === 0
          ? <Empty text="Update your profile skills to get personalized recommendations." />
          : recommended.map((job) => <JobRow key={job._id} job={job} />)}
      </Section>
    </div>
  )
}

/* ─── Recruiter Dashboard ─── */
function RecruiterDashboard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState([])

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setError,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => { loadJobs() }, [])

  async function loadJobs() {
    try {
      const { data } = await api.get('/users/posted-jobs')

      setJobs(data.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function addSkill(e) {
    e.preventDefault()
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s])
    setSkillInput('')
  }

  async function onPostJob(data) {
    try {
      await api.post('/jobs', { ...data, skillsRequired: skills })
      resetForm()
      setSkills([])
      setShowForm(false)
      loadJobs()
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Failed to post job.' })
    }
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <StatCard label="Posted Jobs" value={jobs.length} color="brand" />
          <StatCard label="Total Applicants" value={jobs.reduce((n, j) => n + (j.applications?.length ?? 0), 0)} color="navy" />
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="ml-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          {showForm ? 'Cancel' : '+ Post Job'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Post a New Job</h2>
          {errors.root && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {errors.root.message}
            </div>
          )}
          <form onSubmit={handleSubmit(onPostJob)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Frontend Engineer"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'At least 30 characters' } })}
                placeholder="Describe the role, responsibilities, requirements..."
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Required Skills</label>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                  placeholder="e.g. React"
                  className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button type="button" onClick={addSkill} className="bg-brand-100 hover:bg-brand-200 text-brand-700 px-3 rounded-lg text-sm font-medium transition-colors">Add</button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                      {s}
                      <button type="button" onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>
      )}

      <Section title="Your Posted Jobs">
        {jobs.length === 0
          ? <Empty text="You haven't posted any jobs yet." />
          : jobs.map((job) => <RecruiterJobRow key={job._id} job={job} />)}
      </Section>
    </div>
  )
}

/* ─── Shared sub-components ─── */
function StatCard({ label, value, color }) {
  const colors = {
    brand:  'bg-brand-50 text-brand-700 border-brand-200',
    navy:   'bg-blue-50 text-navy-700 border-blue-200',
    accent: 'bg-orange-50 text-accent border-orange-200',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Empty({ text }) {
  return <p className="text-sm text-gray-400">{text}</p>
}

function JobRow({ job }) {
  return (
    <Link
      to={`/jobs/${job._id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
    >
      <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
        <span className="text-brand-700 font-bold text-sm">{job.company?.name?.[0] ?? '?'}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{job.title}</p>
        <p className="text-xs text-gray-500">{job.company?.name}</p>
      </div>
    </Link>
  )
}

function ApplicationRow({ application }) {
  const job = application.job ?? application
  const status = application.status ?? 'applied'
  const statusColors = { applied: 'bg-blue-50 text-blue-700', reviewed: 'bg-brand-50 text-brand-700' }
  return (
    <Link
      to={`/jobs/${job._id}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
          <span className="text-brand-700 font-bold text-sm">{job.company?.name?.[0] ?? '?'}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{job.title}</p>
          <p className="text-xs text-gray-500">{job.company?.name}</p>
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    </Link>
  )
}

function RecruiterJobRow({ job }) {
  return (
    <Link
      to={`/jobs/${job._id}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
    >
      <div>
        <p className="text-sm font-medium text-gray-900">{job.title}</p>
        <p className="text-xs text-gray-500">{job.applications?.length ?? 0} applicants</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {job.skillsRequired?.slice(0, 3).map((s) => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
      </div>
      <div className="h-48 bg-gray-100 rounded-2xl" />
      <div className="h-48 bg-gray-100 rounded-2xl" />
    </div>
  )
}

/* ─── Main export ─── */
export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
 // console.log("user :",user)
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role} dashboard</p>
      </div>
      {user?.role === 'jobseeker' && <JobseekerDashboard />}
      {user?.role === 'recruiter' && <RecruiterDashboard />}
      {user?.role === 'admin' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-sm">Admin panel — manage users and jobs from here.</p>
        </div>
      )}
    </div>
  )
}
