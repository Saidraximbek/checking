import React, { useEffect, useState, useRef } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { useAppContext } from '../context/AppContext'

export default function Results() {
  const { currentPage, userInfo, currentTest, userAnswers, results, resultsSaved, setResultsSaved, setCurrentPage, setError, loading, setLoading } = useAppContext()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [totalTillo, setTotalTillo] = useState(0)
  const saveLock = useRef(false)

  const fetchTotalTillo = async () => {
    try {
      const q = query(collection(db, 'results'), where('name', '==', userInfo.name))
      const querySnapshot = await getDocs(q)
      let total = 0
      querySnapshot.forEach((doc) => {
        total += doc.data().tillo || 0
      })
      setTotalTillo(total)
    } catch (err) {
      console.error('Tillo yuklashda xatolik:', err)
    }
  }

  const saveResults = async () => {
    if (saving || saved || saveLock.current) return
    saveLock.current = true
    setSaving(true)
    setLoading(true)
    try {
      const q = query(
        collection(db, 'results'),
        where('name', '==', userInfo.name),
        where('testId', '==', currentTest.id)
      )
      const querySnapshot = await getDocs(q)
      const isFirstAttempt = querySnapshot.empty

      if (!isFirstAttempt) {
        // Same name + test already saved, do not duplicate
        setSaved(true)
        setResultsSaved(true)
        await fetchTotalTillo()
        return
      }

      const tillo = results.correct
      await addDoc(collection(db, 'results'), {
        name: userInfo.name,
        testCode: userInfo.testCode,
        testId: currentTest.id,
        answers: userAnswers,
        score: results.score,
        totalQuestions: results.total,
        correctAnswers: results.correct,
        wrongAnswers: results.wrong,
        percentage: results.percentage,
        tillo,
        createdAt: serverTimestamp(),
      })

      setSaved(true)
      setResultsSaved(true)
      await fetchTotalTillo()
    } catch (err) {
      setError('Natijalarni saqlashda xatolik. Iltimos qayta urinib koʻring')
      console.error(err)
    } finally {
      setLoading(false)
      setSaving(false)
      saveLock.current = false
    }
  }

  useEffect(() => {
    if (results && !resultsSaved && !saved && !saving && userInfo.name && userInfo.testCode && currentTest) {
      saveResults()
    }
  }, [results, resultsSaved, saved, saving, userInfo, currentTest, userAnswers])

  if (!results) {
    return <div>Natijalar yuklanmoqda...</div>
  }

  const isPassed = results.percentage >= 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/40 p-8 w-full max-w-md text-center transition-colors duration-300">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-slate-100">Test yakunlandi! 🎉</h1>
        <p className="text-gray-600 dark:text-slate-300 mb-8">Natijalaringiz:</p>

        {/* Score Card */}
        <div className={`rounded-3xl p-8 mb-8 ${isPassed ? 'bg-green-50 border-2 border-green-500 dark:bg-emerald-950/20' : 'bg-red-50 border-2 border-red-500 dark:bg-rose-950/20'}`}>
          <div className={`text-6xl font-bold mb-2 ${isPassed ? 'text-green-600 dark:text-emerald-300' : 'text-red-600 dark:text-rose-300'}`}>
            {results.score}/{results.total}
          </div>
          <div className={`text-2xl font-semibold ${isPassed ? 'text-green-600 dark:text-emerald-300' : 'text-red-600 dark:text-rose-300'}`}>
            {results.percentage}%
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300 mt-2">
            {isPassed ? '✅ Oʻtdi' : '❌ Oʻtmadi'}
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 dark:bg-emerald-950/10 border border-green-200 dark:border-emerald-700 rounded-3xl p-4">
            <div className="text-sm text-gray-600 dark:text-slate-300">Toʻgʻri</div>
            <div className="text-2xl font-bold text-green-600 dark:text-emerald-300">{results.correct}</div>
          </div>
          <div className="bg-red-50 dark:bg-rose-950/10 border border-red-200 dark:border-rose-700 rounded-3xl p-4">
            <div className="text-sm text-gray-600 dark:text-slate-300">Notoʻgʻri</div>
            <div className="text-2xl font-bold text-red-600 dark:text-rose-300">{results.wrong}</div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 dark:bg-slate-900/80 rounded-3xl p-4 mb-8 text-left border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            <span className="font-semibold">Ism:</span> {userInfo.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            <span className="font-semibold">Test kodi:</span> {userInfo.testCode}
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            <span className="font-semibold">Jami tillo:</span> {totalTillo} 🪙
          </p>
          {saved && (
            <p className="text-sm text-green-600 dark:text-emerald-300 mt-2">
              ✅ Natijalar muvaffaqiyatli saqlandi
            </p>
          )}
        </div>

        {/* Buttons */}
        <button
          onClick={() => setCurrentPage('home')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          Yana bir test
        </button>
      </div>
    </div>
  )
}
