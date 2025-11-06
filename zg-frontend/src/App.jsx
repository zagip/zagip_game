import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import './App.css'
import Home from './components/Home'
import NFTShop from './components/NFTShop'
import Auction from './components/Auction'
import Leaderboard from './components/Leaderboard'
import Profile from './components/Profile'
import BottomNav from './components/BottomNav'
import AdminPanel from './components/AdminPanel'

// Main App Component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  )
}

// Main Telegram App Component
function MainApp() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Update active tab based on location
  useEffect(() => {
    const path = location.pathname.substring(1) || 'home'
    if (['home', 'nft', 'auction', 'leaderboard', 'profile'].includes(path)) {
      setActiveTab(path)
    }
  }, [location])

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      // Authenticate with backend using initData
      const initData = tg.initData
      if (initData) {
        authenticateUser(initData)
      } else {
        setIsLoading(false)
        setAuthError('Данные Telegram недоступны')
      }
    } else {
      setIsLoading(false)
      setAuthError('Приложение должно запускаться в Telegram')
    }
  }, [])

  const authenticateUser = async (initData) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: initData
        })
      })

      if (response.ok) {
        const userData = await response.json()
        // Store JWT token in sessionStorage (session-only)
        if (userData.token) {
          sessionStorage.setItem('authToken', userData.token)
        }
        setUser({
          id: userData.userId,
          username: userData.username,
          balance: userData.balance,
          avatarUrl: userData.avatarUrl,
          pinnedNFT: userData.pinnedNFT
        })
        setIsAuthenticated(true)
        setAuthError(null)
        console.log('User authenticated successfully')
      } else {
        setIsAuthenticated(false)
        setAuthError(`Ошибка аутентификации: ${response.status}`)
        console.error('Authentication failed:', response.status)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setAuthError('Не удалось подключиться к серверу')
      console.error('Failed to authenticate user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserData = async () => {
    const token = sessionStorage.getItem('authToken')
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.id,
          username: userData.username,
          balance: userData.balance,
          avatarUrl: userData.avatarURL,
          pinnedNFT: userData.pinnedNFT
        })
      } else if (response.status === 401) {
        // Token expired, need to re-authenticate
        sessionStorage.removeItem('authToken')
        setIsAuthenticated(false)
        setAuthError('Сессия истекла. Перезапустите приложение')
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }



  // Show loading screen
  if (isLoading) {
    return (
      <div className="app">
        <div className="content">
          <div className="page">
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <h2 style={{ color: 'var(--tg-theme-text-color)', marginBottom: '12px' }}>
                Загрузка...
              </h2>
              <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
                Подключение к серверу
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error screen if authentication failed
  if (!isAuthenticated || authError) {
    return (
      <div className="app">
        <div className="content">
          <div className="page">
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
              <h2 style={{ color: 'var(--tg-theme-text-color)', marginBottom: '12px' }}>
                Ошибка доступа
              </h2>
              <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', marginBottom: '20px' }}>
                {authError || 'Не удалось войти в приложение'}
              </p>
              <button
                className="btn"
                onClick={() => window.location.reload()}
                style={{ marginTop: '0' }}
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show main app if authenticated
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          <motion.div
            className="content"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Home user={user} refreshUserData={refreshUserData} />
          </motion.div>
        } />
        <Route path="/nft" element={
          <motion.div
            className="content"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <NFTShop user={user} refreshUserData={refreshUserData} />
          </motion.div>
        } />
        <Route path="/auction" element={
          <motion.div
            className="content"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Auction user={user} refreshUserData={refreshUserData} />
          </motion.div>
        } />
        <Route path="/leaderboard" element={
          <motion.div
            className="content"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Leaderboard user={user} />
          </motion.div>
        } />
        <Route path="/profile" element={
          <motion.div
            className="content"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Profile user={user} refreshUserData={refreshUserData} />
          </motion.div>
        } />
      </Routes>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
