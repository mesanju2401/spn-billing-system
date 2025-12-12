import axiosClient from './axiosClient';

export const createOffer = async (data) => {
  const response = await axiosClient.post('/offers/', data);
  return response.data;
};

export const getOfferByProductId = async (product_id) => {
  const response = await axiosClient.get(`/offers/${product_id}`);
  return response.data;
};

export const listOffers = async () => {
  // Assuming there's an endpoint to list all offers
  const response = await axiosClient.get('/offers/');
  return response.data;
};