import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ArtisanProductManager from '../components/ArtisanProductManager';
import ArtisanProfileManager from '../components/ArtisanProfileManager';
import BackButton from '../components/BackButton';
import ActivityFeed from '../components/ActivityFeed';

const ProfilePage: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <BackButton />
      <div className="max-w-7xl mx-auto bg-surface p-8 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8">
            <div className="flex flex-wrap items-center gap-6">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-secondary">My Profile</h1>
                    <p className="text-text-secondary mt-1">Welcome, {user.displayName || user.email}</p>
                </div>
                {user.role === 'artisan' && (
                    <Link to="/artisan-dashboard">
                        <Button variant="secondary">Artisan Dashboard</Button>
                    </Link>
                )}
            </div>
            <Button onClick={handleLogout} variant="outline" className="mt-4 md:mt-0 flex-shrink-0">
              Logout
            </Button>
        </div>
        
        {user.role === 'artisan' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
                <ArtisanProfileManager artisanId={user.uid} />
            </div>
            <div className="lg:col-span-5">
                <ArtisanProductManager artisanId={user.uid} />
            </div>
             <div className="lg:col-span-3">
                <ActivityFeed artisanId={user.uid} />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-heading font-bold text-secondary mb-4">My Orders</h2>
            <div className="border rounded-lg p-6 text-center text-text-secondary">
                <p>You have no recent orders.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;