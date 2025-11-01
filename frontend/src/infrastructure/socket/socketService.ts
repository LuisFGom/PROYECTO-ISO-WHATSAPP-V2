// frontend/src/infrastructure/socket/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private userId: number | null = null;

  // 🔌 Conectar al servidor
  connect(token: string, userId: number) {
    if (this.socket?.connected) {
      console.log('⚠️ Ya existe una conexión activa');
      return;
    }

    // 🔥 Obtener la URL del backend (SIN /api al final)
    let SOCKET_URL = 'https://specifically-semihumanistic-maria.ngrok-free.dev';
    
    if (import.meta.env.VITE_API_URL) {
      // Si existe VITE_API_URL, remover el /api
      SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
    }
    
    console.log('🔌 Conectando Socket.IO a:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'], // 🔥 Probar ambos transportes
    });

    this.userId = userId;

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO');
      // Autenticar usuario
      this.socket?.emit('authenticate', userId);
    });

    this.socket.on('authenticated', (data) => {
      console.log('🔐 Autenticado:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Intento de reconexión #${attempt}`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ Reconectado después de ${attempt} intentos`);
    });
  }

  // 🔌 Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('🔌 Socket desconectado manualmente');
    }
  }

  // 📨 Enviar mensaje
  sendMessage(to: number, content: string) {
    if (!this.socket || !this.userId) {
      console.error('❌ Socket no conectado');
      return;
    }

    this.socket.emit('message:send', {
      from: this.userId,
      to,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  // 👂 Escuchar mensajes entrantes
  onMessageReceive(callback: (data: any) => void) {
    this.socket?.on('message:receive', callback);
  }

  // 👂 Escuchar confirmación de mensaje enviado
  onMessageSent(callback: (data: any) => void) {
    this.socket?.on('message:sent', callback);
  }

  // ⌨️ Indicar que estás escribiendo
  startTyping(to: number) {
    if (!this.userId) return;
    this.socket?.emit('typing:start', { from: this.userId, to });
  }

  stopTyping(to: number) {
    if (!this.userId) return;
    this.socket?.emit('typing:stop', { from: this.userId, to });
  }

  // 👂 Escuchar cuando alguien está escribiendo
  onTypingStart(callback: (data: { from: number; to: number }) => void) {
    this.socket?.on('typing:start', callback);
  }

  onTypingStop(callback: (data: { from: number; to: number }) => void) {
    this.socket?.on('typing:stop', callback);
  }

  // 👂 Escuchar usuarios online/offline
  onUserOnline(callback: (data: { userId: number }) => void) {
    this.socket?.on('user:online', callback);
  }

  onUserOffline(callback: (data: { userId: number }) => void) {
    this.socket?.on('user:offline', callback);
  }

  // ✅ Marcar mensaje como leído
  markAsRead(messageId: number, userId: number) {
    this.socket?.emit('message:read', { messageId, userId });
  }

  onMessageRead(callback: (data: { messageId: number; userId: number }) => void) {
    this.socket?.on('message:read', callback);
  }

  // 📊 Estado de la conexión
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionState(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }

  // 🔥 Exponer el socket para escuchar eventos personalizados
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();