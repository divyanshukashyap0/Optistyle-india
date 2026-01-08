import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-slate-200">404</h1>
      <h2 className="text-3xl font-serif font-bold text-slate-900 mt-4 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <Link to="/">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  );
};