// frontend/src/presentation/hooks/useNetworkStatus.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../infrastructure/api/apiClient';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // 🔥 Verificar conexión al backend
  const checkBackendConnection = useCallback(async () => {
    try {
      // Hacer una petición simple al health check
      await apiClient.get('/health', { timeout: 5000 });
      setIsBackendReachable(true);
      setIsReconnecting(false);
      setReconnectAttempt(0);
      return true;
    } catch (error) {
      console.log('❌ Backend no alcanzable');
      setIsBackendReachable(false);
      return false;
    }
  }, []);

  // 🔥 Intentar reconectar periódicamente
  useEffect(() => {
    let intervalId: number | undefined;
    let monitorInterval: number | undefined;

    const startReconnecting = () => {
      if (isReconnecting) return;
      
      console.log('🔄 Iniciando proceso de reconexión...');
      setIsReconnecting(true);
      setReconnectAttempt(1);

      intervalId = window.setInterval(async () => {
        console.log('🔄 Intentando reconectar al backend...');
        setReconnectAttempt((prev) => prev + 1);
        
        const connected = await checkBackendConnection();
        if (connected) {
          console.log('✅ Reconexión exitosa');
          if (intervalId) window.clearInterval(intervalId);
        }
      }, 3000); // Intentar cada 3 segundos
    };

    // 🌐 Escuchar eventos de conexión a internet
    const handleOnline = () => {
      console.log('🌐 Internet conectado');
      setIsOnline(true);
      checkBackendConnection();
    };

    const handleOffline = () => {
      console.log('❌ Internet desconectado');
      setIsOnline(false);
      setIsReconnecting(true);
    };

    // 🔥 Detectar cuando el usuario se va de la página (cierra tab, navega, etc)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Página visible de nuevo, verificando conexión...');
        checkBackendConnection();
      }
    };

    // 🔥 Detectar cuando la página vuelve a tener foco
    const handleFocus = () => {
      console.log('🎯 Ventana con foco, verificando conexión...');
      checkBackendConnection();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // 🔥 Verificar conexión inicial
    checkBackendConnection();

    // 🔥 Monitorear backend cada 10 segundos si está online
    monitorInterval = window.setInterval(() => {
      if (isOnline && !isReconnecting) {
        checkBackendConnection().then((connected) => {
          if (!connected) {
            startReconnecting();
          }
        });
      }
    }, 10000);

    // 🔥 Si se pierde conexión con backend, empezar a reconectar
    if (isOnline && !isBackendReachable && !isReconnecting) {
      startReconnecting();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (intervalId) window.clearInterval(intervalId);
      if (monitorInterval) window.clearInterval(monitorInterval);
    };
  }, [isOnline, isBackendReachable, isReconnecting, checkBackendConnection]);

  return {
    isOnline,
    isBackendReachable,
    isReconnecting: !isOnline || (isOnline && !isBackendReachable),
    reconnectAttempt,
  };
};