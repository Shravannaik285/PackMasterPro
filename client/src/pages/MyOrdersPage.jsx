import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Package, Plus, Clock, CheckCircle2, Box, Calendar, IndianRupee, X } from 'lucide-react';
import { getMyOrders, deletePlan } from '../services/planService';
import { getCurrentUser } from '../services/authService';

export default function MyOrdersPage({ onOpenAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleAuth = () => setUser(getCurrentUser());
    window.addEventListener('authChange', handleAuth);
    return () => window.removeEventListener('authChange', handleAuth);
  }, []);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getMyOrders();
      if (res && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn('Could not load orders from server:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleDeleteOrder = async (orderId) => {
    if (!orderId) return;
    setDeleting(true);
    try {
      await deletePlan(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to delete packaging plan:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getPackagingSvg = (type) => {
    if (type?.includes('Bag')) {
      return (
        <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
          <path d="M40 30 C40 15, 60 15, 60 30" stroke="#92400E" strokeWidth="3" fill="none" />
          <path d="M25 30 L75 30 L80 90 L20 90 Z" fill="#D97706" />
          <path d="M25 30 L30 90 L20 90 Z" fill="#B45309" />
        </svg>
      );
    }
    if (type?.includes('Label')) {
      return (
        <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="50" rx="35" ry="22" fill="#E2E8F0" />
          <ellipse cx="50" cy="50" rx="18" ry="11" fill="#94A3B8" />
          <path d="M15 50 C15 65 30 75 50 75 C70 75 85 65 85 50 L85 65 C85 80 70 90 50 90 C30 90 15 80 15 65 Z" fill="#CBD5E1" />
          <path d="M65 60 L85 70 L85 80 L65 70 Z" fill="#22C55E" />
        </svg>
      );
    }
    // Corrugated box
    return (
      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
        <polygon points="15,40 50,60 50,90 15,70" fill="#C28445" />
        <polygon points="50,60 85,40 85,70 50,90" fill="#A86F38" />
        <polygon points="50,20 85,40 50,60 15,40" fill="#DE9B52" />
      </svg>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '12 Aug 2026';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '12 Aug 2026';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header matching Screen 6 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and track your packaging requests.
            </p>
          </div>

          <Link
            to="/plan"
            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </div>

        {/* Orders List matching Screen 6 */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">
                {!user ? 'Sign in to view your orders' : 'No packaging orders yet'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-6">
                {!user
                  ? 'Sign in with your Google account to access and track all your saved packaging plans.'
                  : 'Start by configuring dimensions and requirements for your first product.'}
              </p>
              {!user ? (
                <button
                  onClick={() => onOpenAuth && onOpenAuth()}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Sign In with Google
                </button>
              ) : (
                <Link
                  to="/plan"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Create Packaging Plan
                </Link>
              )}
            </div>
          ) : (
            orders.map((order) => {
              const isProcessing = order.status === 'Processing';
              return (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white hover:bg-gray-50/80 rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0 border border-gray-100">
                      {getPackagingSvg(order.packagingType)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {order.packagingType} ({order.dimensions?.length > 25 ? 'Large' : 'Medium'})
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {order.quantity} units • {order.dimensions?.length} × {order.dimensions?.width} × {order.dimensions?.height} cm
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Cost, Status Pill, Chevron */}
                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        ₹{order.pricing?.totalPrice?.toLocaleString('en-IN') || '11,000'}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isProcessing
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}
                        >
                          {order.status || 'Processing'}
                        </span>
                      </div>
                    </div>

                    <div className="text-gray-400">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
              
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-700">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedOrder.packagingType}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Product: {selectedOrder.productName} ({selectedOrder.category})
                  </p>
                </div>
              </div>

              {/* Specs Table */}
              <div className="space-y-2 text-xs sm:text-sm text-gray-600 border-t border-b border-gray-100 py-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Dimensions</span>
                  <span className="font-semibold text-gray-800">
                    {selectedOrder.dimensions?.length} × {selectedOrder.dimensions?.width} × {selectedOrder.dimensions?.height} cm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Material Grade</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.materialGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Unit Price</span>
                  <span className="font-semibold text-gray-800">₹{selectedOrder.pricing?.unitPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total Quotation</span>
                  <span className="font-extrabold text-base text-gray-900">
                    ₹{selectedOrder.pricing?.totalPrice?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-gray-500">Production Status</span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    selectedOrder.status === 'Processing'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  disabled={deleting}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Plan'}
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
