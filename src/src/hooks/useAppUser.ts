import { useCallback } from 'react';
import { createApiClient } from '../api/client';
import { RegisterUserDto } from '../types/user';

export const useAppUser = () => {

  const api = createApiClient();

  const create = useCallback(
    async (data: RegisterUserDto) => {
      await api.post('/users/register', data);
    },
    [api]
  );

  return { 
    create
  };
};
