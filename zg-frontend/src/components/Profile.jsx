import { useState, useEffect } from 'react'
import { FaChartBar, FaThumbtack, FaStar, FaExchangeAlt, FaGavel, FaTimes } from 'react-icons/fa'

const Profile = ({ user: initialUser, refreshUserData }) => {
    const [user, setUser] = useState(initialUser)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [ownedNFTs, setOwnedNFTs] = useState([])
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
    const [selectedNFT, setSelectedNFT] = useState(null)
    const [showActionModal, setShowActionModal] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState('')
    const [transferUsername, setTransferUsername] = useState('')
    const [auctionPrice, setAuctionPrice] = useState('')
    const [userStats, setUserStats] = useState({ tasksCompleted: 0, codesActivated: 0 })
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [referralData, setReferralData] = useState({ link: '', count: 0 })
    const [showReferralModal, setShowReferralModal] = useState(false)
    const [referralList, setReferralList] = useState([])
    const [isLoadingReferrals, setIsLoadingReferrals] = useState(false)


    const fetchUserData = async () => {
        const token = sessionStorage.getItem('authToken')
        if (!token) {
            setError('Токен авторизации не найден')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

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
                    telegramId: userData.telegramId,
                    role: userData.role,
                    pinnedNFT: userData.pinnedNFT
                })
            } else if (response.status === 401) {
                setError('Сессия истекла. Перезапустите приложение')
                sessionStorage.removeItem('authToken')
            } else {
                setError(`Ошибка загрузки данных: ${response.status}`)
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error)
            setError('Не удалось загрузить данные пользователя')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUserData()
        fetchOwnedNFTs()
        fetchUserStats()
        fetchReferralData()
    }, [])

    const fetchOwnedNFTs = async () => {
        const token = sessionStorage.getItem('authToken')
        if (!token) return

        try {
            setIsLoadingNFTs(true)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/nft/my`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const data = await response.json()
                setOwnedNFTs(data.nfts || [])
            }
        } catch (error) {
            console.error('Failed to fetch owned NFTs:', error)
        } finally {
            setIsLoadingNFTs(false)
        }
    }

    const fetchUserStats = async () => {
        const token = sessionStorage.getItem('authToken')
        if (!token) return

        try {
            setIsLoadingStats(true)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/user/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.status === 'ok') {
                    setUserStats({
                        tasksCompleted: data.tasksCompleted || 0,
                        codesActivated: data.codesActivated || 0
                    })
                }
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error)
        } finally {
            setIsLoadingStats(false)
        }
    }

    const fetchReferralData = async () => {
        const token = sessionStorage.getItem('authToken')
        if (!token) return

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/referral/link`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.status === 'ok') {
                    setReferralData({
                        link: data.referralLink,
                        count: data.referralCount || 0
                    })
                }
            }
        } catch (error) {
            console.error('Failed to fetch referral data:', error)
        }
    }

    const fetchReferralList = async () => {
        const token = sessionStorage.getItem('authToken')
        if (!token) return

        try {
            setIsLoadingReferrals(true)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/referral/list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.status === 'ok') {
                    setReferralList(data.referrals || [])
                }
            }
        } catch (error) {
            console.error('Failed to fetch referral list:', error)
        } finally {
            setIsLoadingReferrals(false)
        }
    }

    const handleRefresh = async () => {
        await fetchUserData()
        await fetchOwnedNFTs()
        await fetchUserStats()
        await fetchReferralData()
        // Also refresh global user data
        if (refreshUserData) {
            refreshUserData()
        }
    }

    const copyReferralLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(referralData.link)
            alert('Реферальная ссылка скопирована!')
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = referralData.link
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            alert('Реферальная ссылка скопирована!')
        }
    }

    const openReferralModal = () => {
        setShowReferralModal(true)
        fetchReferralList()
    }

    const handleNFTAction = async (action, nftId, extraData = {}) => {
        setActionLoading(true)
        setActionMessage('')

        try {
            const token = sessionStorage.getItem('authToken')
            let url = `${import.meta.env.VITE_API_URL}/nft/${action}`
            let body = { nftId }

            if (action === 'transfer') {
                body.receiverUsername = extraData.username
            } else if (action === 'auction/create') {
                url = `${import.meta.env.VITE_API_URL}/auction/create`
                body.price = parseInt(extraData.price)
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })

            const result = await response.json()

            if (response.ok && result.status === 'ok') {
                setActionMessage(`✅ ${result.message}`)
                await fetchOwnedNFTs()

                // Refresh user data to get updated pinnedNFT info
                if (refreshUserData) {
                    refreshUserData()
                }

                // Also refresh local user data for immediate UI update
                if (action === 'pin') {
                    await fetchUserData()
                }

                setTimeout(() => {
                    setShowActionModal(false)
                    setSelectedNFT(null)
                    setTransferUsername('')
                    setAuctionPrice('')
                }, 1500)
            } else {
                setActionMessage(`❌ ${result.error || 'Ошибка'}`)
            }
        } catch (error) {
            setActionMessage('❌ Ошибка сети')
            console.error('Error performing NFT action:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const openActionModal = (nft) => {
        setSelectedNFT(nft)
        setShowActionModal(true)
        setActionMessage('')
    }

    const closeActionModal = () => {
        setShowActionModal(false)
        setSelectedNFT(null)
        setTransferUsername('')
        setAuctionPrice('')
        setActionMessage('')
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

    if (error) {
        return (
            <div className="page">
                <h1 className="page-title">Profile</h1>
                <div className="card">
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <div style={{ color: 'var(--tg-theme-text-color)', marginBottom: '8px' }}>
                            Ошибка загрузки
                        </div>
                        <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', marginBottom: '20px' }}>
                            {error}
                        </div>
                        <button
                            className="btn"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    if (!user || isLoading) {
        return (
            <div className="page">
                <h1 className="page-title">Profile</h1>
                <div className="card">
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <div style={{ color: 'var(--tg-theme-hint-color)' }}>
                            {isLoading ? 'Обновление данных...' : 'Загрузка...'}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <h1 className="page-title">Профиль</h1>

            {/* User Info Card */}
            <div
                className="card profile-header"
                style={{
                    background: user.pinnedNFT ?
                        createGradient(user.pinnedNFT.gradientColor1, user.pinnedNFT.gradientColor2) :
                        'var(--tg-theme-secondary-bg-color)',
                    color: user.pinnedNFT ? 'white' : 'inherit',
                    position: 'relative'
                }}
            >
                {/* {user.pinnedNFT && (
                    <div className="pinned-nft-icon">
                        <FaThumbtack />
                    </div>
                )} */}
                <div className="profile-avatar">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder" style={{
                            background: user.pinnedNFT ? 'rgba(255,255,255,0.2)' : 'var(--tg-theme-button-color)',
                            color: user.pinnedNFT ? 'white' : 'var(--tg-theme-button-text-color)'
                        }}>👤</div>
                    )}
                </div>
                <div className="profile-name" style={{ color: user.pinnedNFT ? 'white' : 'var(--tg-theme-text-color)' }}>
                    {user.username ? `${user.username}` : 'Пользователь Telegram'}
                </div>
                <div className="profile-balance" style={{ color: user.pinnedNFT ? 'rgba(255,255,255,0.9)' : 'var(--tg-theme-button-color)' }}>
                    {user.balance?.toLocaleString() || '0'} монет
                </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', color: 'var(--tg-theme-text-color)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaChartBar /> Статистика
                </h3>
                <div className="stats-simple">
                    <div className="stat-item">
                        <span>Заданий выполнено</span>
                        <span>{isLoadingStats ? '...' : userStats.tasksCompleted}</span>
                    </div>
                    <div className="stat-item">
                        <span>Кодов активировано</span>
                        <span>{isLoadingStats ? '...' : userStats.codesActivated}</span>
                    </div>
                    <div className="stat-item">
                        <span>NFTs</span>
                        <span>{ownedNFTs.length}</span>
                    </div>
                </div>
            </div>

            {/* Referral System */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', color: 'var(--tg-theme-text-color)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👥 Реферальная система
                </h3>
                <div className="referral-info">
                    <div className="referral-stats">
                        <div className="referral-stat">
                            <span>Приглашено друзей</span>
                            <span>{referralData.count}</span>
                        </div>
                        <div className="referral-stat">
                            <span>Заработано монет</span>
                            <span>{referralData.count * 300}</span>
                        </div>
                    </div>
                    <div className="referral-actions">
                        <button className="referral-btn copy-btn" onClick={copyReferralLink}>
                            📋 Скопировать ссылку
                        </button>
                        <button className="referral-btn list-btn" onClick={openReferralModal}>
                            👥 Мои рефералы ({referralData.count})
                        </button>
                    </div>
                    <div className="referral-bonus">
                        <span>💰 За каждого друга: +300 монет</span>
                    </div>
                </div>
            </div>

            {/* Owned NFTs */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', color: 'var(--tg-theme-text-color)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎨 Мои NFT ({ownedNFTs.length})
                </h3>

                {isLoadingNFTs && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                        <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>Загрузка NFT...</div>
                    </div>
                )}

                {!isLoadingNFTs && ownedNFTs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
                        <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>У вас пока нет NFT</div>
                    </div>
                )}

                {!isLoadingNFTs && ownedNFTs.length > 0 && (
                    <div className="owned-nft-grid">
                        {ownedNFTs
                            .sort((a, b) => {
                                // Sort pinned NFTs first
                                const aIsPinned = user.pinnedNFT && user.pinnedNFT.id === a.id
                                const bIsPinned = user.pinnedNFT && user.pinnedNFT.id === b.id
                                if (aIsPinned && !bIsPinned) return -1
                                if (!aIsPinned && bIsPinned) return 1
                                return 0
                            })
                            .map(nft => {
                                const isPinned = user.pinnedNFT && user.pinnedNFT.id === nft.id
                                return (
                                    <div key={nft.id} className={`owned-nft-card ${isPinned ? 'pinned' : ''}`} onClick={() => openActionModal(nft)}>
                                        <div
                                            className="owned-nft-image"
                                            style={{ background: createGradient(nft.gradientColor1, nft.gradientColor2) }}
                                        >
                                            {isPinned && (
                                                <div className="nft-pin-icon">
                                                    <FaThumbtack />
                                                </div>
                                            )}
                                            {nft.imageURL ? (
                                                <img
                                                    src={nft.imageURL}
                                                    alt={nft.name}
                                                    className="owned-nft-image-img"
                                                    onError={(e) => { e.target.style.display = 'none' }}
                                                />
                                            ) : (
                                                <div className="owned-nft-emoji">🎨</div>
                                            )}
                                        </div>
                                        <div className="owned-nft-info">
                                            <h4 className="owned-nft-name">{nft.name}</h4>
                                            <p className="owned-nft-description">{nft.description}</p>
                                            <div className="owned-nft-price">{nft.price} 🪙</div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                )}

                {/* NFT Action Modal */}
                {showActionModal && selectedNFT && (
                    <div className="modal-overlay" onClick={closeActionModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{selectedNFT.name}</h3>
                                <button className="modal-close" onClick={closeActionModal}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="nft-preview">
                                    <div
                                        className="nft-preview-image"
                                        style={{ background: createGradient(selectedNFT.gradientColor1, selectedNFT.gradientColor2) }}
                                    >
                                        {selectedNFT.imageURL ? (
                                            <img
                                                src={selectedNFT.imageURL}
                                                alt={selectedNFT.name}
                                                className="nft-preview-img"
                                                onError={(e) => { e.target.style.display = 'none' }}
                                            />
                                        ) : (
                                            <div className="nft-preview-emoji">🎨</div>
                                        )}
                                    </div>
                                    <div className="nft-preview-info">
                                        <div className="nft-preview-price">Цена: {selectedNFT.price} 🪙</div>
                                        <div className="nft-preview-sell">Продать за: {Math.floor(selectedNFT.price * 0.75)} 🪙</div>
                                    </div>
                                </div>

                                {actionMessage && (
                                    <div className="action-message" style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        backgroundColor: actionMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                                        color: actionMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                                        fontSize: '14px',
                                        textAlign: 'center'
                                    }}>
                                        {actionMessage}
                                    </div>
                                )}

                                <div className="action-buttons">
                                    <button
                                        className="action-btn pin-btn"
                                        onClick={() => handleNFTAction('pin', selectedNFT.id)}
                                        disabled={actionLoading}
                                    >
                                        <FaThumbtack /> Закрепить
                                    </button>

                                    <button
                                        className="action-btn sell-btn"
                                        onClick={() => handleNFTAction('sell', selectedNFT.id)}
                                        disabled={actionLoading}
                                    >
                                        <FaStar /> Продать
                                    </button>
                                </div>

                                <div className="transfer-section">
                                    <h4>Передать NFT (100 🪙)</h4>
                                    <div className="transfer-form">
                                        <input
                                            type="text"
                                            placeholder="Имя пользователя"
                                            value={transferUsername}
                                            onChange={(e) => setTransferUsername(e.target.value)}
                                            className="transfer-input"
                                        />
                                        <button
                                            className="action-btn transfer-btn"
                                            onClick={() => handleNFTAction('transfer', selectedNFT.id, { username: transferUsername })}
                                            disabled={actionLoading || !transferUsername.trim()}
                                        >
                                            <FaExchangeAlt /> Передать
                                        </button>
                                    </div>
                                </div>

                                <div className="auction-section">
                                    <h4>Выставить на аукцион</h4>
                                    <div className="auction-form">
                                        <input
                                            type="number"
                                            placeholder="Цена в монетах"
                                            value={auctionPrice}
                                            onChange={(e) => setAuctionPrice(e.target.value)}
                                            className="auction-input"
                                            min="1"
                                        />
                                        <button
                                            className="action-btn auction-btn"
                                            onClick={() => handleNFTAction('auction/create', selectedNFT.id, { price: auctionPrice })}
                                            disabled={actionLoading || !auctionPrice || parseInt(auctionPrice) <= 0}
                                        >
                                            <FaGavel /> Создать аукцион
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Referral Modal */}
                {showReferralModal && (
                    <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Мои рефералы ({referralData.count})</h3>
                                <button className="modal-close" onClick={() => setShowReferralModal(false)}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body">
                                {isLoadingReferrals && (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                                        <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>Загрузка...</div>
                                    </div>
                                )}

                                {!isLoadingReferrals && referralList.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
                                        <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
                                            Пока никого не пригласили
                                        </div>
                                        <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '12px', marginTop: '8px' }}>
                                            Поделитесь ссылкой с друзьями!
                                        </div>
                                    </div>
                                )}

                                {!isLoadingReferrals && referralList.length > 0 && (
                                    <div className="referral-list">
                                        {referralList.map((referral, index) => (
                                            <div key={index} className="referral-item">
                                                <div className="referral-avatar">
                                                    {referral.avatarUrl ? (
                                                        <img src={referral.avatarUrl} alt="Avatar" className="referral-avatar-img" />
                                                    ) : (
                                                        <div className="referral-avatar-placeholder">👤</div>
                                                    )}
                                                </div>
                                                <div className="referral-info-item">
                                                    <div className="referral-name">{referral.username}</div>
                                                    <div className="referral-balance">{referral.balance?.toLocaleString() || '0'} монет</div>
                                                </div>
                                                <div className="referral-bonus">+300 🪙</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="referral-link-section">
                                    <h4>Ваша реферальная ссылка:</h4>
                                    <div className="referral-link-container">
                                        <input 
                                            type="text" 
                                            value={referralData.link} 
                                            readOnly 
                                            className="referral-link-input"
                                        />
                                        <button className="copy-link-btn" onClick={copyReferralLink}>
                                            📋
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .profile-header {
          text-align: center;
        }
        
        .profile-avatar {
          margin-bottom: 16px;
        }
        
        .avatar-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          margin: 0 auto;
        }
        
        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--tg-theme-button-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: var(--tg-theme-button-text-color);
          margin: 0 auto;
        }
        
        .profile-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--tg-theme-text-color);
          margin-bottom: 8px;
        }
        
        .profile-balance {
          font-size: 16px;
          color: var(--tg-theme-button-color);
          font-weight: 500;
        }
        

        

        
        .stats-simple {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: var(--tg-theme-bg-color);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }
        
        .stat-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        

        
        .stat-item span:first-child {
          color: var(--tg-theme-text-color);
          font-size: 14px;
        }
        
        .stat-item span:last-child {
          color: var(--tg-theme-button-color);
          font-weight: 600;
          font-size: 14px;
        }

        .owned-nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
        
        .owned-nft-card {
          background: var(--tg-theme-bg-color);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .owned-nft-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .owned-nft-card.pinned {
          border: 2px solid var(--tg-theme-button-color);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }
        
        .owned-nft-image {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .nft-pin-icon {
          position: absolute;
          top: 6px;
          right: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .owned-nft-emoji {
          font-size: 32px;
        }

        .owned-nft-image-img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .owned-nft-info {
          padding: 12px;
          text-align: center;
        }
        
        .owned-nft-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--tg-theme-text-color);
          margin: 0 0 4px 0;
        }
        
        .owned-nft-description {
          font-size: 10px;
          color: var(--tg-theme-hint-color);
          margin: 0 0 6px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }
        
        .owned-nft-price {
          font-size: 11px;
          font-weight: 600;
          color: var(--tg-theme-button-color);
        }

        .pinned-nft-icon {
          position: absolute;
          top: 12px;
          right: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
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
          padding: 20px;
        }

        .nft-preview {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          align-items: center;
        }

        .nft-preview-image {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nft-preview-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }

        .nft-preview-emoji {
          font-size: 40px;
        }

        .nft-preview-info {
          flex: 1;
        }

        .nft-preview-price {
          font-size: 14px;
          color: var(--tg-theme-text-color);
          margin-bottom: 4px;
        }

        .nft-preview-sell {
          font-size: 12px;
          color: var(--tg-theme-hint-color);
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .action-btn {
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .pin-btn {
          background: var(--tg-theme-button-color);
          color: var(--tg-theme-button-text-color);
        }

        .sell-btn {
          background: #e74c3c;
          color: white;
        }

        .transfer-btn {
          background: #3498db;
          color: white;
        }

        .auction-btn {
          background: #f39c12;
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .transfer-section, .auction-section {
          margin-bottom: 20px;
        }

        .transfer-section h4, .auction-section h4 {
          color: var(--tg-theme-text-color);
          font-size: 16px;
          margin: 0 0 12px 0;
        }

        .transfer-form, .auction-form {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .transfer-input, .auction-input {
          flex: 1;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: var(--tg-theme-bg-color);
          color: var(--tg-theme-text-color);
          font-size: 14px;
        }

        .transfer-input::placeholder, .auction-input::placeholder {
          color: var(--tg-theme-hint-color);
        }

        .referral-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .referral-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .referral-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--tg-theme-bg-color);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .referral-stat span:first-child {
          color: var(--tg-theme-text-color);
          font-size: 14px;
        }

        .referral-stat span:last-child {
          color: var(--tg-theme-button-color);
          font-weight: 600;
          font-size: 14px;
        }

        .referral-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .referral-btn {
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-btn {
          background: var(--tg-theme-button-color);
          color: var(--tg-theme-button-text-color);
        }

        .list-btn {
          background: #3498db;
          color: white;
        }

        .referral-btn:hover {
          transform: translateY(-1px);
        }

        .referral-bonus {
          text-align: center;
          padding: 8px;
          background: rgba(39, 174, 96, 0.1);
          border-radius: 8px;
          color: #27ae60;
          font-size: 14px;
          font-weight: 500;
        }

        .referral-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .referral-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--tg-theme-bg-color);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .referral-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .referral-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .referral-avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--tg-theme-button-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--tg-theme-button-text-color);
        }

        .referral-info-item {
          flex: 1;
        }

        .referral-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--tg-theme-text-color);
          margin-bottom: 2px;
        }

        .referral-balance {
          font-size: 12px;
          color: var(--tg-theme-hint-color);
        }

        .referral-bonus {
          font-size: 12px;
          font-weight: 600;
          color: #27ae60;
          background: rgba(39, 174, 96, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .referral-link-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
        }

        .referral-link-section h4 {
          color: var(--tg-theme-text-color);
          font-size: 14px;
          margin: 0 0 8px 0;
        }

        .referral-link-container {
          display: flex;
          gap: 8px;
        }

        .referral-link-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          background: var(--tg-theme-bg-color);
          color: var(--tg-theme-text-color);
          font-size: 12px;
        }

        .copy-link-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: var(--tg-theme-button-color);
          color: var(--tg-theme-button-text-color);
          cursor: pointer;
          font-size: 14px;
        }

      `}</style>
        </div>
    )
}

export default Profile