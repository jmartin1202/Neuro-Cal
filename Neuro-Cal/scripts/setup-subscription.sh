#!/bin/bash

# NeuroCal Subscription System Setup Script
# This script helps you set up the subscription system quickly

set -e

echo "🚀 NeuroCal Subscription System Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the NeuroCal project root directory"
    exit 1
fi

print_status "Starting subscription system setup..."

# Step 1: Install backend dependencies
print_status "Installing backend dependencies..."
cd backend

if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found"
    exit 1
fi

npm install

# Step 2: Check if .env exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from template..."
    if [ -f "env.subscription.example" ]; then
        cp env.subscription.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your actual credentials"
    else
        print_error "env.subscription.example not found"
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# Step 3: Check database connection
print_status "Testing database connection..."
if command -v psql &> /dev/null; then
    # Try to connect to database
    if psql -h localhost -U postgres -d neurocal -c "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful"
    else
        print_warning "Could not connect to database. Please ensure PostgreSQL is running and configured."
    fi
else
    print_warning "PostgreSQL client not found. Please install psql to test database connection."
fi

# Step 4: Run database migration
print_status "Running database migration..."
if [ -f "scripts/subscription-migration.sql" ]; then
    if command -v psql &> /dev/null; then
        if psql -h localhost -U postgres -d neurocal -f scripts/subscription-migration.sql; then
            print_success "Database migration completed"
        else
            print_warning "Database migration failed. Please check your database connection and run manually:"
            echo "psql -h localhost -U postgres -d neurocal -f scripts/subscription-migration.sql"
        fi
    else
        print_warning "PostgreSQL client not found. Please run migration manually:"
        echo "psql -h localhost -U postgres -d neurocal -f scripts/subscription-migration.sql"
    fi
else
    print_error "Migration script not found at scripts/subscription-migration.sql"
    exit 1
fi

# Step 5: Check Stripe configuration
print_status "Checking Stripe configuration..."
if [ -f ".env" ]; then
    if grep -q "STRIPE_SECRET_KEY=sk_" .env; then
        print_success "Stripe secret key found in .env"
    else
        print_warning "Stripe secret key not configured. Please add your Stripe keys to .env"
    fi
    
    if grep -q "STRIPE_WEBHOOK_SECRET=whsec_" .env; then
        print_success "Stripe webhook secret found in .env"
    else
        print_warning "Stripe webhook secret not configured. Please add your webhook secret to .env"
    fi
fi

# Step 6: Frontend setup
print_status "Setting up frontend components..."
cd ..

if [ -d "src/components" ]; then
    print_success "Frontend components directory found"
else
    print_warning "Frontend components directory not found. Please ensure you're in the correct project structure."
fi

# Step 7: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/data

# Step 8: Set up cron jobs (if on Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Setting up cron jobs..."
    
    # Check if cron is available
    if command -v crontab &> /dev/null; then
        print_success "Cron is available on this system"
        print_warning "Cron jobs will be managed by the application automatically"
    else
        print_warning "Cron not available. Background tasks will need to be managed manually."
    fi
else
    print_warning "Cron setup skipped (Windows detected)"
fi

# Step 9: Final checks
print_status "Performing final checks..."

# Check if all required files exist
required_files=(
    "backend/services/subscriptionService.js"
    "backend/services/stripeWebhookHandler.js"
    "backend/services/cronJobs.js"
    "backend/routes/billing.js"
    "backend/middleware/auth.js"
    "src/components/SubscriptionManagement.tsx"
    "src/components/FeatureGate.tsx"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    print_success "All required files are present"
else
    print_warning "Some required files are missing:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi

# Summary
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your actual credentials"
echo "2. Set up your Stripe account and get API keys"
echo "3. Configure Stripe webhooks to point to:"
echo "   https://yourdomain.com/webhooks/stripe"
echo "4. Start the backend server:"
echo "   cd backend && npm run dev"
echo "5. Test the subscription system"
echo ""
echo "For detailed setup instructions, see:"
echo "SUBSCRIPTION_SYSTEM.md"
echo ""
echo "For troubleshooting, check the logs in:"
echo "backend/logs/"
echo ""

# Check if we can start the server
if [ -f "backend/package.json" ]; then
    echo "Would you like to start the backend server now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Starting backend server..."
        cd backend
        npm run dev
    fi
fi

print_success "Setup script completed successfully!"
