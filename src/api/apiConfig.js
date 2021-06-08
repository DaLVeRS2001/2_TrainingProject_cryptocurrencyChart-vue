import axios from "axios";

export const apiConfig = axios.create({
  baseURL: 'https://min-api.cryptocompare.com/data/'
})