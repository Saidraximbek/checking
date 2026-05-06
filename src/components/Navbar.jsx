import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'

export default function Navbar() {
  const { error, setError } = useAppContext()
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

  if (!displayedError) return null

  const isSuccess = displayedError.includes('✅')
  const isError = displayedError.includes('❌') || !displayedError.includes('✅')

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div
        className={`p-4 rounded-lg shadow-lg text-white font-semibold ${
          isSuccess ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        {displayedError}
      </div>
    </div>
  )
}
