import { useEffect } from 'react'
import useToastStore from '../store/useToastStore'

const icons = {
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M5 13l4 4L19 7',
  error:   'M6 18L18 6M6 6l12 12',
}

const styles = {
  info:    'bg-navy-700 text-white',
  success: 'bg-brand-600 text-white',
  error:   'bg-red-600 text-white',
}

export default function Toast() {
  const { message, type, hide } = useToastStore()

  useEffect(() => {
    if (!message) return
    const t = setTimeout(hide, 3500)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${styles[type]}`}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[type]} />
      </svg>
      {message}
      <button onClick={hide} className="ml-2 opacity-70 hover:opacity-100">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
