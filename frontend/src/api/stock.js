import axiosClient from './axiosClient';

export const getLowStock = async () => {
  const response = await axiosClient.get('/stock/low');
  return response.data;
};