import React, { useCallback, useEffect, useState } from 'react';
import { useExpenses, EnumOptions } from '../../hooks/useExpenses';
import { useAuth } from 'react-oidc-context';
import toast from 'react-hot-toast';
import { ExpenseDto, UsersDictionary } from '../../types/expenseTypes';
import { useResidenceStore } from '../../store/residenceStore';

interface CreateExpenseFormProps {
  residenceId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const CreateExpenseForm = ({ residenceId, onSuccess, onError }: CreateExpenseFormProps) => {
  const [type, setType] = useState<number>();
  const [category, setCategory] = useState<number>();
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [sharedWithUserIds, setSharedWithUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [typeOptions, setTypeOptions] = useState<EnumOptions[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<EnumOptions[]>([]);
  const [userOptions, setUserOptions] = useState<UsersDictionary>({});

  const { create, getTypes, getCategories, getUsers } = useExpenses();
  const { user } = useAuth();
  const residence = useResidenceStore((state) => state.residence);

  const userId = user?.profile?.sub;

  const loadOptions = async () => {
      try {
        const [types, categories, users] = await Promise.all([
          getTypes(),
          getCategories(),
          getUsers(residence?.id || residenceId)
        ]);

        setTypeOptions(types);
        setCategoryOptions(categories);
        setUserOptions(users.data || {});
      } catch (error) {
        toast.error('Erro ao carregar dados do formulário.');
      }
    };

  useEffect(() => {
    loadOptions();
  }, [getTypes, getCategories, getUsers]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!userId) {
        toast.error('ID do usuário não encontrado.');
        return;
      }

      if (!residenceId) {
        toast.error('ID da residência não informado.');
        return;
      }

      setLoading(true);

      const payload: ExpenseDto = {
        amount,
        date: date,
        description,
        residenceId,
        registerByUserId: userId,
        paidByUserId: userId,
        isSharedAmongMembers: isShared,
        type: '',
        category: ''
      };

      try {
        await create(payload);
        toast.success('Despesa registrada com sucesso!');
        onSuccess?.();
        // Reset
        setType(undefined);
        setCategory(undefined);
        setAmount(0);
        setDate(new Date().toISOString().slice(0, 10));
        setDescription('');
        setIsShared(false);
        setSharedWithUserIds([]);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erro ao registrar despesa.';
        toast.error(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [type, category, amount, date, description, isShared, sharedWithUserIds, residenceId, userId, create, onSuccess, onError]
  );

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Cadastrar Despesa</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Tipo:</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={type ?? ''}
            onChange={(e) => setType(Number(e.target.value))}
            required
          >
            <option value="">Selecione</option>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Categoria:</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={category ?? ''}
            onChange={(e) => setCategory(Number(e.target.value))}
            required
          >
            <option value="">Selecione</option>
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Valor:</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Data:</label>
          <input
            type="date"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Descrição:</label>
          <input
            type="text"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
          />
          <label className="text-gray-700">Despesa compartilhada?</label>
        </div>

        {isShared && (
          <div>
            <label className="block font-medium text-gray-700 mb-1">Compartilhar com:</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
              {Object.entries(userOptions).map(([id, name]) => (
                <label key={id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={id}
                    checked={sharedWithUserIds.includes(id)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSharedWithUserIds((prev) =>
                        prev.includes(value)
                          ? prev.filter((v) => v !== value)
                          : [...prev, value]
                      );
                    }}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Salvando...' : 'Cadastrar Despesa'}
        </button>
      </form>
    </div>
  );
};

export default CreateExpenseForm;
