import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { User as UserIcon, Package, LogOut, CreditCard, MapPin } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { SavedAddressList } from '../components/SavedAddressList';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    age: user?.age || '',
    gender: user?.gender || '',
    dob: user?.dob || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const location = useLocation();
  const fromSignup = (location.state as any)?.fromSignup;

  useEffect(() => {
    api
      .get('/orders/my-orders')
      .then(res => {
        const orders = res.data as Order[];
        setRecentOrders(orders.slice(0, 3));
      })
      .catch(() => {
        setRecentOrders([]);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, []);

  if (!user) return <Navigate to="/login" />;

  const handleProfileChange = (field: 'age' | 'gender' | 'dob', value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async () => {
    if (!user) return;
    if (!db) {
      setProfileError('Profile update is not available right now.');
      return;
    }
    setSavingProfile(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      const ref = doc(db, 'users', user.id);
      await updateDoc(ref, {
        age: profileForm.age || null,
        gender: profileForm.gender || null,
        dob: profileForm.dob || null
      });
      setProfileMessage('Account details updated.');
      setEditingProfile(false);
    } catch (e) {
      setProfileError('Could not update account details. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold">My Account</h1>
        <Button variant="outline" onClick={logout} className="flex gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      {fromSignup && (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Welcome to OptiStyle!</p>
          <p className="mt-1">
            We&apos;ve emailed you a welcome message. If you don&apos;t see it in your inbox,
            please check your Spam or Promotions folder and mark it as <span className="font-semibold">Not spam</span>.
            Adding <span className="font-mono text-xs align-middle">optistyle.india@gmail.com</span> to your contacts
            helps you never miss order updates.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center text-brand-600">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/orders" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-slate-700">
              <Package className="w-5 h-5" /> My Orders
            </Link>
            <button
              type="button"
              onClick={() => setShowAccountDetails(!showAccountDetails)}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-slate-700"
            >
              <UserIcon className="w-5 h-5" /> Account details
            </button>
            {user.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-brand-600 font-medium">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          {showAccountDetails && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-brand-600" />
                Account details
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    Saved addresses
                  </div>
                  <SavedAddressList
                    userId={user.id}
                    selectedId={undefined}
                    onSelect={() => {}}
                    onAddNew={() => {}}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Addresses added at checkout will appear here.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-brand-600" />
                        <div className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                          Profile info
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (editingProfile) {
                            setProfileForm({
                              age: user.age || '',
                              gender: user.gender || '',
                              dob: user.dob || ''
                            });
                          }
                          setEditingProfile(!editingProfile);
                          setProfileError(null);
                          setProfileMessage(null);
                        }}
                      >
                        {editingProfile ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                    {profileError && (
                      <p className="text-xs text-red-600 mb-2">{profileError}</p>
                    )}
                    {profileMessage && (
                      <p className="text-xs text-green-600 mb-2">{profileMessage}</p>
                    )}
                    {editingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={profileForm.age}
                            onChange={e => handleProfileChange('age', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                            Gender
                          </label>
                          <select
                            value={profileForm.gender}
                            onChange={e => handleProfileChange('gender', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={profileForm.dob}
                            onChange={e => handleProfileChange('dob', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={handleProfileSave}
                            loading={savingProfile}
                            className="px-5"
                          >
                            Save changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <dl className="space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Age</dt>
                          <dd className="font-medium">{profileForm.age || 'Not set'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Gender</dt>
                          <dd className="font-medium">{profileForm.gender || 'Not set'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Date of Birth</dt>
                          <dd className="font-medium">{profileForm.dob || 'Not set'}</dd>
                        </div>
                      </dl>
                    )}
                  </div>

                  <div className="border border-dashed border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-brand-600" />
                      <div className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                        Payment methods
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      Your payments are securely processed via Razorpay. We do not store full card details in your OptiStyle account yet.
                    </p>
                    <p className="text-xs text-slate-400 mt-3">
                      Saved payment methods and UPI IDs will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
            {loadingOrders ? (
              <p className="text-slate-500">Loading recent orders...</p>
            ) : recentOrders.length === 0 ? (
              <>
                <p className="text-slate-500">No recent orders found.</p>
                <div className="mt-6">
                  <Link to="/shop">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border border-slate-100 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-full">
                        <Package className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-slate-500">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        ₹{order.total}
                      </p>
                      <p className="text-xs text-brand-600 mt-1">View details</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link to="/orders">
                    <Button variant="outline" size="sm">
                      View all orders
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
