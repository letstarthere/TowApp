import { authManager } from './auth';
import { errorHandler } from './errorHandler';

class SecureWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: string[] = [];
  private isConnecting = false;

  connect(userId: number, onMessage: (data: any) => void) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const tokens = authManager.getTokens();
    
    if (!tokens) {
      errorHandler.logError(new Error('No auth tokens for WebSocket'), 'WEBSOCKET');
      return;
    }

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}?token=${tokens.accessToken}&userId=${userId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          errorHandler.logError(error as Error, 'WEBSOCKET_MESSAGE');
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect(userId, onMessage);
      };

      this.ws.onerror = (error) => {
        errorHandler.logError(new Error('WebSocket error'), 'WEBSOCKET');
        this.isConnecting = false;
      };

    } catch (error) {
      errorHandler.logError(error as Error, 'WEBSOCKET_CONNECT');
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(userId: number, onMessage: (data: any) => void) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      this.connect(userId, onMessage);
    }, delay);
  }

  send(message: any) {
    const messageStr = JSON.stringify(message);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(messageStr);
    } else {
      this.messageQueue.push(messageStr);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(message);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const secureWebSocket = new SecureWebSocket();