import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export function useSignalR() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create the connection (point to your backend SignalR hub)
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5212/tradingHub')  // 👈 Your backend hub URL
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log('✅ SignalR connected');
      })
      .catch((err) => {
        console.error('❌ SignalR connection failed:', err);
      });

    // Cleanup on unmount
    return () => {
      newConnection.stop();
    };
  }, []);

  return { connection, isConnected };
}