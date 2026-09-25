import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

let sharedConnection: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;

function getSharedConnection(): signalR.HubConnection {
  if (!sharedConnection) {
    sharedConnection = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5212/tradingHub', {
        accessTokenFactory: () => {
          return localStorage.getItem('accessToken') ?? '';
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  return sharedConnection;
}

export function useSignalR() {
  const [connection, setConnection] =
    useState<signalR.HubConnection | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectionInstance = getSharedConnection();

    setConnection(connectionInstance);

    const updateConnectionState = () => {
      setIsConnected(
        connectionInstance.state === signalR.HubConnectionState.Connected
      );
    };

    const startConnection = async () => {
      if (
        connectionInstance.state ===
        signalR.HubConnectionState.Disconnected
      ) {
        if (!startPromise) {
          startPromise = connectionInstance
            .start()
            .finally(() => {
              startPromise = null;
            });
        }

        try {
          await startPromise;
        } catch (error) {
          console.error('❌ SignalR connection failed:', error);
        }
      }

      updateConnectionState();
    };

    const handleReconnecting = () => {
      setIsConnected(false);
      console.log('🔄 SignalR reconnecting...');
    };

    const handleReconnected = () => {
      setIsConnected(true);
      console.log('✅ SignalR reconnected');
    };

    const handleClosed = () => {
      setIsConnected(false);
      console.log('🔌 SignalR connection closed');
    };

    connectionInstance.onreconnecting(handleReconnecting);
    connectionInstance.onreconnected(handleReconnected);
    connectionInstance.onclose(handleClosed);

    startConnection();

    return () => {
      // Do not stop the shared connection here.
      // Multiple components use the same SignalR connection.
    };
  }, []);

  return {
    connection,
    isConnected,
  };
}