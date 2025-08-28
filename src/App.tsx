// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

import Header from './header-footer/Header';
import Footer from './header-footer/Footer';

import HomePage from './homepage/HomePage';
import Login from './user/Login';
import Register from './user/Register';

import Main from './profile/Main';
import Seller from './profile/Seller';
import Wishlist from './profile/Wishlist';
import Setting from './profile/Setting';
import MyAddress from './profile/Address';

import Detail from './product/Detail';

import ShoppingCart from './cart/ShoppingCart';
import CheckoutPage from './checkout/CheckoutPage';
import PageContent from './content/PageContent';
import RequireAdmin from './admin/RequireAdmin';
import { Error403Page } from './utils/403Page';
import { getRoleByToken } from './utils/JwtService';
import AdminPage from './admin/components/AdminPage';

import CategoryCreatePage from './admin/components/category/CategoryCreatePage';
import CategoryEditPage from './admin/components/category/CategoryEditPage';
import ProductPage from './admin/components/ProductPage';
import { ProductCreatePage } from './admin/components/product/ProductCreatePage';
import ProductEditPage from './admin/components/product/ProductEditPage';
import CategoryListPage from './category/CategoryListPage';
import CategoryOverviewPage from './category/CategoryOverviewPage';
import CategoryPage from './admin/components/CategoryPage';
import CategoryPageUser from './category/CategoryPageUser';
import UserPage from './admin/components/UserPage';
import OrderPage from './admin/components/OrderPage';
import UserEdit from './admin/components/user/UserEdit';
import UserView from './admin/components/user/UserView';
import { ActivationForm } from './user/ActivationForm';
import SearchPage from './header-footer/SearchPage';
import NewsCreate from './admin/components/news/NewsCreate';
import NewsEdit from './admin/components/news/NewsEdit';
import NewsList2 from './admin/components/news/NewsList2';
import NewsDetail2 from './admin/components/news/NewsDetail2';
import NewsAllPage from './news/NewsAllPage';
import NewsDetail from './news/NewsDetail';
import CustomerOrderTracking from './profile/CustomerOrderTracking';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from './contexts/CartContext';


// Wrapper để sử dụng useLocation trong function App
function AppWrapper() {
  return (
    <AuthProvider>
      <CartProvider>
    <Router>
      <App />
    </Router>
    </CartProvider>
    </AuthProvider>
  );
}

function App() {
  const location = useLocation();
  // const role = getRoleByToken();
  const { role } = useAuth(); // <-- lấy role từ context


  // Ẩn header/footer nếu là admin và đang ở trang /management
  const isAdminRoute = role === 'ADMIN' && location.pathname.startsWith('/management');

  const ProtectedAdminPage = RequireAdmin(AdminPage);

  return (
    <div className="App">
      {!isAdminRoute && <Header />}

      <Routes>



        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate" element={<ActivationForm />} />

        {/* Profile Pages - Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        } />
        <Route path="/profile/orders" element={
          <ProtectedRoute>
            <CustomerOrderTracking />
          </ProtectedRoute>
        } />
        <Route path="/profile/seller" element={
          <ProtectedRoute>
            <Seller />
          </ProtectedRoute>
        } />
        <Route path="/profile/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path="/profile/settings" element={
          <ProtectedRoute>
            <Setting />
          </ProtectedRoute>
        } />
        <Route path="/profile/address" element={
          <ProtectedRoute>
            <MyAddress />
          </ProtectedRoute>
        } />

        {/* News Pages */}
        <Route path="/news" element={<NewsAllPage />} />
        <Route path="/news/:id" element={<NewsDetail />} />

        {/* Product Detail Page */}
        <Route path="/product-detail/:id" element={<Detail />} />

        {/* Search Page */}
        <Route path="/search" element={<SearchPage />} />

        {/* Shopping Cart & Checkout - Protected Routes */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <ShoppingCart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />

        {/* Order Tracking */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <CustomerOrderTracking />
          </ProtectedRoute>
        } />

        {/* Category user */}
        <Route path="/categories" element={<CategoryListPage />} />
        <Route path="/category" element={<CategoryOverviewPage />} />
        <Route path="/category/:id" element={<CategoryPageUser />} />

        {/* Content */}
        <Route path="/content" element={<PageContent />} />

        {/* Error Pages */}
        <Route path="/error-403" element={<Error403Page />} />

        {/* Admin Routes */}
        <Route path="/management" element={<ProtectedAdminPage />}>
          {/* Product Management */}
          <Route path="product" element={<ProductPage />} />
          <Route path="add-product" element={<ProductCreatePage />} />
          <Route path="edit-product/:productId" element={<ProductEditPage />} />

          {/* Category Management */}
          <Route path="category" element={<CategoryPage />} />
          <Route path="add-category" element={<CategoryCreatePage />} />
          <Route path="edit-category/:id" element={<CategoryEditPage />} />

          {/* Order Management */}
          <Route path="order" element={<OrderPage />} />

          {/* User Management */}
          <Route path="user" element={<UserPage />} />
          <Route path="user/add" element={<UserEdit />} />
          <Route path="user/edit/:id" element={<UserEdit />} />
          <Route path="user/view/:id" element={<UserView />} />

          {/* News Management */}
          <Route path="news" element={<NewsList2 />} /> 
          <Route path="news/create" element={<NewsCreate />} />
          <Route path="news/edit/:id" element={<NewsEdit />} /> 
          <Route path="news/show/:id" element={<NewsDetail2 />} /> 
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default AppWrapper;