#!/bin/bash

# NeuroCal Auto-Deployment Script
# This script automatically deploys changes to both Heroku and GitHub

set -e  # Exit on any error

echo "🚀 Starting NeuroCal deployment process..."

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
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed or not in PATH"
    exit 1
fi

# Check if heroku CLI is available
if ! command -v heroku &> /dev/null; then
    print_warning "Heroku CLI not found. Please install it: https://devcenter.heroku.com/articles/heroku-cli"
    print_warning "You can still deploy manually or use GitHub Actions"
fi

# Step 1: Run tests
print_status "Running tests..."
if npm run test; then
    print_success "All tests passed!"
else
    print_error "Tests failed! Aborting deployment."
    exit 1
fi

# Step 2: Build the application
print_status "Building application..."
if npm run build; then
    print_success "Build completed successfully!"
else
    print_error "Build failed! Aborting deployment."
    exit 1
fi

# Step 3: Git operations
print_status "Preparing git commit..."

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    print_warning "No changes to commit"
else
    # Add all changes
    git add .
    
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Commit changes
    COMMIT_MESSAGE="Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S') - Build and deploy"
    git commit -m "$COMMIT_MESSAGE"
    print_success "Changes committed: $COMMIT_MESSAGE"
    
    # Push to GitHub
    print_status "Pushing to GitHub..."
    if git push origin $CURRENT_BRANCH; then
        print_success "Successfully pushed to GitHub!"
    else
        print_error "Failed to push to GitHub"
        exit 1
    fi
fi

# Step 4: Deploy to Heroku (if CLI is available)
if command -v heroku &> /dev/null; then
    print_status "Deploying to Heroku..."
    
    # Get Heroku app name from git remote or use default
    HEROKU_APP=$(git remote get-url heroku 2>/dev/null | sed 's/.*heroku\.com\///' | sed 's/\.git//') || echo "neurocal-app"
    
    if heroku builds:create --app $HEROKU_APP; then
        print_success "Heroku deployment initiated successfully!"
        
        # Wait for build to complete
        print_status "Waiting for Heroku build to complete..."
        sleep 10
        
        # Check build status
        BUILD_STATUS=$(heroku builds:info --app $HEROKU_APP --json | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$BUILD_STATUS" = "succeeded" ]; then
            print_success "Heroku deployment completed successfully!"
        else
            print_warning "Heroku build status: $BUILD_STATUS"
        fi
    else
        print_error "Heroku deployment failed!"
        exit 1
    fi
else
    print_warning "Heroku CLI not available. Deployment will happen via GitHub Actions."
fi

# Step 5: Final status
echo ""
print_success "🎉 Deployment process completed!"
print_status "Your changes are now live on:"
print_status "  - GitHub: https://github.com/$(git config --get remote.origin.url | sed 's/.*github\.com[:/]\([^/]*\/[^/]*\).*/\1/')"
if command -v heroku &> /dev/null; then
    print_status "  - Heroku: https://$HEROKU_APP.herokuapp.com"
fi
print_status "  - GitHub Actions: Check the Actions tab in your repository"

echo ""
print_status "Next time you make changes, just run: ./scripts/deploy.sh"
