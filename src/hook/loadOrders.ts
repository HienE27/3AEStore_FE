// src/hooks/loadOrders.ts - Fixed version
import { useState, useCallback } from 'react';
import axios from 'axios';

interface OrderItem {
  id: string;
  created_at: string;
  totalPrice: number;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  orderStatus?: {
    statusName: string;
  };
  orderApprovedAt?: string | null;
  orderDeliveredCarrierDate?: string | null;
  orderDeliveredCustomerDate?: string | null;
  shippingAddress?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  note?: string;
  trackingNumber?: string;
}

interface LoadOrdersState {
  orders: OrderItem[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

interface LoadOrdersResult {
  orders: OrderItem[];
  totalPages: number;
}

export const useLoadOrders = () => {
  const [orderState, setOrderState] = useState<LoadOrdersState>({
    orders: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1
  });

  const loadOrdersData = useCallback(async (
    page: number = 1,
    size: number = 20,
    search: string = "",
    status?: string
  ): Promise<LoadOrdersResult> => {
    setOrderState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params: any = { page: page - 1, size };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      
      const response = await axios.get('http://localhost:8080/api/orders/admin/all', { params });
      const ordersData = Array.isArray(response.data) ? response.data : response.data.orders || [];
      const totalPages = response.data.page?.totalPages || 1;
      
      setOrderState(prev => ({
        ...prev,
        orders: ordersData,
        totalPages,
        currentPage: page,
        loading: false
      }));

      return { orders: ordersData, totalPages };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load orders';
      setOrderState(prev => ({
        ...prev,
        error: errorMessage,
        orders: [],
        loading: false
      }));
      return { orders: [], totalPages: 1 };
    }
  }, []);

  const refreshOrders = useCallback(() => {
    return loadOrdersData(orderState.currentPage);
  }, [loadOrdersData, orderState.currentPage]);

  const clearError = useCallback(() => {
    setOrderState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    orders: orderState.orders,
    loading: orderState.loading,
    error: orderState.error,
    totalPages: orderState.totalPages,
    currentPage: orderState.currentPage,
    loadOrders: loadOrdersData,
    refreshOrders,
    clearError
  };
};