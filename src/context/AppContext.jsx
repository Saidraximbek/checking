import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppContextProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('home') // home, answers, results, admin-login, admin-panel
  const [userInfo, setUserInfo] = useState({ name: '', testCode: '' })
  const [currentTest, setCurrentTest] = useState(null)
  const [userAnswers, setUserAnswers] = useState([])
  const [results, setResults] = useState(null)
  const [resultsSaved, setResultsSaved] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = window.localStorage.getItem('darkMode')
    return saved === 'true'
  })

  React.useEffect(() => {
    window.localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        userInfo,
        setUserInfo,
        currentTest,
        setCurrentTest,
        userAnswers,
        setUserAnswers,
        results,
        setResults,
        resultsSaved,
        setResultsSaved,
        adminUser,
        setAdminUser,
        loading,
        setLoading,
        error,
        setError,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider')
  }
  return context
}
