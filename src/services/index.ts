import apiInstance from '@/utils/apiInterface';
import type { Todo, Album } from '@/@types/index';

export const getTodos = async (): Promise<Todo[] | null> => apiInstance.get('/todos');
export const getAlbums = async (): Promise<Album[] | null> => apiInstance.get('/albums');
