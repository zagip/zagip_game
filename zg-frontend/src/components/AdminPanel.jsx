import { useState, useEffect } from 'react'
import { FaPlus, FaList, FaTrash, FaSync, FaClock, FaWallet, FaCode, FaTasks } from 'react-icons/fa'
import { motion } from 'framer-motion'

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('create')
  const [balanceForm, setBalanceForm] = useState({
    username: '',
    newBalance: ''
  })
  const [balanceMessage, setBalanceMessage] = useState('')
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)
  const [codeForm, setCodeForm] = useState({
    code: '',
    reward: '',
    maxUses: ''
  })
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    link: '',
    reward: ''
  })
  const [codeMessage, setCodeMessage] = useState('')
  const [taskMessage, setTaskMessage] = useState('')
  const [isCreatingCode, setIsCreatingCode] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [nftForm, setNftForm] = useState({
    name: '',
    description: '',
    price: '',
    gradientColor1: '#3498db',
    gradientColor2: '#9b59b6',
    amount: 1
  })
  const [imageFile, setImageFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState('')
  const [nfts, setNfts] = useState([])
  const [isLoadingNfts, setIsLoadingNfts] = useState(false)
  const [nftListMessage, setNftListMessage] = useState('')

  // Codes and Tasks state
  const [codes, setCodes] = useState([])
  const [tasks, setTasks] = useState([])
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [codeListMessage, setCodeListMessage] = useState('')
  const [taskListMessage, setTaskListMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNftForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleColorChange = (colorField, value) => {
    setNftForm(prev => ({
      ...prev,
      [colorField]: value
    }))
  }

  const handleBalanceInputChange = (e) => {
    const { name, value } = e.target
    setBalanceForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const updateUserBalance = async () => {
    setIsUpdatingBalance(true)
    setBalanceMessage('')

    try {
      const token = sessionStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/balance`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          username: balanceForm.username,
          newBalance: parseInt(balanceForm.newBalance)
        })
      })

      const result = await response.json()

      if (response.ok && result.status === 'ok') {
        setBalanceMessage(`✅ Баланс пользователя ${result.username} обновлен до ${result.newBalance} монет`)
        setBalanceForm({
          username: '',
          newBalance: ''
        })
      } else if (response.status === 403) {
        setBalanceMessage('❌ У вас нет прав администратора')
      } else {
        setBalanceMessage(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setBalanceMessage(`❌ Ошибка сети: ${error.message}`)
    } finally {
      setIsUpdatingBalance(false)
    }
  }

  const handleBalanceSubmit = (e) => {
    e.preventDefault()

    if (!balanceForm.username.trim()) {
      setBalanceMessage('❌ Введите имя пользователя')
      return
    }
    if (!balanceForm.newBalance || parseInt(balanceForm.newBalance) < 0) {
      setBalanceMessage('❌ Введите корректный баланс')
      return
    }

    updateUserBalance()
  }

  const handleCodeInputChange = (e) => {
    const { name, value } = e.target
    setCodeForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const createCode = async () => {
    setIsCreatingCode(true)
    setCodeMessage('')

    try {
      const token = sessionStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/code/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          code: codeForm.code || null,
          reward: parseInt(codeForm.reward),
          maxUses: parseInt(codeForm.maxUses)
        })
      })

      const result = await response.json()

      if (response.ok && result.status === 'ok') {
        setCodeMessage(`✅ Код создан: ${result.code.code}`)
        setCodeForm({
          code: '',
          reward: '',
          maxUses: ''
        })
      } else {
        setCodeMessage(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setCodeMessage(`❌ Ошибка сети: ${error.message}`)
    } finally {
      setIsCreatingCode(false)
    }
  }

  const createTask = async () => {
    setIsCreatingTask(true)
    setTaskMessage('')

    try {
      const token = sessionStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/task/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          link: taskForm.link,
          reward: parseInt(taskForm.reward)
        })
      })

      const result = await response.json()

      if (response.ok && result.status === 'ok') {
        setTaskMessage(`✅ Задание создано успешно`)
        setTaskForm({
          title: '',
          description: '',
          link: '',
          reward: ''
        })
      } else {
        setTaskMessage(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setTaskMessage(`❌ Ошибка сети: ${error.message}`)
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleCodeSubmit = (e) => {
    e.preventDefault()

    if (!codeForm.reward || parseInt(codeForm.reward) <= 0) {
      setCodeMessage('❌ Введите корректную награду')
      return
    }
    if (!codeForm.maxUses || parseInt(codeForm.maxUses) <= 0) {
      setCodeMessage('❌ Введите корректное количество использований')
      return
    }

    createCode()
  }

  const handleTaskSubmit = (e) => {
    e.preventDefault()

    if (!taskForm.title.trim()) {
      setTaskMessage('❌ Введите название задания')
      return
    }
    if (!taskForm.description.trim()) {
      setTaskMessage('❌ Введите описание задания')
      return
    }
    if (!taskForm.link.trim()) {
      setTaskMessage('❌ Введите ссылку задания')
      return
    }
    if (!taskForm.reward || parseInt(taskForm.reward) <= 0) {
      setTaskMessage('❌ Введите корректную награду')
      return
    }

    createTask()
  }

  const createNFT = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      console.log('Creating NFT with image:', imageFile?.name, imageFile?.type, imageFile?.size);

      const formData = new FormData()
      formData.append('name', nftForm.name)
      formData.append('description', nftForm.description)
      formData.append('price', parseInt(nftForm.price))
      formData.append('gradientColor1', nftForm.gradientColor1)
      formData.append('gradientColor2', nftForm.gradientColor2)
      formData.append('amount', parseInt(nftForm.amount))

      // Make sure image is properly appended
      if (imageFile) {
        formData.append('image', imageFile, imageFile.name)
        console.log('Image appended to FormData:', imageFile.name);
      } else {
        console.error('No image file to append!');
      }

      const token = sessionStorage.getItem('authToken')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Don't set Content-Type header - let browser set it automatically for multipart/form-data
      console.log('Sending request to:', `${import.meta.env.VITE_API_URL}/admin/nft/create`);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/nft/create`, {
        method: 'POST',
        headers: headers,
        body: formData
      })

      console.log('Response status:', response.status);

      const result = await response.json()
      console.log('Response body:', result);

      if (response.ok && result.status === 'ok') {
        setMessage(`✅ Успешно создано ${result.nfts.length} NFT!`)
        setNftForm({
          name: '',
          description: '',
          price: '',
          gradientColor1: '#3498db',
          gradientColor2: '#9b59b6',
          amount: 1
        })
        setImageFile(null)
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else if (response.status === 403) {
        setMessage('❌ У вас нет прав администратора')
      } else {
        setMessage(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage(`❌ Ошибка сети: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (activeSection === 'list' && isAuthenticated) {
      loadNFTs()
    } else if (activeSection === 'codes' && isAuthenticated) {
      loadCodes()
    } else if (activeSection === 'tasks' && isAuthenticated) {
      loadTasks()
    }
  }, [activeSection, isAuthenticated])

  const loadNFTs = async () => {
    try {
      setIsLoadingNfts(true)
      setNftListMessage('')

      const token = sessionStorage.getItem('authToken')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/nft/admin/all`, {
        headers: headers
      })

      if (response.ok) {
        const data = await response.json()
        setNfts(data.nfts || [])
      } else {
        setNftListMessage('❌ Не удалось загрузить список NFT')
      }
    } catch (error) {
      setNftListMessage('❌ Ошибка сети при загрузке NFT')
      console.error('Error loading NFTs:', error)
    } finally {
      setIsLoadingNfts(false)
    }
  }

  const loadCodes = async () => {
    try {
      setIsLoadingCodes(true)
      setCodeListMessage('')

      const token = sessionStorage.getItem('authToken')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/code/all`, {
        headers: headers
      })

      if (response.ok) {
        const data = await response.json()
        setCodes(data.codes || [])
      } else {
        setCodeListMessage('❌ Не удалось загрузить список кодов')
      }
    } catch (error) {
      setCodeListMessage('❌ Ошибка сети при загрузке кодов')
      console.error('Error loading codes:', error)
    } finally {
      setIsLoadingCodes(false)
    }
  }

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true)
      setTaskListMessage('')

      const token = sessionStorage.getItem('authToken')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/task/all`, {
        headers: headers
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      } else {
        setTaskListMessage('❌ Не удалось загрузить список заданий')
      }
    } catch (error) {
      setTaskListMessage('❌ Ошибка сети при загрузке заданий')
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const deleteNFT = async (nftId, nftName) => {
    if (!confirm(`Вы уверены, что хотите удалить NFT "${nftName}"?`)) {
      return
    }

    try {
      const token = sessionStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/nft/delete`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({ id: nftId })
      })

      if (response.ok) {
        setNftListMessage(`✅ NFT "${nftName}" успешно удален`)
        // Reload the NFT list
        loadNFTs()
      } else {
        const result = await response.json()
        setNftListMessage(`❌ Ошибка при удалении: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setNftListMessage(`❌ Ошибка сети: ${error.message}`)
      console.error('Error deleting NFT:', error)
    }
  }

  const deleteCode = async (codeId, codeValue) => {
    if (!confirm(`Вы уверены, что хотите удалить код "${codeValue}"?`)) {
      return
    }

    try {
      const token = sessionStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/code/delete`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({ id: codeId })
      })

      if (response.ok) {
        setCodeListMessage(`✅ Код "${codeValue}" успешно удален`)
        loadCodes()
      } else {
        const result = await response.json()
        setCodeListMessage(`❌ Ошибка при удалении: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setCodeListMessage(`❌ Ошибка сети: ${error.message}`)
      console.error('Error deleting code:', error)
    }
  }

  const deleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Вы уверены, что хотите удалить задание "${taskTitle}"?`)) {
      return
    }

    try {
      const token = sessionStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/task/delete`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({ id: taskId })
      })

      if (response.ok) {
        setTaskListMessage(`✅ Задание "${taskTitle}" успешно удалено`)
        loadTasks()
      } else {
        const result = await response.json()
        setTaskListMessage(`❌ Ошибка при удалении: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setTaskListMessage(`❌ Ошибка сети: ${error.message}`)
      console.error('Error deleting task:', error)
    }
  }

  const rgbToHex = (color) => {
    if (!color) return '#3498db'
    if (typeof color === 'string') return color

    const { red, green, blue } = color
    return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`
  }

  const createGradient = (color1, color2) => {
    const hex1 = rgbToHex(color1)
    const hex2 = rgbToHex(color2)
    return `linear-gradient(135deg, ${hex1}, ${hex2})`
  }

  const checkAdminAuth = async () => {
    try {
      setIsCheckingAuth(true)

      // Initialize Telegram WebApp (same as main app)
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        // Authenticate with backend using initData
        const initData = tg.initData
        if (initData) {
          await authenticateUser(initData)
        } else {
          setAuthError('Данные Telegram недоступны')
        }
      } else {
        setAuthError('Приложение должно запускаться в Telegram')
      }
    } catch (error) {
      setAuthError('Ошибка подключения к серверу')
    } finally {
      setIsCheckingAuth(false)
    }
  }



  const authenticateUser = async (initData) => {
    try {
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

        // Check if user has admin role
        if (userData.role === 'ADMIN') {
          setIsAuthenticated(true)
          setAuthError(null)
          console.log('Admin authenticated successfully')
        } else {
          setAuthError('У вас нет прав администратора')
        }
      } else {
        setAuthError(`Ошибка аутентификации: ${response.status}`)
      }
    } catch (error) {
      setAuthError('Не удалось подключиться к серверу')
      console.error('Failed to authenticate admin:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Detailed validation with specific error messages
    if (!nftForm.name.trim()) {
      setMessage('❌ Введите название NFT')
      return
    }
    if (!nftForm.description.trim()) {
      setMessage('❌ Введите описание NFT')
      return
    }
    if (!nftForm.price || parseFloat(nftForm.price) <= 0) {
      setMessage('❌ Введите корректную цену')
      return
    }
    if (!imageFile) {
      setMessage('❌ Выберите изображение для NFT')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      setMessage('❌ Поддерживаются только изображения (JPG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      setMessage('❌ Размер изображения не должен превышать 5MB')
      return
    }

    console.log('Form validation passed, creating NFT with:', {
      name: nftForm.name,
      description: nftForm.description,
      price: nftForm.price,
      imageFile: imageFile.name,
      imageSize: imageFile.size
    });

    createNFT()
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="app">
        <div className="content">
          <div className="page">
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <h2 style={{ color: 'var(--tg-theme-text-color)', marginBottom: '12px' }}>
                Проверка доступа...
              </h2>
              <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
                Проверяем права администратора
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error if not authenticated or not admin
  if (!isAuthenticated || authError) {
    return (
      <div className="app">
        <div className="content">
          <div className="page">
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</div>
              <h2 style={{ color: 'var(--tg-theme-text-color)', marginBottom: '12px' }}>
                Доступ запрещен
              </h2>
              <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', marginBottom: '20px' }}>
                {authError || 'У вас нет прав для доступа к админ панели'}
              </p>
              <button
                className="btn"
                onClick={() => window.location.href = '/'}
                style={{ marginTop: '0' }}
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="content" style={{ paddingBottom: '40px' }}>
        <div className="page">
          <h1 className="page-title">Админ панель</h1>

          {/* Navigation */}
          <div className="card">
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className={`btn ${activeSection === 'create' ? '' : 'btn-secondary'}`}
                onClick={() => setActiveSection('create')}
                style={{
                  flex: 1,
                  margin: 0,
                  background: activeSection === 'create' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                  color: activeSection === 'create' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
                }}
              >
                <FaPlus style={{ marginRight: '8px' }} />
                Создать NFT
              </button>
              <button
                className={`btn ${activeSection === 'list' ? '' : 'btn-secondary'}`}
                onClick={() => setActiveSection('list')}
                style={{
                  flex: 1,
                  margin: 0,
                  background: activeSection === 'list' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                  color: activeSection === 'list' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
                }}
              >
                <FaList style={{ marginRight: '8px' }} />
                Список NFT
              </button>
              <button
                className={`btn ${activeSection === 'balance' ? '' : 'btn-secondary'}`}
                onClick={() => setActiveSection('balance')}
                style={{
                  flex: 1,
                  margin: 0,
                  background: activeSection === 'balance' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                  color: activeSection === 'balance' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
                }}
              >
                <FaWallet style={{ marginRight: '8px' }} />
                Баланс
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                className={`btn ${activeSection === 'codes' ? '' : 'btn-secondary'}`}
                onClick={() => setActiveSection('codes')}
                style={{
                  flex: 1,
                  margin: 0,
                  background: activeSection === 'codes' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                  color: activeSection === 'codes' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
                }}
              >
                <FaCode style={{ marginRight: '8px' }} />
                Коды
              </button>
              <button
                className={`btn ${activeSection === 'tasks' ? '' : 'btn-secondary'}`}
                onClick={() => setActiveSection('tasks')}
                style={{
                  flex: 1,
                  margin: 0,
                  background: activeSection === 'tasks' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                  color: activeSection === 'tasks' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
                }}
              >
                <FaTasks style={{ marginRight: '8px' }} />
                Задания
              </button>
            </div>
          </div>

          {/* Create NFT Form */}
          {activeSection === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card">
                <h3 style={{ marginBottom: '20px', color: 'var(--tg-theme-text-color)', fontSize: '18px', fontWeight: '600' }}>
                  Создание NFT
                </h3>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Название *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={nftForm.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Введите название NFT"
                      style={{ textAlign: 'left' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Описание *
                    </label>
                    <textarea
                      name="description"
                      value={nftForm.description}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Введите описание NFT"
                      style={{ textAlign: 'left', minHeight: '80px', resize: 'vertical' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                        Цена (🪙) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={nftForm.price}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="100"
                        step="1"
                        // min="0"
                        style={{ textAlign: 'left' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                        Количество
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={nftForm.amount}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="1"
                        min="1"
                        style={{ textAlign: 'left' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Загрузка изображения *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setImageFile(file);
                        console.log('File selected:', file?.name, file?.size);
                      }}
                      className="input"
                      style={{ textAlign: 'left' }}
                      required
                    />
                    {imageFile && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>
                        Выбран файл: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                        Цвет градиента 1
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={nftForm.gradientColor1}
                          onChange={(e) => handleColorChange('gradientColor1', e.target.value)}
                          style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={nftForm.gradientColor1}
                          onChange={(e) => handleColorChange('gradientColor1', e.target.value)}
                          className="input"
                          style={{ textAlign: 'left', flex: 1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                        Цвет градиента 2
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={nftForm.gradientColor2}
                          onChange={(e) => handleColorChange('gradientColor2', e.target.value)}
                          style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={nftForm.gradientColor2}
                          onChange={(e) => handleColorChange('gradientColor2', e.target.value)}
                          className="input"
                          style={{ textAlign: 'left', flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Предварительный просмотр
                    </label>
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${nftForm.gradientColor1}, ${nftForm.gradientColor2})`,
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        color: 'white',
                        minHeight: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {imageFile ? (
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : ''}
                          alt="NFT Preview"
                          style={{ maxWidth: '60px', maxHeight: '60px', borderRadius: '8px' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div style={{ fontSize: '24px' }}>🎨</div>
                      )}
                    </div>
                  </div>

                  {message && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      backgroundColor: message.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: message.includes('✅') ? '#27ae60' : '#e74c3c',
                      fontSize: '14px'
                    }}>
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn"
                    disabled={isLoading}
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? 'Создание...' : 'Создать NFT'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* NFT List */}
          {activeSection === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--tg-theme-text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    Список NFT ({nfts.length})
                  </h3>
                  <button
                    className="btn"
                    onClick={loadNFTs}
                    disabled={isLoadingNfts}
                    style={{
                      margin: 0,
                      padding: '8px 16px',
                      fontSize: '14px',
                      opacity: isLoadingNfts ? 0.7 : 1
                    }}
                  >
                    {isLoadingNfts ? <FaClock style={{ marginRight: '6px' }} /> : <FaSync style={{ marginRight: '6px' }} />}
                    Обновить
                  </button>
                </div>

                {nftListMessage && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: nftListMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: nftListMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                    fontSize: '14px'
                  }}>
                    {nftListMessage}
                  </div>
                )}

                {isLoadingNfts && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка NFT...</div>
                  </div>
                )}

                {!isLoadingNfts && nfts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>NFT пока нет</div>
                  </div>
                )}

                {!isLoadingNfts && nfts.length > 0 && (
                  <div className="admin-nft-list">
                    {nfts.map(nft => (
                      <div key={nft.id} className="admin-nft-item">
                        <div
                          className="admin-nft-image"
                          style={{ background: createGradient(nft.gradientColor1, nft.gradientColor2) }}
                        >
                          {nft.imageURL ? (
                            <img
                              src={nft.imageURL}
                              alt={nft.name}
                              className="admin-nft-image-img"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <div className="admin-nft-emoji">🎨</div>
                          )}
                        </div>
                        <div className="admin-nft-info">
                          <h4 className="admin-nft-name">{nft.name}</h4>
                          <p className="admin-nft-description">{nft.description}</p>
                          <div className="admin-nft-details">
                            <span className="admin-nft-price">{nft.price} 🪙</span>
                            <span className="admin-nft-id">ID: {nft.id}</span>
                          </div>
                        </div>
                        <div className="admin-nft-actions">
                          <button
                            className="btn-danger"
                            onClick={() => deleteNFT(nft.id, nft.name)}
                            style={{
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#c0392b'}
                            onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                          >
                            <FaTrash style={{ marginRight: '6px' }} />
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <style jsx>{`
                .admin-nft-list {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                }
                
                .admin-nft-item {
                  display: flex;
                  align-items: center;
                  gap: 16px;
                  padding: 16px;
                  background: var(--tg-theme-bg-color);
                  border-radius: 12px;
                  border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .admin-nft-image {
                  width: 60px;
                  height: 60px;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                }
                
                .admin-nft-image-img {
                  width: 40px;
                  height: 40px;
                  object-fit: cover;
                  border-radius: 8px;
                }
                
                .admin-nft-emoji {
                  font-size: 24px;
                }
                
                .admin-nft-info {
                  flex: 1;
                  min-width: 0;
                }
                
                .admin-nft-name {
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--tg-theme-text-color);
                  margin: 0 0 4px 0;
                }
                
                .admin-nft-description {
                  font-size: 14px;
                  color: var(--tg-theme-hint-color);
                  margin: 0 0 8px 0;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
                
                .admin-nft-details {
                  display: flex;
                  gap: 16px;
                  align-items: center;
                }
                
                .admin-nft-price {
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--tg-theme-button-color);
                }
                
                .admin-nft-id {
                  font-size: 12px;
                  color: var(--tg-theme-hint-color);
                }
                
                .admin-nft-actions {
                  flex-shrink: 0;
                }

                .admin-list {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                }
                
                .admin-list-item {
                  display: flex;
                  align-items: flex-start;
                  gap: 16px;
                  padding: 16px;
                  background: var(--tg-theme-bg-color);
                  border-radius: 12px;
                  border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .admin-item-info {
                  flex: 1;
                  min-width: 0;
                }
                
                .admin-item-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--tg-theme-text-color);
                  margin: 0 0 4px 0;
                }
                
                .admin-item-description {
                  font-size: 14px;
                  color: var(--tg-theme-hint-color);
                  margin: 0 0 8px 0;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
                
                .admin-item-details {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 12px;
                  align-items: center;
                }
                
                .admin-item-status,
                .admin-item-reward,
                .admin-item-link {
                  font-size: 12px;
                  color: var(--tg-theme-text-color);
                }
                
                .admin-item-id {
                  font-size: 12px;
                  color: var(--tg-theme-hint-color);
                }
                
                .admin-item-actions {
                  flex-shrink: 0;
                }
              `}</style>
            </motion.div>
          )}

          {/* Balance Management */}
          {activeSection === 'balance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card">
                <h3 style={{ marginBottom: '20px', color: 'var(--tg-theme-text-color)', fontSize: '18px', fontWeight: '600' }}>
                  Управление балансом пользователей
                </h3>

                <form onSubmit={handleBalanceSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Имя пользователя *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={balanceForm.username}
                      onChange={handleBalanceInputChange}
                      className="input"
                      placeholder="Введите имя пользователя"
                      style={{ textAlign: 'left' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Новый баланс (🪙) *
                    </label>
                    <input
                      type="number"
                      name="newBalance"
                      value={balanceForm.newBalance}
                      onChange={handleBalanceInputChange}
                      className="input"
                      placeholder="0"
                      step="1"
                      min="0"
                      style={{ textAlign: 'left' }}
                      required
                    />
                  </div>

                  {balanceMessage && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      backgroundColor: balanceMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: balanceMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                      fontSize: '14px'
                    }}>
                      {balanceMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn"
                    disabled={isUpdatingBalance}
                    style={{
                      opacity: isUpdatingBalance ? 0.7 : 1,
                      cursor: isUpdatingBalance ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isUpdatingBalance ? 'Обновление...' : 'Обновить баланс'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Code Management */}
          {activeSection === 'codes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card">
                <h3 style={{ marginBottom: '20px', color: 'var(--tg-theme-text-color)', fontSize: '18px', fontWeight: '600' }}>
                  Создание кодов
                </h3>

                <form onSubmit={handleCodeSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Код (оставьте пустым для автогенерации)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={codeForm.code}
                      onChange={handleCodeInputChange}
                      className="input"
                      placeholder="Введите код или оставьте пустым"
                      style={{ textAlign: 'left' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                        Награда (🪙) *
                      </label>
                      <input
                        type="number"
                        name="reward"
                        value={codeForm.reward}
                        onChange={handleCodeInputChange}
                        className="input"
                        placeholder="100"
                        step="1"
                        min="1"
                        style={{ textAlign: 'left' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                        Макс. использований *
                      </label>
                      <input
                        type="number"
                        name="maxUses"
                        value={codeForm.maxUses}
                        onChange={handleCodeInputChange}
                        className="input"
                        placeholder="10"
                        min="1"
                        style={{ textAlign: 'left' }}
                        required
                      />
                    </div>
                  </div>

                  {codeMessage && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      backgroundColor: codeMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: codeMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                      fontSize: '14px'
                    }}>
                      {codeMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn"
                    disabled={isCreatingCode}
                    style={{
                      opacity: isCreatingCode ? 0.7 : 1,
                      cursor: isCreatingCode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isCreatingCode ? 'Создание...' : 'Создать код'}
                  </button>
                </form>
              </div>

              {/* Codes List */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--tg-theme-text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    Список кодов ({codes.length})
                  </h3>
                  <button
                    className="btn"
                    onClick={loadCodes}
                    disabled={isLoadingCodes}
                    style={{
                      margin: 0,
                      padding: '8px 16px',
                      fontSize: '14px',
                      opacity: isLoadingCodes ? 0.7 : 1
                    }}
                  >
                    {isLoadingCodes ? <FaClock style={{ marginRight: '6px' }} /> : <FaSync style={{ marginRight: '6px' }} />}
                    Обновить
                  </button>
                </div>

                {codeListMessage && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: codeListMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: codeListMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                    fontSize: '14px'
                  }}>
                    {codeListMessage}
                  </div>
                )}

                {isLoadingCodes && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка кодов...</div>
                  </div>
                )}

                {!isLoadingCodes && codes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Кодов пока нет</div>
                  </div>
                )}

                {!isLoadingCodes && codes.length > 0 && (
                  <div className="admin-list">
                    {codes.map(code => (
                      <div key={code.id} className="admin-list-item">
                        <div className="admin-item-info">
                          <h4 className="admin-item-title">{code.code}</h4>
                          <p className="admin-item-description">
                            Награда: {code.reward} 🪙 | Использований: {code.currentUses}/{code.maxUses}
                          </p>
                          <div className="admin-item-details">
                            <span className="admin-item-status">
                              {code.active ? '✅ Активен' : '❌ Неактивен'}
                            </span>
                            <span className="admin-item-id">ID: {code.id}</span>
                          </div>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            className="btn-danger"
                            onClick={() => deleteCode(code.id, code.code)}
                            style={{
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#c0392b'}
                            onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                          >
                            <FaTrash style={{ marginRight: '6px' }} />
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Task Management */}
          {activeSection === 'tasks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card">
                <h3 style={{ marginBottom: '20px', color: 'var(--tg-theme-text-color)', fontSize: '18px', fontWeight: '600' }}>
                  Создание заданий
                </h3>

                <form onSubmit={handleTaskSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Название *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={taskForm.title}
                      onChange={handleTaskInputChange}
                      className="input"
                      placeholder="Введите название задания"
                      style={{ textAlign: 'left' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Описание *
                    </label>
                    <textarea
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskInputChange}
                      className="input"
                      placeholder="Введите описание задания"
                      style={{ textAlign: 'left', minHeight: '80px', resize: 'vertical' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Ссылка *
                    </label>
                    <input
                      type="url"
                      name="link"
                      value={taskForm.link}
                      onChange={handleTaskInputChange}
                      className="input"
                      placeholder="https://example.com"
                      style={{ textAlign: 'left' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--tg-theme-text-color)', fontSize: '14px' }}>
                      Награда (🪙) *
                    </label>
                    <input
                      type="number"
                      name="reward"
                      value={taskForm.reward}
                      onChange={handleTaskInputChange}
                      className="input"
                      placeholder="50"
                      step="1"
                      min="1"
                      style={{ textAlign: 'left' }}
                      required
                    />
                  </div>

                  {taskMessage && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      backgroundColor: taskMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: taskMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                      fontSize: '14px'
                    }}>
                      {taskMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn"
                    disabled={isCreatingTask}
                    style={{
                      opacity: isCreatingTask ? 0.7 : 1,
                      cursor: isCreatingTask ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isCreatingTask ? 'Создание...' : 'Создать задание'}
                  </button>
                </form>
              </div>

              {/* Tasks List */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--tg-theme-text-color)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    Список заданий ({tasks.length})
                  </h3>
                  <button
                    className="btn"
                    onClick={loadTasks}
                    disabled={isLoadingTasks}
                    style={{
                      margin: 0,
                      padding: '8px 16px',
                      fontSize: '14px',
                      opacity: isLoadingTasks ? 0.7 : 1
                    }}
                  >
                    {isLoadingTasks ? <FaClock style={{ marginRight: '6px' }} /> : <FaSync style={{ marginRight: '6px' }} />}
                    Обновить
                  </button>
                </div>

                {taskListMessage && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: taskListMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: taskListMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                    fontSize: '14px'
                  }}>
                    {taskListMessage}
                  </div>
                )}

                {isLoadingTasks && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка заданий...</div>
                  </div>
                )}

                {!isLoadingTasks && tasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Заданий пока нет</div>
                  </div>
                )}

                {!isLoadingTasks && tasks.length > 0 && (
                  <div className="admin-list">
                    {tasks.map(task => (
                      <div key={task.id} className="admin-list-item">
                        <div className="admin-item-info">
                          <h4 className="admin-item-title">{task.title}</h4>
                          <p className="admin-item-description">{task.description}</p>
                          <div className="admin-item-details">
                            <span className="admin-item-reward">Награда: {task.reward} 🪙</span>
                            <span className="admin-item-link">
                              <a href={task.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tg-theme-button-color)', textDecoration: 'none' }}>
                                Ссылка ↗
                              </a>
                            </span>
                            <span className="admin-item-id">ID: {task.id}</span>
                          </div>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            className="btn-danger"
                            onClick={() => deleteTask(task.id, task.title)}
                            style={{
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#c0392b'}
                            onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                          >
                            <FaTrash style={{ marginRight: '6px' }} />
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel