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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Admin kirish</h1>
        <p className="text-center text-gray-600 mb-8">Admin paneliga kirish</p>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full text-blue-600 hover:text-blue-700 font-medium py-2"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    </div>
  )
}
