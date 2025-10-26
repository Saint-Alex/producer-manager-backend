#!/bin/bash

# Deploy script for Heroku
# Make sure you have Heroku CLI installed and are logged in

set -e  # Exit on any error

echo "🚀 Starting Heroku deployment..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if heroku remote exists
if ! git remote | grep -q heroku; then
    echo "❌ Error: Heroku remote not found"
    echo "Please add heroku remote first:"
    echo "  heroku git:remote -a your-app-name"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📝 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Build locally (optional check)
echo "🔨 Running local build check..."
npm run build

# Deploy to Heroku
echo "🚀 Pushing to Heroku..."
git push heroku $CURRENT_BRANCH:main

# Check application status
echo "📊 Checking application status..."
heroku ps

# Show application URL
APP_URL=$(heroku info -s | grep web_url | cut -d= -f2)
echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: $APP_URL"
echo "📚 API Documentation: ${APP_URL}api/docs"
echo "🔍 Health Check: ${APP_URL}api/health"

# Show recent logs
echo "📋 Recent logs:"
heroku logs --tail --num 20
