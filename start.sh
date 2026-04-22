#!/bin/bash

# Configuration
LOG_DIR="logs"
PORT=3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_menu() {
    clear
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}      MEDICARE AI - HEALTHCARE PLATFORM MANAGER    ${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo ""
    echo -e " [1] First Time Setup (Dependencies + Environment)"
    echo -e " [2] Start Application (Dev Mode)"
    echo -e " [3] Check MongoDB Service Status"
    echo -e " [4] Run Production Build"
    echo -e " [5] Clean Project (Clear .next + node_modules)"
    echo -e " [6] Exit"
    echo ""
    echo -e "${BLUE}===================================================${NC}"
}

setup() {
    clear
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}          INITIAL PROJECT SETUP                    ${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo ""

    # Create log directory
    if [ ! -d "$LOG_DIR" ]; then
        echo "Creating logs directory..."
        mkdir -p "$LOG_DIR"
    fi

    # Validate Node.js
    echo "Checking Node.js version..."
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[ERROR] Node.js is not installed. Please install Node.js 18+.${NC}"
        read -n 1 -s -r -p "Press any key to continue..."
        return
    fi

    # Environment Setup
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            echo "Creating .env.local from .env.example..."
            cp .env.example .env.local
            
            # Generate a secure 64-character JWT_SECRET automatically
            echo "Generating secure JWT_SECRET..."
            NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
            
            # Use sed to replace the placeholder
            # Check if it's macOS or Linux sed
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/your_secure_jwt_secret_must_be_64_chars_long_generate_one_now/$NEW_SECRET/" .env.local
            else
                sed -i "s/your_secure_jwt_secret_must_be_64_chars_long_generate_one_now/$NEW_SECRET/" .env.local
            fi
            
            echo -e "${GREEN}[OK] .env.local created with a secure JWT_SECRET.${NC}"
            echo -e "${YELLOW}[NOTICE] Please update .env.local with your other API keys.${NC}"
        else
            echo -e "${RED}[ERROR] .env.example not found. Environment setup failed.${NC}"
        fi
    fi

    # Install Dependencies
    echo ""
    echo "Step 1: Installing Dependencies..."
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}[WARNING] npm install failed with legacy-peer-deps. Trying with --force...${NC}"
        npm install --force
    fi

    echo ""
    echo -e "${GREEN}Setup Complete!${NC}"
    read -n 1 -s -r -p "Press any key to continue..."
}

start_app() {
    clear
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}          STARTING APPLICATION                     ${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo ""

    # Validate dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${RED}[ERROR] node_modules not found. Please run Setup [1] first.${NC}"
        read -n 1 -s -r -p "Press any key to continue..."
        return
    fi

    # Check MongoDB
    echo "Checking MongoDB service status..."
    if command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet mongod; then
            echo -e "${GREEN}[OK] MongoDB service is running.${NC}"
        else
            echo -e "${YELLOW}[WARNING] MongoDB service (mongod) is not running. Attempting to start...${NC}"
            sudo systemctl start mongod 2>/dev/null
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}[OK] MongoDB service started.${NC}"
            else
                echo -e "${RED}[ERROR] Failed to start MongoDB. Please start it manually.${NC}"
            fi
        fi
    elif command -v brew &> /dev/null; then
        if brew services list | grep mongodb-community | grep started &> /dev/null; then
            echo -e "${GREEN}[OK] MongoDB service is running via Homebrew.${NC}"
        else
            echo -e "${YELLOW}[WARNING] MongoDB service is not running. Attempting to start via Homebrew...${NC}"
            brew services start mongodb-community
        fi
    else
        echo -e "${YELLOW}[NOTICE] Could not detect systemctl or brew. Please ensure MongoDB is running.${NC}"
    fi

    echo ""
    echo -e "Starting Next.js Server on port $PORT..."
    echo -e "Open ${BLUE}http://localhost:$PORT${NC} in your browser."
    echo -e "Press ${RED}Ctrl+C${NC} to stop."
    echo ""
    npm run dev -- -p $PORT
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Application failed to start. Check logs/next-development.log${NC}"
    fi
    read -n 1 -s -r -p "Press any key to continue..."
}

check_mongo() {
    clear
    echo "Checking MongoDB status..."
    if command -v mongosh &> /dev/null; then
        mongosh --eval "db.adminCommand('ping')" --quiet
    elif command -v mongo &> /dev/null; then
        mongo --eval "db.adminCommand('ping')" --quiet
    else
        echo -e "${RED}[ERROR] MongoDB client (mongosh/mongo) not found.${NC}"
    fi
    read -n 1 -s -r -p "Press any key to continue..."
}

build_app() {
    clear
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}          PRODUCTION BUILD                         ${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo ""
    echo "Running production build..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS] Build completed successfully.${NC}"
    else
        echo -e "${RED}[ERROR] Build failed.${NC}"
    fi
    read -n 1 -s -r -p "Press any key to continue..."
}

clean_project() {
    clear
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}          CLEAN PROJECT                            ${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo ""
    echo "This will delete .next and node_modules."
    read -p "Are you sure? (y/n): " confirm
    if [[ $confirm != "y" ]]; then
        return
    fi

    echo "Cleaning .next..."
    rm -rf .next
    echo "Cleaning node_modules..."
    rm -rf node_modules
    echo ""
    echo -e "${GREEN}[OK] Project cleaned.${NC}"
    read -n 1 -s -r -p "Press any key to continue..."
}

while true; do
    show_menu
    read -p "Select an option (1-6): " choice
    case $choice in
        1) setup ;;
        2) start_app ;;
        3) check_mongo ;;
        4) build_app ;;
        5) clean_project ;;
        6) exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" && sleep 1 ;;
    esac
done
