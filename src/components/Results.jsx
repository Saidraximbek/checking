import React, { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAppContext } from '../context/AppContext'

export default function Results() {
  const { currentPage, userInfo, currentTest, userAnswers, results, resultsSaved, setResultsSaved, setCurrentPage, setError, loading, setLoading } = useAppContext()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (results && !resultsSaved && userInfo.name && userInfo.testCode && currentTest) {
      saveResults()
    }
  }, [results, resultsSaved, userInfo, currentTest, userAnswers])

  const saveResults = async () => {
    setLoading(true)
    try {
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
        createdAt: serverTimestamp(),
      })
      setSaved(true)
      setResultsSaved(true)
    } catch (err) {
      setError('Natijalarni saqlashda xatolik. Iltimos qayta urinib koʻring')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!results) {
    return <div>Natijalar yuklanmoqda...</div>
  }

  const isPassed = results.percentage >= 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Test yakunlandi! 🎉</h1>
        <p className="text-gray-600 mb-8">Natijalaringiz:</p>

        {/* Score Card */}
        <div className={`rounded-lg p-8 mb-8 ${isPassed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
          <div className={`text-6xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {results.score}/{results.total}
          </div>
          <div className={`text-2xl font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {results.percentage}%
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {isPassed ? '✅ Oʻtdi' : '❌ Oʻtmadi'}
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Toʻgʻri</div>
            <div className="text-2xl font-bold text-green-600">{results.correct}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Notoʻgʻri</div>
            <div className="text-2xl font-bold text-red-600">{results.wrong}</div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Ism:</span> {userInfo.name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Test kodi:</span> {userInfo.testCode}
          </p>
          {saved && (
            <p className="text-sm text-green-600 mt-2">
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
