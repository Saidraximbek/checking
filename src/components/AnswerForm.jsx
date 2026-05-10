import React, { useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

export default function AnswerForm() {
  const { currentTest, userAnswers, setUserAnswers, setCurrentPage, setResults, setResultsSaved } = useAppContext()
  const inputRefs = useRef([])

  if (!currentTest) {
    return <div>Yuklanmoqda...</div>
  }

  const handleAnswerChange = (index, value) => {
    const upperValue = value.toUpperCase()
    if (['A', 'B', 'C', 'D', ''].includes(upperValue)) {
      const newAnswers = [...userAnswers]
      newAnswers[index] = upperValue
      setUserAnswers(newAnswers)

      // Auto-move to next input if answer is selected
      if (upperValue && index < userAnswers.length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.key === 'Backspace' && !userAnswers[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowDown' && index < userAnswers.length - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === 'ArrowUp' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = () => {
    const correct = userAnswers.filter(
      (ans, idx) => ans === currentTest.correctAnswers[idx]
    ).length
    const wrong = currentTest.totalQuestions - correct

    const result = {
      correct,
      wrong,
      total: currentTest.totalQuestions,
      score: correct,
      percentage: Math.round((correct / currentTest.totalQuestions) * 100),
    }

    setResultsSaved(false)
    setResults(result)
    setCurrentPage('results')
  }

  const unansweredCount = userAnswers.filter((ans) => !ans).length
  const answeredCount = userAnswers.length - unansweredCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/40 p-8 transition-colors duration-300">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-slate-100">{currentTest.title}</h1>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-600 dark:text-slate-300">
              Savollar: <span className="font-semibold text-gray-800 dark:text-slate-100">{currentTest.totalQuestions}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-300">
              Javob berildi: <span className="font-semibold text-green-600">{answeredCount}</span> / {currentTest.totalQuestions}
            </div>
            {unansweredCount > 0 && (
              <div className="text-sm text-orange-600 font-semibold">
                ⚠️ {unansweredCount} ta javobsiz
              </div>
            )}
          </div>

          {/* Answer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {userAnswers.map((answer, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  {index + 1}-savol
                </label>
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, index)}
                  placeholder="A/B/C/D"
                  maxLength="1"
                  className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-2xl outline-none transition ${
                    answer
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-gray-300 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-700'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 font-semibold py-3 px-4 rounded-2xl transition duration-200 shadow-sm"
            >
              Orqaga
            </button>
            <button
              onClick={handleSubmit}
              disabled={unansweredCount > 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-2xl transition duration-200 shadow-sm"
            >
              {unansweredCount > 0 ? `Hammasini javoblang (${unansweredCount} ta qoldi)` : 'Javoblarni yuborish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
