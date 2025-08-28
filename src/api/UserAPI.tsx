import axios from "axios";

const BASE_URL = "http://localhost:8080/api/customers";

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_name: string;
  active: boolean;
  gender: string;
  registered_at: string;
  updated_at: string;
  role?: string;
}

export interface CustomerApiResponse {
  customers: Customer[];  // BE trả về mảng này
  pageMetadata?: {        // BE trả về metadata này
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export const fetchCustomers = async (
  page = 1,
  size = 10,
  search = ""
): Promise<CustomerApiResponse> => {
  const params: any = { page: page - 1, size };
  if (search.trim()) params.search = search.trim();
  const { data } = await axios.get<CustomerApiResponse>(BASE_URL, { params });
  return data;
};


export const fetchCustomerById = async (id: string): Promise<Customer> => {
  const { data } = await axios.get<Customer>(`${BASE_URL}/${id}`);
  return data;
};

export const updateCustomer = async (
  id: string,
  payload: Partial<Customer>
): Promise<Customer> => {
  const { data } = await axios.put<Customer>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const createCustomer = async (payload: Partial<Customer>): Promise<Customer> => {
  const { data } = await axios.post<Customer>(BASE_URL, payload);
  return data;
};
