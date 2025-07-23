import axios from 'axios';

const API_URL = 'http://localhost:3001/api/inventory';

export const fetchInventory = () => axios.get(API_URL);