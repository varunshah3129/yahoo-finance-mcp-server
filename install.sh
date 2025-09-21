#!/bin/bash

# Yahoo Finance MCP Server Installation Script

echo "🚀 Installing Yahoo Finance MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.0.0 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18.0.0 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the project"
    exit 1
fi

echo "✅ Build completed successfully"

# Make test script executable
chmod +x test-server.js

# Run tests
echo "🧪 Running tests..."
node test-server.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Add this server to your LibreChat configuration:"
    echo "   Copy the content from librechat-config.json"
    echo "2. Update the 'cwd' path in the config to: $(pwd)"
    echo "3. Restart LibreChat"
    echo "4. Start using Yahoo Finance tools in your chats!"
    echo ""
    echo "🔧 To run the server manually:"
    echo "   npm start"
    echo ""
    echo "🔧 To run in development mode:"
    echo "   npm run dev"
else
    echo "⚠️  Installation completed but tests failed."
    echo "   The server may still work, but please check the error messages above."
fi



