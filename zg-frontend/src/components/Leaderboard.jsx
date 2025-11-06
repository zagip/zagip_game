import { useState, useEffect } from 'react'
import { FaTrophy, FaTimes } from 'react-icons/fa'

const Leaderboard = ({ user: currentUser }) => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700'
      case 2: return '#C0C0C0'
      case 3: return '#CD7F32'
      default: return '#667eea'
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true)
      const token = sessionStorage.getItem('authToken')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard/users`, {
        headers: headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setError(null)
      } else {
        setError('Не удалось загрузить таблицу лидеров')
      }
    } catch (err) {
      setError('Ошибка сети при загрузке данных')
      console.error('Error loading leaderboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserDetails = async (userId) => {
    try {
      setIsLoadingDetails(true)
      const token = sessionStorage.getItem('authToken')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard/user/${userId}`, {
        headers: headers
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'ok') {
          setUserDetails(data)
        }
      }
    } catch (err) {
      console.error('Error loading user details:', err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
    loadUserDetails(user.id)
  }

  const closeModal = () => {
    setSelectedUser(null)
    setUserDetails(null)
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

  const getCurrentUserRank = () => {
    if (!currentUser) return null
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    return userIndex !== -1 ? userIndex + 1 : null
  }

  return (
    <div className="page">
      <h1 className="page-title">Таблица лидеров</h1>
      
      {isLoading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка...</div>
        </div>
      )}

      {error && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <div style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '16px' }}>{error}</div>
          <button className="btn" onClick={loadLeaderboard} style={{ marginTop: '0' }}>
            Попробовать снова
          </button>
        </div>
      )}

      {!isLoading && !error && currentUser && (
        <div className="card current-user-card">
          <div className="user-item current-user">
            <div className="user-rank">
              #{getCurrentUserRank() || '?'}
            </div>
            <div className="user-avatar">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
              ) : (
                '😎'
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.username || 'Вы'}</div>
              <div className="user-points">{currentUser.balance?.toLocaleString() || '0'} монет</div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: 'var(--tg-theme-text-color)', fontSize: '18px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FaTrophy /> Лучшие игроки
          </h3>
          <div className="leaderboard-list">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className="user-item" 
                onClick={() => handleUserClick(user)}
                style={{
                  background: user.pinnedNFT ? 
                    createGradient(user.pinnedNFT.gradientColor1, user.pinnedNFT.gradientColor2) : 
                    'var(--tg-theme-bg-color)',
                  color: user.pinnedNFT ? 'white' : 'inherit'
                }}
              >
                <div className="user-rank" style={{ color: user.pinnedNFT ? 'white' : getRankColor(index + 1) }}>
                  {getRankIcon(index + 1)}
                </div>
                <div className="user-avatar">
                  {user.avatarURL ? (
                    <img src={user.avatarURL} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name" style={{ color: user.pinnedNFT ? 'white' : 'var(--tg-theme-text-color)' }}>
                    {user.username || 'Пользователь'}
                  </div>
                  <div className="user-points" style={{ color: user.pinnedNFT ? 'rgba(255,255,255,0.8)' : 'var(--tg-theme-hint-color)' }}>
                    {user.balance?.toLocaleString() || '0'} монет
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>Пользователи не найдены</div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedUser.username || 'Пользователь'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            {isLoadingDetails && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                <div style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка...</div>
              </div>
            )}

            {!isLoadingDetails && userDetails && (
              <div className="modal-body">
                <div className="user-details">
                  <div className="detail-item">
                    <span>Баланс:</span>
                    <span>{userDetails.user.balance?.toLocaleString() || '0'} монет</span>
                  </div>
                  <div className="detail-item">
                    <span>NFT:</span>
                    <span>{userDetails.nfts?.length || 0}</span>
                  </div>
                </div>

                {userDetails.nfts && userDetails.nfts.length > 0 && (
                  <div className="user-nfts">
                    <h4>NFT коллекция:</h4>
                    <div className="modal-nft-grid">
                      {userDetails.nfts.map(nft => (
                        <div key={nft.id} className="modal-nft-card">
                          <div 
                            className="modal-nft-image"
                            style={{ background: createGradient(nft.gradientColor1, nft.gradientColor2) }}
                          >
                            {nft.imageURL ? (
                              <img 
                                src={nft.imageURL} 
                                alt={nft.name}
                                className="modal-nft-image-img"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            ) : (
                              <div className="modal-nft-emoji">🎨</div>
                            )}
                          </div>
                          <div className="modal-nft-info">
                            <div className="modal-nft-name">{nft.name}</div>
                            <div className="modal-nft-price">{nft.price} 🪙</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}



      <style jsx>{`
        .current-user-card {
          background: var(--tg-theme-button-color);
          color: var(--tg-theme-button-text-color);
        }
        
        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .user-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background: var(--tg-theme-bg-color);
          border-radius: 12px;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .user-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .current-user {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .user-item:active {
          transform: scale(0.98);
        }
        
        .user-rank {
          font-size: 16px;
          font-weight: 600;
          min-width: 35px;
          text-align: center;
          color: var(--tg-theme-button-color);
        }
        
        .current-user .user-rank {
          color: var(--tg-theme-button-text-color);
        }
        
        .user-avatar {
          font-size: 24px;
          margin: 0 12px;
          display:flex;
        }
        
        .user-info {
          flex: 1;
        }
        
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--tg-theme-text-color);
          margin-bottom: 2px;
        }
        
        .current-user .user-name {
          color: var(--tg-theme-button-text-color);
        }
        
        .user-points {
          font-size: 12px;
          color: var(--tg-theme-hint-color);
          font-weight: 400;
        }
        
        .current-user .user-points {
          color: var(--tg-theme-button-text-color);
          opacity: 0.8;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-content {
          background: var(--tg-theme-secondary-bg-color);
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          z-index: 10000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--tg-theme-text-color);
          font-size: 18px;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--tg-theme-hint-color);
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
        }

        .modal-body {
          padding: 0px 20px;
        }

        .user-details {
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-item span:first-child {
          color: var(--tg-theme-text-color);
          font-size: 14px;
        }

        .detail-item span:last-child {
          color: var(--tg-theme-button-color);
          font-weight: 600;
          font-size: 14px;
        }

        .user-nfts h4 {
          color: var(--tg-theme-text-color);
          font-size: 16px;
          margin: 0 0 12px 0;
        }

        .modal-nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .modal-nft-card {
          background: var(--tg-theme-bg-color);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .modal-nft-image {
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-nft-emoji {
          font-size: 24px;
        }

        .modal-nft-image-img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 8px;
        }

        .modal-nft-info {
          padding: 8px;
          text-align: center;
        }

        .modal-nft-name {
          font-size: 10px;
          font-weight: 600;
          color: var(--tg-theme-text-color);
          margin-bottom: 4px;
        }

        .modal-nft-price {
          font-size: 9px;
          color: var(--tg-theme-button-color);
          font-weight: 600;
        }

      `}</style>
    </div>
  )
}

export default Leaderboard