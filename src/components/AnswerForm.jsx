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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">{currentTest.title}</h1>
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
            <div className="text-sm text-gray-600">
              Savollar: <span className="font-semibold text-gray-800">{currentTest.totalQuestions}</span>
            </div>
            <div className="text-sm text-gray-600">
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
                <label className="text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-lg outline-none transition ${
                    answer
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Orqaga
            </button>
            <button
              onClick={handleSubmit}
              disabled={unansweredCount > 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              {unansweredCount > 0 ? `Hammasini javoblang (${unansweredCount} ta qoldi)` : 'Javoblarni yuborish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
