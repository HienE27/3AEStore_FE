import React, { createContext, useContext, useState, useEffect } from "react";
import cartAPI from "../api/CartAPI";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCartCount: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    if (token) {
      const count = await cartAPI.getCartItemCount(token);
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => { refreshCartCount(); }, [token]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
