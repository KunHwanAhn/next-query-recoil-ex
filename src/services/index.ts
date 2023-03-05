import apiInstance from '@/utils/apiInterface';
import type { Todo } from '@/@types/index';

// eslint-disable-next-line import/prefer-default-export
export const getTodos = async (): Promise<Todo[] | null> => apiInstance.get('/todos');
