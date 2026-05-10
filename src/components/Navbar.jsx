import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'

export default function Navbar() {
  const { error, setError, darkMode, setDarkMode } = useAppContext()
  const [displayedError, setDisplayedError] = useState('')

  useEffect(() => {
    if (error) {
      setDisplayedError(error)
      const timer = setTimeout(() => {
        setDisplayedError('')
        setError('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const isSuccess = displayedError.includes('✅')

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg shadow-slate-200 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {displayedError && (
        <div className="fixed top-20 left-4 right-4 z-50">
          <div
            className={`p-4 rounded-lg shadow-lg text-white font-semibold ${
              isSuccess ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {displayedError}
          </div>
        </div>
      )}
    </>
  )
}
