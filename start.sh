#!/bin/bash
python run.py &
FLASK_PID=$!
sleep 2
npm run dev &
NODE_PID=$!
trap "kill $FLASK_PID $NODE_PID 2>/dev/null" EXIT
wait
