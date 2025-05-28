import { useCallback } from "react";
import { createApiClient } from "../api/client";
import { ExpenseDto, UsersDictionary } from "../types/expense";
import { Result } from "../types/result";

export interface EnumOptions {
  value: number;
  name: string;
}

export const useExpenses = () => {

  const api = createApiClient();

  const create = useCallback(
    async (data: ExpenseDto) => {
      await api.post('/expense', data);
    },
    [api]
  );

  const get = useCallback(
    async (): Promise<ExpenseDto[]> => {
      const response = await api.get('/expense');
      return response.data;
    },
    [api]
  );

  const getTypes = useCallback(
    async (): Promise<EnumOptions[]> => {
      const response = await api.get('/expense/types');
      return response.data;
    },
    [api]
  );

  const getCategories = useCallback(
    async (): Promise<EnumOptions[]> => {
      const response = await api.get('/expense/categories');
      return response.data;
    },
    [api]
  );

  const getUsers = useCallback(
    async (residenceId: string): Promise<Result<UsersDictionary>> => {
      const response = await api.get(`/expense/categories`, { params: { residenceId } });
      return response.data;
    },
    [api]
  );

  return { 
    create,
    get,
    getTypes,
    getCategories,
    getUsers
  };
};
