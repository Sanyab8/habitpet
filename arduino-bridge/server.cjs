// arduino-bridge/server.js
const express = require('express');
const { SerialPort } = require('serialport');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CHANGE THIS to your Arduino port
const ARDUINO_PORT = '/dev/cu.usbmodem141011';

let port;
let currentStreak = 0;
let isConnected = false;

function connectToArduino() {
  try {
    port = new SerialPort({
      path: ARDUINO_PORT,
      baudRate: 9600
    });

    port.on('open', () => {
      console.log('✅ Connected to Arduino Cat Buddy!');
      isConnected = true;
    });

    port.on('data', (data) => {
      const msg = data.toString().trim();
      console.log('Arduino:', msg);
      
      if (msg.includes('STREAK:')) {
        currentStreak = parseInt(msg.split(':')[1]);
        console.log('📊 Current streak:', currentStreak);
      }
    });

    port.on('error', (err) => {
      console.error('❌ Serial port error:', err.message);
      isConnected = false;
    });

    port.on('close', () => {
      console.log('🔌 Arduino disconnected. Retrying in 5s...');
      isConnected = false;
      setTimeout(connectToArduino, 5000);
    });
  } catch (err) {
    console.error('❌ Failed to connect:', err.message);
    isConnected = false;
    setTimeout(connectToArduino, 5000);
  }
}

connectToArduino();

// Endpoint called when habit is completed
app.post('/api/habit-complete', (req, res) => {
  if (!isConnected || !port) {
    return res.status(503).json({ 
      success: false, 
      error: 'Arduino not connected' 
    });
  }

  console.log('📝 Habit completed in web app! Sending to Arduino...');
  
  port.write('h', (err) => {
    if (err) {
      console.error('Error writing to Arduino:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    console.log('✅ Sent check-in command to Arduino Cat Buddy');
    res.json({ success: true, message: 'Cat buddy notified! 🐱' });
  });
});

// Get Arduino status
app.get('/api/arduino-status', (req, res) => {
  if (!isConnected) {
    return res.json({ connected: false, streak: 0 });
  }

  port.write('g', (err) => {
    if (err) {
      return res.json({ connected: false, streak: 0 });
    }
  });

  setTimeout(() => {
    res.json({ 
      connected: isConnected, 
      streak: currentStreak 
    });
  }, 100);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Arduino Bridge Server running on http://localhost:${PORT}`);
  console.log(`📡 Listening for Arduino on ${ARDUINO_PORT}`);
  console.log('🎯 Waiting for habit completions from web app...');
});