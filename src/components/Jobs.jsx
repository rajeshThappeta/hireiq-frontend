import { useState, useEffect } from 'react'
import JobCard from './JobCard'
import api from '../api/axios'
import useFilterStore from '../store/useFilterStore'

export default function Jobs() {
  const { search, setSearch, skills, setSkills, reset } = useFilterStore()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search) params.search = search
      if (skills.length) params.skills = skills.join(',')
      const { data } = await api.get('/jobs', { params })
      setJobs(data.data)
    } catch {
      setError('Failed to load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchJobs()
  }

  function addSkillFilter(e) {
    e.preventDefault()
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills([...skills, s])
    setSkillInput('')
  }

  function removeSkillFilter(skill) {
    setSkills(skills.filter((s) => s !== skill))
  }

  function handleReset() {
    reset()
    setSkillInput('')
    fetchJobs()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero search */}
      <div className="bg-navy-700 rounded-2xl px-6 py-10 mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Find Your Next Opportunity</h1>
        <p className="text-brand-200 mb-6 text-sm">AI-matched jobs tailored to your skills</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, keyword..."
            className="flex-1 rounded-lg px-4 py-2.5 text-sm bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white/20"
          />
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Filter by Skill</h2>
              {skills.length > 0 && (
                <button onClick={handleReset} className="text-xs text-brand-600 hover:underline">Clear</button>
              )}
            </div>
            <form onSubmit={addSkillFilter} className="flex gap-1.5 mb-3">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. React"
                className="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <button type="submit" className="bg-brand-100 hover:bg-brand-200 text-brand-700 text-xs px-2 py-1.5 rounded-md transition-colors">+</button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                  {s}
                  <button onClick={() => removeSkillFilter(s)} className="hover:text-red-500 leading-none">×</button>
                </span>
              ))}
            </div>
            {skills.length > 0 && (
              <button
                onClick={fetchJobs}
                className="mt-3 w-full text-xs bg-brand-600 hover:bg-brand-700 text-white py-1.5 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        {/* Job listings */}
        <main className="flex-1">
          {loading && (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4">
              {error}
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No jobs found. Try adjusting your filters.</p>
              <button onClick={handleReset} className="mt-3 text-brand-600 text-sm font-medium hover:underline">Clear filters</button>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-4">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {jobs.map((job) => <JobCard key={job._id} job={job} />)}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
