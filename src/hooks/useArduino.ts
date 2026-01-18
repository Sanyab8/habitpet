// src/hooks/useArduino.ts
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const BRIDGE_URL = 'http://localhost:3001';

export function useArduino() {
  const [isConnected, setIsConnected] = useState(false);
  const [arduinoStreak, setArduinoStreak] = useState(0);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${BRIDGE_URL}/api/arduino-status`);
      const data = await response.json();
      setIsConnected(data.connected);
      setArduinoStreak(data.streak || 0);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const notifyHabitComplete = async () => {
    try {
      const response = await fetch(`${BRIDGE_URL}/api/habit-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Arduino Cat Buddy notified!');
        toast.success('🐱 Cat buddy responded!');
        return true;
      }
    } catch (error) {
      console.warn('Arduino not connected:', error);
      return false;
    }
  };

  return {
    isConnected,
    arduinoStreak,
    notifyHabitComplete,
    checkConnection
  };
}