import axiosClient from './axiosClient';

export const previewBill = async (items, outlet_id = 1) => {
  const response = await axiosClient.post('/billing/preview', items);
  return response.data;
};

export const confirmBill = async (items, outlet_id = 1, notes = '') => {
  const response = await axiosClient.post('/billing/confirm', {
    items,
    outlet_id,
    notes
  });
  return response.data;
};