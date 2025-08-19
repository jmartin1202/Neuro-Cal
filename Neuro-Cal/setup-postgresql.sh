#!/bin/bash

# NeuroCal PostgreSQL Setup Script for macOS
# This script helps set up PostgreSQL for the NeuroCal application

set -e

echo "🚀 NeuroCal PostgreSQL Setup Script"
echo "=================================="

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew is installed"

# Check if PostgreSQL is already installed
if brew list postgresql@15 &> /dev/null; then
    echo "✅ PostgreSQL 15 is already installed"
else
    echo "📦 Installing PostgreSQL 15..."
    brew install postgresql@15
    echo "✅ PostgreSQL 15 installed successfully"
fi

# Add PostgreSQL to PATH if not already there
if ! echo $PATH | grep -q "postgresql@15"; then
    echo "🔧 Adding PostgreSQL to PATH..."
    echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
    echo "✅ PostgreSQL added to PATH"
fi

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
brew services start postgresql@15

# Wait for PostgreSQL to start
echo "⏳ Waiting for PostgreSQL to start..."
sleep 5

# Check if PostgreSQL is running
if brew services list | grep postgresql@15 | grep started &> /dev/null; then
    echo "✅ PostgreSQL service is running"
else
    echo "❌ Failed to start PostgreSQL service"
    exit 1
fi

# Create database if it doesn't exist
echo "🗄️  Creating database..."
psql postgres -c "CREATE DATABASE neurocal;" 2>/dev/null || echo "Database 'neurocal' already exists"

# Create user if it doesn't exist
echo "👤 Creating database user..."
psql postgres -c "CREATE USER neurocal_user WITH PASSWORD 'neurocal_dev_password';" 2>/dev/null || echo "User 'neurocal_user' already exists"

# Grant privileges
echo "🔐 Granting privileges..."
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE neurocal TO neurocal_user;" 2>/dev/null || echo "Privileges already granted"

# Connect to neurocal database and grant schema privileges
echo "🔑 Granting schema privileges..."
psql -U postgres -d neurocal -c "GRANT ALL ON SCHEMA public TO neurocal_user;" 2>/dev/null || echo "Schema privileges already granted"

echo ""
echo "🎉 PostgreSQL setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy environment file: cp env.example .env"
echo "2. Update .env with database credentials:"
echo "   DB_USER=neurocal_user"
echo "   DB_PASSWORD=neurocal_dev_password"
echo "   DB_NAME=neurocal"
echo "3. Test connection: cd backend && npm run db:test"
echo "4. Initialize database: npm run db:init"
echo "5. Start the application: npm run dev"
echo ""
echo "🔍 To verify PostgreSQL is running:"
echo "   brew services list | grep postgresql"
echo ""
echo "📊 To connect to database:"
echo "   psql -U neurocal_user -d neurocal"
echo ""
echo "🛑 To stop PostgreSQL:"
echo "   brew services stop postgresql@15"
