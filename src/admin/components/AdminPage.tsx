import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import Slidebar from './header/Sidebar';

const AdminPage = () => {
  return (
    <div className="wrapper d-flex">
      <Slidebar />
      <div className="flex-grow-1" >
        {/* <Header /> */}
        <div className="content-wrapper p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
