import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../infrastructure/api/apiClient';

export const HomePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Llamar al backend para actualizar status a offline
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar localStorage y redirigir
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-whatsapp-green mb-6 text-center">
          ¡Bienvenido!
        </h1>

        {user && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Usuario:</p>
              <p className="text-lg font-semibold">{user.username}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Email:</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Estado:</p>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  user.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></span>
                <p className={`text-lg font-semibold capitalize ${
                  user.status === 'online' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {user.status === 'online' ? 'En línea' : 'Desconectado'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Acerca de:</p>
              <p className="text-lg">{user.about}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          🚧 Chat en desarrollo...
        </p>
      </div>
    </div>
  );
};