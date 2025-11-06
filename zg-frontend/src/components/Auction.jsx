import { useState, useEffect } from 'react'
import { FaGavel, FaUser, FaClock, FaTimes } from 'react-icons/fa'

const Auction = ({ user, refreshUserData }) => {
    const [auctions, setAuctions] = useState([])
    const [myAuctions, setMyAuctions] = useState([])
    const [activeTab, setActiveTab] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [buyingAuction, setBuyingAuction] = useState(null)
    const [cancelingAuction, setCancelingAuction] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        loadAuctions()
        if (user) {
            loadMyAuctions()
        }
    }, [user])

    const loadAuctions = async () => {
        try {
            setIsLoading(true)
            const token = sessionStorage.getItem('authToken')
            const headers = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auction/all`, {
                headers: headers
            })

            if (response.ok) {
                const data = await response.json()
                setAuctions(data.auctions || [])
                setError(null)
            } else {
                setError('Не удалось загрузить аукционы')
            }
        } catch (err) {
            setError('Ошибка сети при загрузке аукционов')
            console.error('Error loading auctions:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMyAuctions = async () => {
        try {
            const token = sessionStorage.getItem('authToken')
            const headers = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auction/my`, {
                headers: headers
            })

            if (response.ok) {
                const data = await response.json()
                setMyAuctions(data.auctions || [])
            }
        } catch (err) {
            console.error('Error loading my auctions:', err)
        }
    }

    const handleBuyFromAuction = async (auction) => {
        if (!user) {
            setMessage('❌ Необходимо войти в систему')
            return
        }

        if (user.balance < auction.price) {
            setMessage('❌ Недостаточно средств')
            return
        }

        try {
            setBuyingAuction(auction.id)
            setMessage('')

            const token = sessionStorage.getItem('authToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auction/buy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ auctionId: auction.id })
            })

            const result = await response.json()

            if (response.ok && result.status === 'ok') {
                setMessage(`✅ ${result.message}`)
                loadAuctions() // Refresh auction list
                if (refreshUserData) {
                    refreshUserData() // Refresh user balance
                }
            } else {
                setMessage(`❌ ${result.error || 'Ошибка при покупке'}`)
            }
        } catch (error) {
            setMessage('❌ Ошибка сети при покупке')
            console.error('Error buying from auction:', error)
        } finally {
            setBuyingAuction(null)
        }
    }

    const handleCancelAuction = async (auction) => {
        try {
            setCancelingAuction(auction.id)
            setMessage('')

            const token = sessionStorage.getItem('authToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auction/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ auctionId: auction.id })
            })

            const result = await response.json()

            if (response.ok && result.status === 'ok') {
                setMessage(`✅ ${result.message}`)
                loadAuctions() // Refresh auction list
                loadMyAuctions() // Refresh my auctions
                if (refreshUserData) {
                    refreshUserData() // Refresh user data
                }
            } else {
                setMessage(`❌ ${result.error || 'Ошибка при отмене'}`)
            }
        } catch (error) {
            setMessage('❌ Ошибка сети при отмене')
            console.error('Error canceling auction:', error)
        } finally {
            setCancelingAuction(null)
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

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="page">
            <h1 className="page-title">Аукцион NFT</h1>

            {/* Tab Navigation */}
            <div className="card">
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className={`btn ${activeTab === 'all' ? '' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('all')}
                        style={{
                            flex: 1,
                            margin: 0,
                            background: activeTab === 'all' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                            color: activeTab === 'all' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
                        }}
                    >
                        <FaGavel style={{ marginRight: '8px' }} />
                        Все аукционы
                    </button>
                    {user && (
                        <button
                            className={`btn ${activeTab === 'my' ? '' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('my')}
                            style={{
                                flex: 1,
                                margin: 0,
                                background: activeTab === 'my' ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                                color: activeTab === 'my' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)'
                            }}
                        >
                            <FaUser style={{ marginRight: '8px' }} />
                            Мои аукционы ({myAuctions.length})
                        </button>
                    )}
                </div>
            </div>

            {message && (
                <div className="card" style={{
                    padding: '12px 16px',
                    marginBottom: '16px',
                    backgroundColor: message.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: message.includes('✅') ? '#27ae60' : '#e74c3c',
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            {isLoading && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка аукционов...</div>
                </div>
            )}

            {error && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '16px' }}>{error}</div>
                    <button className="btn" onClick={loadAuctions} style={{ marginTop: '0' }}>
                        Попробовать снова
                    </button>
                </div>
            )}

            {/* All Auctions Tab */}
            {activeTab === 'all' && !isLoading && !error && auctions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Активных аукционов нет</div>
                </div>
            )}

            {activeTab === 'all' && !isLoading && !error && auctions.length > 0 && (
                <div className="auction-grid">
                    {auctions.map(auction => (
                        <div key={auction.id} className="auction-card">
                            <div
                                className="auction-nft-image"
                                style={{ background: createGradient(auction.nft.gradientColor1, auction.nft.gradientColor2) }}
                            >
                                {auction.nft.imageURL ? (
                                    <img
                                        src={auction.nft.imageURL}
                                        alt={auction.nft.name}
                                        className="auction-nft-image-img"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                ) : (
                                    <div className="auction-nft-emoji">🎨</div>
                                )}
                            </div>

                            <div className="auction-info">
                                <h3 className="auction-nft-name">{auction.nft.name}</h3>
                                <p className="auction-nft-description">{auction.nft.description}</p>

                                <div className="auction-details">
                                    <div className="auction-seller">
                                        <FaUser style={{ marginRight: '4px' }} />
                                        {auction.seller.username || 'Пользователь'}
                                    </div>
                                    <div className="auction-date">
                                        <FaClock style={{ marginRight: '4px' }} />
                                        {formatDate(auction.createdAt)}
                                    </div>
                                </div>

                                <div className="auction-price">
                                    <span className="price-value">{auction.price} 🪙</span>
                                </div>

                                <button
                                    className="btn auction-buy-btn"
                                    onClick={() => handleBuyFromAuction(auction)}
                                    disabled={buyingAuction === auction.id ||
                                        (user && user.balance < auction.price) ||
                                        (user && auction.seller.id === user.id)}
                                    style={{
                                        opacity: buyingAuction === auction.id ||
                                            (user && user.balance < auction.price) ||
                                            (user && auction.seller.id === user.id) ? 0.6 : 1,
                                        cursor: buyingAuction === auction.id ||
                                            (user && user.balance < auction.price) ||
                                            (user && auction.seller.id === user.id) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {buyingAuction === auction.id ? 'Покупка...' :
                                        user && auction.seller.id === user.id ? 'Ваш NFT' :
                                            user && user.balance < auction.price ? 'Недостаточно средств' : 'Купить'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* My Auctions Tab */}
            {activeTab === 'my' && !isLoading && myAuctions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>У вас нет активных аукционов</div>
                </div>
            )}

            {activeTab === 'my' && myAuctions.length > 0 && (
                <div className="auction-grid">
                    {myAuctions.map(auction => (
                        <div key={auction.id} className="auction-card">
                            <div 
                                className="auction-nft-image"
                                style={{ background: createGradient(auction.nft.gradientColor1, auction.nft.gradientColor2) }}
                            >
                                {auction.nft.imageURL ? (
                                    <img 
                                        src={auction.nft.imageURL} 
                                        alt={auction.nft.name}
                                        className="auction-nft-image-img"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                ) : (
                                    <div className="auction-nft-emoji">🎨</div>
                                )}
                            </div>
                            
                            <div className="auction-info">
                                <h3 className="auction-nft-name">{auction.nft.name}</h3>
                                <p className="auction-nft-description">{auction.nft.description}</p>
                                
                                <div className="auction-details">
                                    <div className="auction-seller">
                                        <FaUser style={{ marginRight: '4px' }} />
                                        Ваш аукцион
                                    </div>
                                    <div className="auction-date">
                                        <FaClock style={{ marginRight: '4px' }} />
                                        {formatDate(auction.createdAt)}
                                    </div>
                                </div>
                                
                                <div className="auction-price">
                                    <span className="price-value">{auction.price} 🪙</span>
                                </div>
                                
                                <button 
                                    className="btn auction-cancel-btn"
                                    onClick={() => handleCancelAuction(auction)}
                                    disabled={cancelingAuction === auction.id}
                                    style={{
                                        opacity: cancelingAuction === auction.id ? 0.6 : 1,
                                        cursor: cancelingAuction === auction.id ? 'not-allowed' : 'pointer',
                                        background: '#e74c3c',
                                        color: 'white'
                                    }}
                                >
                                    {cancelingAuction === auction.id ? 'Отмена...' : (
                                        <>
                                            <FaTimes style={{ marginRight: '8px' }} />
                                            Отменить аукцион
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .auction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .auction-card {
          background: var(--tg-theme-secondary-bg-color);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .auction-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .auction-nft-image {
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .auction-nft-emoji {
          font-size: 60px;
        }

        .auction-nft-image-img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 12px;
        }
        
        .auction-info {
          padding: 20px;
        }
        
        .auction-nft-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--tg-theme-text-color);
          margin-bottom: 8px;
        }
        
        .auction-nft-description {
          font-size: 14px;
          color: var(--tg-theme-hint-color);
          margin-bottom: 16px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .auction-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--tg-theme-hint-color);
        }
        
        .auction-seller, .auction-date {
          display: flex;
          align-items: center;
        }
        
        .auction-price {
          margin-bottom: 16px;
          text-align: center;
        }
        
        .price-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--tg-theme-button-color);
          display: block;
        }
        
        .auction-buy-btn {
          margin-top: 0;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          width: 100%;
        }

        .auction-cancel-btn {
          margin-top: 0;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
        </div>
    )
}

export default Auction