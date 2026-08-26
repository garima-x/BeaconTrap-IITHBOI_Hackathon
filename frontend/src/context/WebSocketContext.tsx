import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface WebSocketMessage {
  event: string;
  case_id: string;
  progress: number;
}

interface WebSocketContextType {
  lastMessage: WebSocketMessage | null;
  subscribeToCase: (caseId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const subscribeToCase = (caseId: string) => {
    if (socket) {
      socket.close();
    }
    const wsUrl = `ws://${window.location.host}/ws/analysis/${caseId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (err) {
        console.error("Failed to parse websocket payload:", err);
      }
    };
    
    setSocket(ws);
  };

  useEffect(() => {
    return () => {
      if (socket) socket.close();
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ lastMessage, subscribeToCase }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
