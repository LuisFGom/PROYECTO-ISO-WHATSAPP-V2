// frontend/src/presentation/pages/HomePage.tsx
import { useSocket } from '../hooks/useSocket';
import { ReconnectingOverlay } from '../components/ReconnectingOverlay';
import { UserMenu } from '../components/UserMenu';

export const HomePage = () => {
  // 🔌 Hook de Socket.IO
  const { isConnected, isReconnecting, reconnectAttempt } = useSocket();

  return (
    <>
      {/* 🔥 OVERLAY DE RECONEXIÓN */}
      <ReconnectingOverlay 
        isVisible={isReconnecting} 
        attempt={reconnectAttempt} 
      />

      {/* TU INTERFAZ PRINCIPAL */}
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-300">
          {/* Header */}
          <div className="h-16 bg-whatsapp-teal flex items-center justify-between px-4">
            <h1 className="text-white text-xl font-semibold">WhatsApp</h1>
            
            {/* 🔥 MENÚ DE USUARIO */}
            <div className="flex items-center gap-4">
              {/* Indicador de conexión */}
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white text-xs">Desconectado</span>
                </div>
              )}

              {/* Menú de usuario */}
              <UserMenu />
            </div>
          </div>

          {/* Lista de chats */}
          <div className="overflow-y-auto h-[calc(100vh-64px)]">
            <div className="p-4">
              <h2 className="text-gray-600 text-sm font-medium mb-3">Chats recientes</h2>
              
              {/* Aquí irán tus contactos/chats */}
              <div className="space-y-2">
                {/* Ejemplo de chat */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">U</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Usuario 1</h3>
                    <p className="text-sm text-gray-500 truncate">Último mensaje...</p>
                  </div>
                  <div className="text-xs text-gray-400">12:30</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {/* Header del chat */}
          <div className="h-16 bg-gray-200 border-b border-gray-300 flex items-center px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
              <div>
                <h2 className="font-semibold text-gray-800">Selecciona un chat</h2>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Conectado' : 'Esperando conexión...'}
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 bg-[#e5ddd5] p-4 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  WhatsApp Web
                </h3>
                <p className="text-gray-500">
                  Selecciona un chat para comenzar a conversar
                </p>
              </div>
            </div>
          </div>

          {/* Input de mensaje */}
          <div className="h-16 bg-gray-200 border-t border-gray-300 flex items-center px-4 gap-3">
            <input
              type="text"
              placeholder={isConnected ? "Escribe un mensaje..." : "Esperando conexión..."}
              disabled={!isConnected}
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-whatsapp-green disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              disabled={!isConnected}
              className="bg-whatsapp-green text-white p-3 rounded-full hover:bg-whatsapp-green-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};