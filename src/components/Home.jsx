import React, { useState } from 'react'
import { db } from '../firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAppContext } from '../context/AppContext'

export default function Home() {
  const { setCurrentPage, setUserInfo, setCurrentTest, setUserAnswers, setError, setLoading, loading } = useAppContext()
  const [name, setName] = useState('')
  const [testCode, setTestCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !testCode.trim()) {
      setError('Iltimos, barcha maydonlarni toʻldiring')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Fetch test from Firestore
      const testsRef = collection(db, 'tests')
      const q = query(testsRef, where('testCode', '==', testCode.toUpperCase()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('Notoʻgʻri test kodi')
        setLoading(false)
        return
      }

      const testDoc = querySnapshot.docs[0]
      const testData = testDoc.data()

      setUserInfo({ name: name.trim(), testCode: testCode.toUpperCase() })
      setCurrentTest({ id: testDoc.id, ...testData })
      setUserAnswers(new Array(testData.totalQuestions).fill(''))
      setCurrentPage('answers')
    } catch (err) {
      setError('Testni yuklashda xatolik. Iltimos qayta urinib koʻring')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/40 p-8 w-full max-w-md transition-colors duration-300">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-slate-100">Javob tekshiruvchi</h1>
        <p className="text-center text-gray-600 dark:text-slate-300 mb-8">Testni boshlash uchun maʼlumotlaringizni kiriting</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toʻliq ism
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Toʻliq ismingizni kiriting"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test kodi
            </label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="Test kodini kiriting"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-sm hover:shadow-lg"
          >
            {loading ? 'Yuklanmoqda...' : 'Testni boshlash'}
          </button>
        </form>

        {/* Error message */}
        {/* Handled in Navbar component */}

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-300 text-center">
            <button
              onClick={() => setCurrentPage('admin-login')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Admin kirish
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
