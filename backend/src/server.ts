// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import contactRoutes from './presentation/routes/contact.routes';

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 LOG INICIAL: para saber si Express se levanta bien
console.log('🟢 Iniciando servidor Express...');

// ✅ Prefijo correcto
app.use('/api/contacts', (req, res, next) => {
  console.log(`➡️ [${req.method}] ${req.originalUrl}`);
  next();
}, contactRoutes);

// Prueba rápida
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
