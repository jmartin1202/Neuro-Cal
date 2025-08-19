# NeuroCal - AI-Powered Smart Calendar Application

## 🚀 Project Overview

**NeuroCal** is an intelligent calendar application with AI-powered scheduling, natural language event creation, and smart time management features.

## 🌐 Live Deployment

**Heroku Production**: https://neurocal-fd0d46fc2aa7.herokuapp.com/

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express
- **Deployment**: Heroku
- **Version Control**: Git + GitHub

## 📁 Project Structure

```
NeuroCal/
├── Neuro-Cal/          # Main application directory
│   ├── src/           # React components & logic
│   │   ├── components/ # UI components
│   │   ├── pages/     # Route pages
│   │   ├── contexts/  # React contexts
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # Utility libraries
│   ├── backend/       # Node.js server & routes
│   ├── public/        # Static assets
│   ├── dist/          # Production build
│   ├── package.json   # Dependencies & scripts
│   ├── vite.config.ts # Vite configuration
│   └── tsconfig.json  # TypeScript configuration
└── README.md          # Project documentation
```

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/jmartin1202/Neuro-Cal.git
cd NeuroCal/Neuro-Cal

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Production Deployment

```bash
# Deploy to Heroku
git push heroku main

# Check deployment status
heroku ps --app neurocal
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run start` - Start production server (Heroku)
- `npm run type-check` - TypeScript type checking
- `npm run lint` - ESLint code analysis

## 🔧 Recent Updates

- ✅ **Calendar Bug Fixes**: Fixed event switching issue when clicking dates
- ✅ **Code Quality**: Removed all TypeScript `any` types and linting errors
- ✅ **Project Cleanup**: Removed duplicate files and simplified structure
- ✅ **Heroku Deployment**: Fully configured and running
- ✅ **Build System**: Optimized for production deployment

## 📊 Deployment Status

- **GitHub**: https://github.com/jmartin1202/Neuro-Cal
- **Heroku App**: neurocal (v14 deployed)
- **Status**: ✅ Live and running
- **Auto-deploy**: Enabled on main branch push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push
5. Create a pull request

## 📝 License

This project is private and proprietary.

---

**Last Updated**: August 19, 2025  
**Deployment**: Heroku Production  
**Status**: ✅ Live and Operational
