import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import { useUserStore } from '../stores/userStore';

export const createApiClient = () => {

  const { isAuthenticated, user } = useAuth();

  const setUser = useUserStore((state) => state.setUser);

  const api = axios.create({
    baseURL: 'https://localhost:7041/api',
  });

  api.interceptors.request.use((config) => {
    if (isAuthenticated && user) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
      setUser(user);
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNABORTED') {
        console.error('Tempo limite excedido. O servidor não respondeu.');
      } else if (error.response) {
        // Erros com resposta do servidor
        const status = error.response.status;
        if (status === 503 || status === 500) {
          console.error('Servidor indisponível no momento. Tente novamente mais tarde.');
        }
      } else if (error.request) {
        // Erros sem resposta (ex: servidor está fora do ar)
        console.error('Servidor fora do ar ou rede indisponível.');
      } else {
        console.error('Erro desconhecido:', error.message);
      }

      // Você pode também lançar o erro para ser tratado por chamadas individuais
      return Promise.reject(error);
    }
  );

  return api;
};
