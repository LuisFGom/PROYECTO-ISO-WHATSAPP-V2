// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/environment';
import { database } from './infrastructure/database/mysql/connection';
import routes from './presentation/routes';
import { errorMiddleware } from './presentation/middlewares/error.middleware';
import { initializeSocket } from './infrastructure/socket/socket'; // 🔥 CAMBIADO

const app = express();

// 🔥 Crear servidor HTTP para Socket.IO
const httpServer = createServer(app);

// Middlewares
app.use(cors({ 
  origin: config.cors.origin,
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'WhatsApp Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Ruta para probar conexión a DB
app.get('/health', async (req, res) => {
  try {
    await database.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      database: 'connected' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api', routes);

// Error handler middleware (debe ir al final)
app.use(errorMiddleware);

// 🔥 Inicializar Socket.IO
const socketService = initializeSocket(httpServer);
console.log('🔌 Socket.IO inicializado');

// 🔥 Iniciar servidor con HTTP (para Socket.IO)
httpServer.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${config.port}`); // 🔥 CORREGIDO
  console.log(`📍 http://localhost:${config.port}`); // 🔥 CORREGIDO
  console.log(`🌍 Environment: ${config.nodeEnv}`); // 🔥 CORREGIDO
  console.log(`🔌 Socket.IO ready`); // 🔥 CORREGIDO
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});