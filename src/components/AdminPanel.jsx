import React, { useState, useEffect } from 'react'
import { db, auth } from '../firebase/config'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useAppContext } from '../context/AppContext'
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from 'recharts'

export default function AdminPanel() {
  const { setCurrentPage, setAdminUser, setError, setLoading, loading } = useAppContext()
  const [view, setView] = useState('tests') // tests, create-test, results
  const [tests, setTests] = useState([])
  const [results, setResults] = useState([])
  const [editingTest, setEditingTest] = useState(null)
  const [selectedResultTestId, setSelectedResultTestId] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    testCode: '',
    title: '',
    totalQuestions: '',
    correctAnswers: '',
  })

  useEffect(() => {
    if (view === 'tests') {
      fetchTests()
    } else if (view === 'results') {
      fetchResults()
      fetchTests()
    }
  }, [view])

  const fetchTests = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'tests'))
      const testsList = []
      querySnapshot.forEach((doc) => {
        testsList.push({ id: doc.id, ...doc.data() })
      })
      setTests(testsList)
    } catch (err) {
      setError('Testlarni yuklashda xatolik')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'results'))
      const resultsList = []
      querySnapshot.forEach((doc) => {
        resultsList.push({ id: doc.id, ...doc.data() })
      })
      setResults(resultsList.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      }))
    } catch (err) {
      setError('Natijalarni yuklashda xatolik')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTest = async (e) => {
    e.preventDefault()

    if (!formData.testCode.trim() || !formData.title.trim() || !formData.totalQuestions || !formData.correctAnswers.trim()) {
      setError('Iltimos, barcha maydonlarni toʻldiring')
      return
    }

    const answers = formData.correctAnswers.toUpperCase().split(',').map((a) => a.trim())
    if (answers.length !== parseInt(formData.totalQuestions)) {
      setError(`${formData.totalQuestions} ta javob kiriting`) 
      return
    }

    setLoading(true)
    try {
      if (editingTest) {
        // Update test
        await updateDoc(doc(db, 'tests', editingTest.id), {
          testCode: formData.testCode.toUpperCase(),
          title: formData.title,
          totalQuestions: parseInt(formData.totalQuestions),
          correctAnswers: answers,
        })
        setError('')
        setError('✅ Test muvaffaqiyatli yangilandi')
        setEditingTest(null)
      } else {
        // Create new test
        const existingTest = tests.find((t) => t.testCode === formData.testCode.toUpperCase())
        if (existingTest) {
          setError('Bu test kodi allaqachon mavjud')
          setLoading(false)
          return
        }

        await addDoc(collection(db, 'tests'), {
          testCode: formData.testCode.toUpperCase(),
          title: formData.title,
          totalQuestions: parseInt(formData.totalQuestions),
          correctAnswers: answers,
          createdAt: serverTimestamp(),
        })
        setError('')
        setError('✅ Test muvaffaqiyatli yaratildi')
      }

      setFormData({
        testCode: '',
        title: '',
        totalQuestions: '',
        correctAnswers: '',
      })
      setView('tests')
      fetchTests()
    } catch (err) {
      setError('Testni saqlashda xatolik')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Bu testni oʻchirayotganingizga ishonchingiz komilmi?')) return

    setLoading(true)
    try {
      await deleteDoc(doc(db, 'tests', testId))
      fetchTests()
    } catch (err) {
      setError('Testni oʻchirishda xatolik')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTest = (test) => {
    setEditingTest(test)
    setFormData({
      testCode: test.testCode,
      title: test.title,
      totalQuestions: test.totalQuestions.toString(),
      correctAnswers: test.correctAnswers.join(', '),
    })
    setView('create-test')
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setAdminUser(null)
      setCurrentPage('home')
    } catch (err) {
      setError('Chiqishda xatolik')
      console.error(err)
    }
  }

  const selectedTest = tests.find((test) => test.id === selectedResultTestId)
  const filteredResults = selectedResultTestId
    ? results.filter((result) => result.testId === selectedResultTestId)
    : []

  const sortedFilteredResults = [...filteredResults].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.percentage !== a.percentage) return b.percentage - a.percentage
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
  })

  const participantChartData = sortedFilteredResults.map((result, index) => ({
    name: result.name,
    percentage: result.percentage,
    score: result.score,
    rank: index + 1,
  }))

  const errorFrequencyData = selectedTest
    ? selectedTest.correctAnswers.map((_, index) => ({ question: `${index + 1}-savol`, errors: 0 }))
    : []

  if (selectedTest) {
    filteredResults.forEach((result) => {
      if (Array.isArray(result.answers)) {
        result.answers.forEach((answer, index) => {
          const correctAnswer = selectedTest.correctAnswers[index]
          if ((answer || '').toUpperCase() !== (correctAnswer || '').toUpperCase()) {
            errorFrequencyData[index].errors += 1
          }
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <div className="bg-white dark:bg-slate-900 dark:border-b dark:border-slate-700 shadow-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Admin paneli</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition shadow-sm hover:shadow-lg"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
          <button
            onClick={() => setView('tests')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              view === 'tests'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Testlar
          </button>
          <button
            onClick={() => setView('create-test')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              view === 'create-test'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {editingTest ? 'Testni tahrirlash' : 'Test yaratish'}
          </button>
          <button
            onClick={() => setView('results')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              view === 'results'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Natijalar
          </button>
        </div>

        {/* Tests View */}
        {view === 'tests' && (
          <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl dark:shadow-slate-900/40 overflow-hidden transition-colors duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-slate-100">Testlar</h2>
              {tests.length === 0 ? (
                <p className="text-gray-600 dark:text-slate-300 text-center py-8">Hozircha testlar yoʻq</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Test kodi</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Sarlavha</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Savollar</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((test) => (
                        <tr key={test.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                          <td className="px-6 py-4 font-mono font-semibold text-blue-600 dark:text-blue-300">{test.testCode}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{test.title}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{test.totalQuestions}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEditTest(test)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 text-sm transition shadow-sm hover:shadow-md"
                            >
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition shadow-sm hover:shadow-md"
                            >
                              Oʻchirish
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Test View */}
        {view === 'create-test' && (
          <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl dark:shadow-slate-900/40 p-6 transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-slate-100">
              {editingTest ? 'Testni tahrirlash' : 'Yangi test yaratish'}
            </h2>
            <form onSubmit={handleCreateTest} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Test kodi</label>
                <input
                  type="text"
                  value={formData.testCode}
                  onChange={(e) => setFormData({ ...formData, testCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., TEST001"
                  disabled={editingTest ? true : false}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Sarlavha</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Test sarlavhasini kiriting"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Savollar soni</label>
                <input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                  placeholder="25"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Toʻgʻri javoblar (vergul bilan ajratilgan, masalan A, C, B, D, A)
                </label>
                <textarea
                  value={formData.correctAnswers}
                  onChange={(e) => setFormData({ ...formData, correctAnswers: e.target.value })}
                  placeholder="A, B, C, D, A, C..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-full transition shadow-sm hover:shadow-lg"
                >
                  {loading ? 'Saqlanmoqda...' : editingTest ? 'Testni yangilash' : 'Test yaratish'}
                </button>
                {editingTest && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTest(null)
                      setFormData({
                        testCode: '',
                        title: '',
                        totalQuestions: '',
                        correctAnswers: '',
                      })
                      setView('tests')
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold py-2 px-4 rounded-full transition shadow-sm"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Results View */}
        {view === 'results' && (
          <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl dark:shadow-slate-900/40 p-6 space-y-6 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Natijalar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Test tanlang</label>
                <select
                  value={selectedResultTestId}
                  onChange={(e) => setSelectedResultTestId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Testni tanlang --</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.testCode} — {test.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-4 border border-gray-200 dark:border-slate-700">
                <div className="text-sm text-gray-500 dark:text-slate-400">Tanlangan test</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                  {selectedTest ? `${selectedTest.testCode} — ${selectedTest.title}` : 'Hech narsa tanlanmadi'}
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                  {selectedTest ? `${selectedTest.totalQuestions} ta savol` : 'Avvalo testni tanlang'}
                </div>
              </div>
            </div>

            {!selectedResultTestId ? (
              <div className="text-gray-600 dark:text-slate-300 text-center py-12 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl">
                Iltimos, natijalarni ko'rish uchun testni tanlang.
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-gray-600 dark:text-slate-300 text-center py-12 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl">
                Ushbu test uchun natijalar topilmadi.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl dark:shadow-slate-900/40 p-4 transition-colors duration-300">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Ishtirokchilar statistikasi</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={participantChartData.slice(0, 10)} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}`, 'Foiz va Toʻgʻri javoblar']} />
                        <Legend />
                        <Bar dataKey="percentage" name="Foiz" fill="#3b82f6" />
                        <Bar dataKey="score" name="Toʻgʻri javoblar" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl dark:shadow-slate-900/40 p-4 transition-colors duration-300">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Eng koʻp xato qilingan savollar</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={errorFrequencyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="question" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [value, 'Xato soni']} />
                        <Bar dataKey="errors" name="Xato soni" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-3xl shadow-2xl dark:shadow-slate-900/40">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Oʻrin</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Ism</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">Baho</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">Foiz</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">Tillo</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Sana</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Vaqt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFilteredResults.map((result, index) => (
                        <tr key={result.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                          <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-100">{index + 1}</td>
                          <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-100">{result.name}</td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-slate-200">
                            {result.correctAnswers}/{result.totalQuestions}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-semibold ${result.percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-yellow-600 dark:text-yellow-400">
                            {result.tillo || 0} 🪙
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {result.createdAt ? new Date(result.createdAt.seconds * 1000).toLocaleDateString() : "Yo'q"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {result.createdAt ? new Date(result.createdAt.seconds * 1000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : "Yo'q"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
