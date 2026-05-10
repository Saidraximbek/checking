import React from 'react'
import { AppContextProvider, useAppContext } from './context/AppContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import AnswerForm from './components/AnswerForm'
import Results from './components/Results'
import AdminLogin from './components/AdminLogin'
import AdminPanel from './components/AdminPanel'

function AppContent() {
  const { currentPage, darkMode } = useAppContext()

  return (
    <div className={`${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen transition-colors duration-300`}>
      <div className="bg-slate-900 dark:bg-slate-800 text-white text-right px-4 py-2 text-sm font-semibold transition-colors duration-300 shadow-sm">
        Murodilov Saidraxim
      </div>
      <Navbar />
      <main className="transition-colors duration-300">
        {currentPage === 'home' && <Home />}
        {currentPage === 'answers' && <AnswerForm />}
        {currentPage === 'results' && <Results />}
        {currentPage === 'admin-login' && <AdminLogin />}
        {currentPage === 'admin-panel' && <AdminPanel />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  )
}
