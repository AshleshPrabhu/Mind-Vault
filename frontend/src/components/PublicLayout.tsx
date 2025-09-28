import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 lg:pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;