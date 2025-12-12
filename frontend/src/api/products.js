import axiosClient from './axiosClient';

export const getProductByBarcode = async (product_id_or_barcode) => {
  const response = await axiosClient.get(`/products/${product_id_or_barcode}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await axiosClient.post('/products/', data);
  return response.data;
};

export const listProducts = async () => {
  const response = await axiosClient.get('/products/');
  return response.data;
};