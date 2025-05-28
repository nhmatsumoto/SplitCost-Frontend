import { useCallback } from "react";
import { createApiClient } from "../api/client";
import { AddressDto } from "../types/residence";

export const useAddress = () => {

  const api = createApiClient();

  const create = useCallback(
    async (data: AddressDto) => {
      await api.post('/address', data);
    },
    [api]
  );

  return { 
    create,
  };
};
