#!/bin/bash

echo "🚀 Setting up Yahoo Finance Chatbot Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
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

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
REACT_APP_MCP_SERVER_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
EOF
    echo "✅ .env file created"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your Yahoo Finance MCP server is running"
echo "2. Start the React app: npm start"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Start chatting with the financial data!"
echo ""
echo "🔧 Available commands:"
echo "  npm start    - Start development server"
echo "  npm build    - Build for production"
echo "  npm test     - Run tests"
echo ""
echo "💡 Example chat messages:"
echo "  - 'What's the current price of Apple stock?'"
echo "  - 'Compare AAPL, MSFT, and GOOGL'"
echo "  - 'Show me market overview'"
echo "  - 'Analyze my portfolio: AAPL, MSFT, GOOGL'"




