import { FaHome, FaShoppingBag, FaTrophy, FaUser, FaGavel } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const BottomNav = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate()
  
  const navItems = [
    { id: 'home', icon: FaHome, path: '/' },
    { id: 'nft', icon: FaShoppingBag, path: '/nft' },
    { id: 'auction', icon: FaGavel, path: '/auction' },
    { id: 'leaderboard', icon: FaTrophy, path: '/leaderboard' },
    { id: 'profile', icon: FaUser, path: '/profile' }
  ]

  const handleNavClick = (item) => {
    setActiveTab(item.id)
    navigate(item.path)
  }

  return (
    <div className="bottom-nav">
      <div className="nav-container">
        {navItems.map(item => (
          <motion.div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="nav-icon"
              animate={{
                scale: activeTab === item.id ? 1.1 : 1
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <item.icon />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default BottomNav