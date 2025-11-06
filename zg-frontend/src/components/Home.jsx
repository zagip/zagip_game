import { useState } from 'react'
import { FaKey, FaCheck } from 'react-icons/fa'
import Tasks from './Tasks'

const Home = ({ user, refreshUserData }) => {
  const [codeInput, setCodeInput] = useState('')
  const [codeMessage, setCodeMessage] = useState('')
  const [isRedeemingCode, setIsRedeemingCode] = useState(false)

  const handleRedeemCode = async () => {
    if (!codeInput.trim()) {
      setCodeMessage('❌ Введите код')
      return
    }

    setIsRedeemingCode(true)
    setCodeMessage('')

    try {
      const token = sessionStorage.getItem('authToken')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/code/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeInput })
      })

      const result = await response.json()

      if (response.ok && result.status === 'ok') {
        setCodeMessage(`✅ ${result.message}`)
        setCodeInput('')
        if (refreshUserData) {
          refreshUserData()
        }
      } else {
        setCodeMessage(`❌ ${result.error || 'Ошибка'}`)
      }
    } catch (error) {
      setCodeMessage('❌ Ошибка сети')
      console.error('Error redeeming code:', error)
    } finally {
      setIsRedeemingCode(false)
    }
  }



  return (
    <div className="page">
      <h1 className="page-title">Zagip Game</h1>

      {/* Code Redemption */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', color: 'var(--tg-theme-text-color)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaKey /> Активация кода
        </h3>

        <div className="code-redemption">
          <input
            type="text"
            placeholder="Введите код"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="input"
            style={{ textAlign: 'left', flex: 1, marginRight: '12px', marginBottom: '0' }}
          />
          <button
            onClick={handleRedeemCode}
            disabled={isRedeemingCode || !codeInput.trim()}
            className="btn code-btn"
            style={{
              margin: 0,
              padding: '12px',
              maxWidth: '48px',
              opacity: isRedeemingCode || !codeInput.trim() ? 0.6 : 1,
              cursor: isRedeemingCode || !codeInput.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isRedeemingCode ? '⏳' : <FaCheck />}
          </button>
        </div>

        {codeMessage && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginTop: '12px',
            backgroundColor: codeMessage.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
            color: codeMessage.includes('✅') ? '#27ae60' : '#e74c3c',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {codeMessage}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="card">
        <Tasks user={user} refreshUserData={refreshUserData} />
      </div>

      <style jsx>{`
        .code-redemption {
          display: flex;
          gap: 12px;
          align-items: center;
        }
      `}</style>




    </div>
  )
}

export default Home