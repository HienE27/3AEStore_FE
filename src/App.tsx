import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Header from './header-footer/Header';
import Footer from './header-footer/Footer';

import HomePage from './homepage/HomePage';
import Login from './user/Login'; 
import Register from './user/Register';

import Main from './profile/Main';
import Order from './profile/Order';
import Seller from './profile/Seller';
import Wishlist from './profile/Wishlist';
import Setting from './profile/Setting';
import MyAddress from './profile/MyAddress'; 
import List from './product/List';
import Detail from './product/Detail';
import CategoryList from './category/CategoryList';

import ShoppingCart from './cart/ShoppingCart';
import PageContent from './content/PageContent';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header component */}
        <Header />

        {/* Routes for different pages */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Profile Pages */}
          <Route path="/profile" element={<Main />} />
          <Route path="/profile/orders" element={<Order />} />
          <Route path="/profile/seller" element={<Seller />} />
          <Route path="/profile/wishlist" element={<Wishlist />} />
          <Route path="/profile/settings" element={<Setting />} />
          <Route path="/profile/address" element={<MyAddress />} />

          {/* Product Detail Page */}
          <Route path="/listings/list" element={<List />} />
          <Route path="/product-detail" element={<Detail />} />

          {/* Shopping Cart */}
          <Route path="/cart" element={<ShoppingCart/>} />

          {/* Category */}
          <Route path="/categories" element={<CategoryList />} />

          {/* Content */}
          <Route path="/content" element={<PageContent/>} />


        </Routes>

        {/* Footer component */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
