# ZG Telegram WebApp Frontend

A simple Telegram WebApp built with React and Vite, following Telegram's native theme and design patterns.

## Features

- 🏠 **Home Page**: Activation codes and daily tasks
- 🎨 **NFT Shop**: Browse and purchase NFTs with simple colored backgrounds
- 🏆 **Leaderboard**: User rankings and weekly challenges
- 👤 **Profile**: User stats, achievements, and settings
- 📱 **Telegram Theme**: Uses Telegram's CSS variables for native look
- 🔗 **Backend Integration**: Authentication and avatar saving through existing auth system

## Pages

### Home
- Activation code input
- Daily tasks list with rewards
- User statistics (points, streak, tasks completed)

### NFT Shop
- Grid of NFTs with gradient backgrounds
- Rarity indicators (Rare, Epic, Legendary, Mythic)
- Price display in ETH and USD
- Buy functionality

### Leaderboard
- Top 10 users ranking
- Current user position
- Weekly challenge progress
- Achievement badges

### Profile
- User avatar (from Telegram)
- Level progression system
- Statistics grid
- Achievements showcase
- Settings toggles

## Backend Integration

The app integrates with the existing Spring Boot backend authentication system:
- User authentication via Telegram initData
- Automatic avatar saving during auth process
- User profile data retrieval

### API Endpoints Used
- `POST /api/auth/telegram` - Authenticate user and save avatar

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Telegram WebApp Setup

1. Add the Telegram WebApp script to your HTML
2. Configure your bot with BotFather
3. Set the WebApp URL in your bot settings
4. Update the backend URL in `App.jsx`

## Styling

- Uses Telegram CSS variables for native theme support
- Simple, clean design following Telegram guidelines
- Responsive layouts for mobile devices
- Minimal animations and transitions
- Component-specific styles with CSS-in-JS