import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [editMode, setEditMode] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState(user?.skills ?? [])
  const [resumeFile, setResumeFile] = useState(null)
  const [saveMsg, setSaveMsg] = useState({ text: '', ok: true })
  const fileRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: user?.name ?? '', email: user?.email ?? '' } })

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      setUser(data.data)
      setSkills(data.data.skills ?? [])
      reset({ name: data.data.name, email: data.data.email })
    }).catch(() => {})
  }, [])

  function addSkill(e) {
    e.preventDefault()
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s])
    setSkillInput('')
  }

  async function onSave(data) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('skills', JSON.stringify(skills))
    if (resumeFile) formData.append('resume', resumeFile)

    try {
      const res = await api.put('/users/profile', formData)
      setUser(res.data.data)
      setSkills(res.data.data.skills ?? [])
      setResumeFile(null)
      setEditMode(false)
      setSaveMsg({ text: 'Profile updated successfully!', ok: true })
      setTimeout(() => setSaveMsg({ text: '', ok: true }), 3000)
    } catch (err) {
      setSaveMsg({ text: err.response?.data?.message || 'Update failed.', ok: false })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!editMode && user?.role === 'jobseeker' && (
          <button
            onClick={() => setEditMode(true)}
            className="text-sm font-medium border border-brand-500 text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {saveMsg.text && (
        <div className={`mb-5 text-sm rounded-lg px-4 py-3 border ${
          saveMsg.ok
            ? 'bg-brand-50 border-brand-200 text-brand-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {saveMsg.text}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {editMode ? (
          <form onSubmit={handleSubmit(onSave)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                  placeholder="Add a skill and press Enter..."
                  className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button type="button" onClick={addSkill} className="bg-brand-100 hover:bg-brand-200 text-brand-700 px-3 rounded-lg text-sm font-medium transition-colors">
                  Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                      {s}
                      <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1.5">Used to generate AI job recommendations</p>
            </div>

            {/* Resume upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Resume (PDF)</label>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-brand-400 rounded-lg px-4 py-3 text-sm text-gray-500 hover:text-brand-600 transition-colors text-left"
              >
                {resumeFile
                  ? <span className="text-brand-600 font-medium">📄 {resumeFile.name}</span>
                  : user?.resumeUrl
                    ? <span>Replace existing resume · <span className="text-brand-600">click to upload new PDF</span></span>
                    : <span>Upload resume PDF · <span className="text-brand-600">click to browse</span></span>}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">Used for AI skill-gap analysis</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => { setEditMode(false); setResumeFile(null) }}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="text-xs bg-navy-700 text-white px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Skills */}
            {user?.skills?.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.skills.map((s) => (
                    <span key={s} className="text-sm bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume link */}
            {user?.resumeUrl && (
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline font-medium">
                  View Resume
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
