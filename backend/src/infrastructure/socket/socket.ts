// backend/src/infrastructure/socket/socket.server.ts
import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

export class SocketService {
  private io: Server;
  private connectedUsers: Map<number, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket) => {
      console.log('✅ Usuario conectado:', socket.id);

      // 🔐 Autenticación del usuario
      socket.on('authenticate', (userId: number) => {
        console.log(`🔐 Usuario ${userId} autenticado con socket ${socket.id}`);
        this.connectedUsers.set(userId, socket.id);
        
        // Notificar al usuario que está conectado
        socket.emit('authenticated', { userId, socketId: socket.id });
        
        // Notificar a todos que el usuario está online
        this.io.emit('user:online', { userId });
      });

      // 📨 Enviar mensaje
      socket.on('message:send', (data: {
        from: number;
        to: number;
        content: string;
        timestamp: string;
      }) => {
        console.log('📨 Mensaje recibido:', data);
        
        // Obtener socket del destinatario
        const recipientSocketId = this.connectedUsers.get(data.to);
        
        if (recipientSocketId) {
          // Enviar al destinatario específico
          this.io.to(recipientSocketId).emit('message:receive', data);
          console.log(`✅ Mensaje enviado a usuario ${data.to}`);
        } else {
          console.log(`⚠️ Usuario ${data.to} no está conectado`);
        }
        
        // Confirmar al remitente
        socket.emit('message:sent', { success: true, data });
      });

      // ⌨️ Usuario escribiendo
      socket.on('typing:start', (data: { from: number; to: number }) => {
        const recipientSocketId = this.connectedUsers.get(data.to);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('typing:start', data);
        }
      });

      socket.on('typing:stop', (data: { from: number; to: number }) => {
        const recipientSocketId = this.connectedUsers.get(data.to);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('typing:stop', data);
        }
      });

      // ✅ Mensaje leído
      socket.on('message:read', (data: { messageId: number; userId: number }) => {
        const recipientSocketId = this.connectedUsers.get(data.userId);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('message:read', data);
        }
      });

      // 🔌 Desconexión
      socket.on('disconnect', () => {
        console.log('❌ Usuario desconectado:', socket.id);
        
        // Encontrar userId del socket desconectado
        let disconnectedUserId: number | null = null;
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            this.connectedUsers.delete(userId);
            break;
          }
        }
        
        if (disconnectedUserId) {
          // Notificar a todos que el usuario está offline
          this.io.emit('user:offline', { userId: disconnectedUserId });
        }
      });
    });
  }

  // Método para obtener la instancia de Socket.IO
  public getIO(): Server {
    return this.io;
  }

  // Obtener usuarios conectados
  public getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }
}

export let socketService: SocketService;

export const initializeSocket = (httpServer: HTTPServer): SocketService => {
  socketService = new SocketService(httpServer);
  return socketService;
};