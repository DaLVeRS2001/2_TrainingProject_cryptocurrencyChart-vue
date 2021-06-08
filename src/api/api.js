import { apiConfig } from "@/api/apiConfig";

export const api = {
 async getSingleSymbolPrice(ticketName){
  return  apiConfig.get(`price?fsym=${ticketName}&tsyms=USD`)
    .then(price=> price.data.USD)
  }
}

