import React from 'react'
import { AppContextProvider, useAppContext } from './context/AppContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import AnswerForm from './components/AnswerForm'
import Results from './components/Results'
import AdminLogin from './components/AdminLogin'
import AdminPanel from './components/AdminPanel'

function AppContent() {
  const { currentPage } = useAppContext()

  return (
    <div>
      <div className="bg-slate-900 text-white text-right px-4 py-2 text-sm font-semibold">
        Murodilov Saidraxim
      </div>
      <Navbar />
      {currentPage === 'home' && <Home />}
      {currentPage === 'answers' && <AnswerForm />}
      {currentPage === 'results' && <Results />}
      {currentPage === 'admin-login' && <AdminLogin />}
      {currentPage === 'admin-panel' && <AdminPanel />}
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
