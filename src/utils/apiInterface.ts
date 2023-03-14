import axios from 'axios';
import logger from '@/logger';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

const instance = axios.create({ baseURL: BASE_URL });

instance.interceptors.response.use((response) => response.data, (error) => {
  logger.error({ error }, `error message: ${error.message}`);

  if (error.response) {
    logger.error({ error }, `error status: ${error.response.status}`);
  }

  return Promise.reject(error);
});

export default instance;
