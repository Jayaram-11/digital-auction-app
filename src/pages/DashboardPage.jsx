// src/pages/DashboardPage.jsx

import React from 'react';
import { Outlet } from 'react-router-dom'; 

// ❌ The <ModuleNav /> is GONE from this file.
// import ModuleNav from '../components/ModuleNav';

const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      {/* This is JUST the container for the content.
        The navigation menu now lives in App.jsx.
        This fixes the duplicate bug.
      */}
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPage;