import React from 'react';
import { Outlet } from 'react-router-dom';
import PrivateHeader from '../components/PrivateHeader';

const PrivateLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PrivateHeader />
      <main> {/* Add padding to account for fixed header */}
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;