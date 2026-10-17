import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import PlanWizardPage from './pages/PlanWizardPage';
import QuotationPage from './pages/QuotationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import { Box } from 'lucide-react';

/**
 * App Component:
 * Pure JavaScript root application with React Router and stateful auth modal.
 */
export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-green-100 selection:text-green-800">
      
      {/* Universal Navigation Header */}
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Application Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenAuth={() => setAuthModalOpen(true)} />} />
          <Route path="/plan" element={<PlanWizardPage />} />
          <Route path="/quotation" element={<QuotationPage onOpenAuth={() => setAuthModalOpen(true)} />} />
          <Route path="/orders" element={<MyOrdersPage onOpenAuth={() => setAuthModalOpen(true)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <div className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center">
              <Box className="w-3.5 h-3.5" />
            </div>
            <span>PackMaster Pro</span>
          </div>
          <p>© {new Date().getFullYear()} PackMaster Pro — Smart Packaging Planning & Quotation Platform.</p>
          <div className="flex items-center space-x-6 text-gray-400">
            <span>Get perfect Analysis for business packaging by AI</span>
          </div>
        </div>
      </footer>

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
