#!/bin/bash
cd "$(dirname "$0")"

echo "Starting Geo CRM Development Servers..."
echo "======================================"

# Start backend
cd backend
npx tsx watch src/index.ts &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend
cd ../frontend
npx vite --port 5173 --host &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
