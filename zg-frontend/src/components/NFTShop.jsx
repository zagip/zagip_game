import { useState, useEffect } from 'react'

const NFTShop = ({ user, refreshUserData }) => {
    const [nfts, setNfts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [buyingNFT, setBuyingNFT] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        loadNFTs()
    }, [])

    const loadNFTs = async () => {
        try {
            setIsLoading(true)
            const token = sessionStorage.getItem('authToken')
            const headers = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/nft/all`, {
                headers: headers
            })

            if (response.ok) {
                const data = await response.json()
                setNfts(data.nfts || [])
                setError(null)
            } else {
                setError('Не удалось загрузить NFT')
            }
        } catch (err) {
            setError('Ошибка сети при загрузке NFT')
            console.error('Error loading NFTs:', err)
        } finally {
            setIsLoading(false)
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

    const handleBuyNFT = async (nft) => {
        if (!user) {
            setMessage('❌ Необходимо войти в систему')
            return
        }

        if (user.balance < nft.price) {
            setMessage('❌ Недостаточно средств')
            return
        }

        try {
            setBuyingNFT(nft.id)
            setMessage('')

            const token = sessionStorage.getItem('authToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/nft/buy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nftId: nft.id })
            })

            const result = await response.json()

            if (response.ok && result.status === 'ok') {
                setMessage(`✅ ${nft.name} успешно куплен!`)
                loadNFTs() // Refresh NFT list
                if (refreshUserData) {
                    refreshUserData() // Refresh user balance
                }
            } else {
                setMessage(`❌ ${result.error || 'Ошибка при покупке'}`)
            }
        } catch (error) {
            setMessage('❌ Ошибка сети при покупке')
            console.error('Error buying NFT:', error)
        } finally {
            setBuyingNFT(null)
        }
    }

    return (
        <div className="page">
            <h1 className="page-title">NFT Магазин</h1>

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
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка NFT...</div>
                </div>
            )}

            {error && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '16px' }}>{error}</div>
                    <button className="btn" onClick={loadNFTs} style={{ marginTop: '0' }}>
                        Попробовать снова
                    </button>
                </div>
            )}

            {!isLoading && !error && nfts.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>NFT пока нет в магазине</div>
                </div>
            )}

            {!isLoading && !error && nfts.length > 0 && (
                <div className="nft-grid">
                    {nfts.map(nft => (
                        <div key={nft.id} className="nft-card">
                            <div
                                className="nft-image"
                                style={{ background: createGradient(nft.gradientColor1, nft.gradientColor2) }}
                            >
                                {nft.imageURL ? (
                                    <img
                                        src={nft.imageURL}
                                        alt={nft.name}
                                        className="nft-image-img"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                ) : (
                                    <div className="nft-emoji">🎨</div>
                                )}
                            </div>
                            <div className="nft-info">
                                <h3 className="nft-name">{nft.name}</h3>
                                <p className="nft-description">{nft.description}</p>
                                <div className="nft-price">
                                    <span className="price-value">{nft.price} 🪙</span>
                                </div>
                                <button
                                    className="btn nft-buy-btn"
                                    onClick={() => handleBuyNFT(nft)}
                                    disabled={buyingNFT === nft.id || (user && user.balance < nft.price)}
                                    style={{
                                        opacity: buyingNFT === nft.id || (user && user.balance < nft.price) ? 0.6 : 1,
                                        cursor: buyingNFT === nft.id || (user && user.balance < nft.price) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {buyingNFT === nft.id ? 'Покупка...' :
                                        user && user.balance < nft.price ? 'Недостаточно средств' : 'Купить'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
        }
        
        .nft-card {
          background: var(--tg-theme-secondary-bg-color);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .nft-card:active {
          transform: scale(0.98);
        }
        
        .nft-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .nft-image {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .nft-emoji {
          font-size: 50px;
        }

        .nft-image-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
        }

        .nft-description {
          font-size: 12px;
          color: var(--tg-theme-hint-color);
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .nft-rarity {
          position: absolute;
          top: 8px;
          right: 8px;
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .nft-info {
          padding: 16px;
          text-align: center;
        }
        
        .nft-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--tg-theme-text-color);
          margin-bottom: 8px;
        }
        
        .nft-price {
          margin-bottom: 12px;
        }
        
        .price-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--tg-theme-button-color);
          display: block;
        }
        
        .price-usd {
          font-size: 12px;
          color: var(--tg-theme-hint-color);
          font-weight: 400;
        }
        
        .nft-buy-btn {
          margin-top: 0;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
        }
      `}</style>
        </div>
    )
}

export default NFTShop