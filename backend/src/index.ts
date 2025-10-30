// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { database } from './infrastructure/database/mysql/connection';
import routes from './presentation/routes';
import { errorMiddleware } from './presentation/middlewares/error.middleware';

const app = express();

// Middlewares
app.use(cors({ origin: config.cors.origin }));
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

// Iniciar servidor
app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📍 http://localhost:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});