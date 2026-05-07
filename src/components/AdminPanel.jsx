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

export default function AdminPanel() {
  const { setCurrentPage, setAdminUser, setError, setLoading, loading } = useAppContext()
  const [view, setView] = useState('tests') // tests, create-test, results
  const [tests, setTests] = useState([])
  const [results, setResults] = useState([])
  const [editingTest, setEditingTest] = useState(null)
  const [testCodeFilter, setTestCodeFilter] = useState('')

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin paneli</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setView('tests')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === 'tests'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Testlar
          </button>
          <button
            onClick={() => setView('create-test')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === 'create-test'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {editingTest ? 'Testni tahrirlash' : 'Test yaratish'}
          </button>
          <button
            onClick={() => setView('results')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === 'results'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Natijalar
          </button>
        </div>

        {/* Tests View */}
        {view === 'tests' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Testlar</h2>
              {tests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Hozircha testlar yoʻq</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Test kodi</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sarlavha</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Savollar</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((test) => (
                        <tr key={test.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono font-semibold text-blue-600">{test.testCode}</td>
                          <td className="px-6 py-4 text-gray-700">{test.title}</td>
                          <td className="px-6 py-4 text-gray-700">{test.totalQuestions}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEditTest(test)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 text-sm transition"
                            >
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingTest ? 'Testni tahrirlash' : 'Yangi test yaratish'}
            </h2>
            <form onSubmit={handleCreateTest} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test kodi</label>
                <input
                  type="text"
                  value={formData.testCode}
                  onChange={(e) => setFormData({ ...formData, testCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., TEST001"
                  disabled={editingTest ? true : false}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Test sarlavhasini kiriting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Savollar soni</label>
                <input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                  placeholder="25"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toʻgʻri javoblar (vergul bilan ajratilgan, masalan A, C, B, D, A)
                </label>
                <textarea
                  value={formData.correctAnswers}
                  onChange={(e) => setFormData({ ...formData, correctAnswers: e.target.value })}
                  placeholder="A, B, C, D, A, C..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
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
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Natijalar</h2>
            
            {/* Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Test kodi bo'yicha filter</label>
              <input
                type="text"
                value={testCodeFilter}
                onChange={(e) => setTestCodeFilter(e.target.value.toUpperCase())}
                placeholder="Test kodini kiriting (masalan: TEST001)"
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            {results.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Hozircha natijalar yoʻq</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ism</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Test kodi</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Baho</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Foiz</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sana</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vaqt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .filter((result) => !testCodeFilter || result.testCode.includes(testCodeFilter))
                      .map((result) => (
                        <tr key={result.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-800">{result.name}</td>
                          <td className="px-6 py-4 font-mono text-blue-600">{result.testCode}</td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-700">
                            {result.correctAnswers}/{result.totalQuestions}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-semibold ${result.percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.percentage}%
                            </span>
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
