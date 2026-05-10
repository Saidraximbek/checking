import React, { useState } from 'react'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAppContext } from '../context/AppContext'

export default function AdminLogin() {
  const { setCurrentPage, setAdminUser, setError, setLoading, loading } = useAppContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Iltimos, barcha maydonlarni toʻldiring')
    }

    setLoading(true)
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setAdminUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      })
      setCurrentPage('admin-panel')
    } catch (err) {
      setError('Notoʻgʻri email yoki parol')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/40 p-8 w-full max-w-md transition-colors duration-300">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-slate-100">Admin kirish</h1>
        <p className="text-center text-gray-600 dark:text-slate-300 mb-8">Admin paneliga kirish</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elektron pochta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@misol.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-sm hover:shadow-lg"
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 transition-colors duration-200"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    </div>
  )
}
