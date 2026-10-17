import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sliders, Send, IndianRupee, Sparkles, AlertCircle } from 'lucide-react';
import CustomizeModal from '../components/CustomizeModal';
import { calculateQuotation, savePackagingPlan } from '../services/planService';
import { calculateLocalPrice } from '../utils/pricing';
import { getCurrentUser } from '../services/authService';

/**
 * QuotationPage:
 * Recreates Screen 5 ("Your Packaging Plan / Quotation Summary") from the UI reference image.
 */
export default function QuotationPage({ onOpenAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleAuth = () => setUser(getCurrentUser());
    window.addEventListener('authChange', handleAuth);
    return () => window.removeEventListener('authChange', handleAuth);
  }, []);
  const [quoteData, setQuoteData] = useState({
    unitPrice: 22.0,
    totalPrice: 11000,
  });

  // Load drafted plan from sessionStorage or use default matching reference image
  const [plan, setPlan] = useState(() => {
    try {
      const stored = sessionStorage.getItem('packmaster_current_plan');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return {
      productName: 'Electronics Item',
      category: 'Electronics',
      packagingType: 'Corrugated Box',
      materialGrade: '5-Ply Corrugated Cardboard',
      dimensions: { length: 20, width: 15, height: 8 },
      quantity: 500,
      requirements: {
        protectionLevel: 'Medium',
        costPreference: 'Balanced',
        ecoFriendly: false,
        customPrint: true,
      },
      aiRecommendation: {
        recommendedType: 'Corrugated Box',
        reasoning: [
          'Suitable for your dimensions',
          'Good product protection',
          'Cost effective',
          'Can be customized',
        ],
      },
    };
  });

  // Calculate pricing whenever specs change
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await calculateQuotation({
          packagingType: plan.packagingType,
          dimensions: plan.dimensions,
          quantity: plan.quantity,
          materialGrade: plan.materialGrade,
          requirements: plan.requirements,
        });
        if (res && res.data) {
          setQuoteData(res.data);
          return;
        }
      } catch {
        // Local calculation fallback
      }
      const local = calculateLocalPrice(plan);
      setQuoteData(local);
    };

    fetchQuote();
  }, [plan]);

  const [error, setError] = useState(null);

  // Handle customization updates from modal
  const handleApplyCustomization = (updatedSpecs) => {
    const updated = {
      ...plan,
      ...updatedSpecs,
    };
    setPlan(updated);
    sessionStorage.setItem('packmaster_current_plan', JSON.stringify(updated));
  };

  // Save Plan / Request Quotation to MongoDB
  const handleSavePlan = async () => {
    if (!user) {
      if (onOpenAuth) {
        onOpenAuth();
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      await savePackagingPlan({
        productName: plan.productName,
        category: plan.category,
        dimensions: plan.dimensions,
        quantity: plan.quantity,
        packagingType: plan.packagingType,
        materialGrade: plan.materialGrade,
        requirements: plan.requirements,
        aiRecommendation: plan.aiRecommendation,
        pricing: quoteData,
      });
      // Clear draft and navigate to orders
      sessionStorage.removeItem('packmaster_current_plan');
      navigate('/orders');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save packaging plan';
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/plan')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Wizard</span>
          </button>
        </div>

        {/* Header matching Screen 5 */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Your Packaging Plan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here is the summary of your selected packaging.
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xs font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Card Layout matching Screen 5 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: 3D Box Illustration */}
            <div className="lg:col-span-4 flex items-center justify-center p-4 bg-gray-50/60 rounded-xl border border-gray-100">
              <svg className="w-48 h-48 drop-shadow-md" viewBox="0 0 200 200" fill="none">
                <polygon points="25,75 100,120 100,185 25,140" fill="#C28445" />
                <polygon points="100,120 175,75 175,140 100,185" fill="#A86F38" />
                <polygon points="100,30 175,75 100,120 25,75" fill="#DE9B52" />
                <line x1="100" y1="30" x2="100" y2="120" stroke="#B87739" strokeWidth="2" strokeDasharray="4 2" />
                <line x1="25" y1="75" x2="175" y2="75" stroke="#B87739" strokeWidth="1.5" />
                <line x1="100" y1="120" x2="100" y2="185" stroke="#925F30" strokeWidth="2" />
              </svg>
            </div>

            {/* Middle: Specifications Table matching Screen 5 */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {plan.packagingType} ({plan.dimensions?.length > 25 ? 'Large' : 'Medium'})
                </h3>
                <p className="text-xs text-gray-500 font-medium">For {plan.productName}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Dimensions</span>
                  <span className="font-semibold text-gray-800">
                    {plan.dimensions?.length} × {plan.dimensions?.width} × {plan.dimensions?.height} cm
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Material</span>
                  <span className="font-semibold text-gray-800">{plan.materialGrade}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Quantity</span>
                  <span className="font-semibold text-gray-800">{plan.quantity} units</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Estimated Price</span>
                  <span className="font-semibold text-gray-800">
                    ₹{quoteData.unitPrice?.toFixed(2)} per unit
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3">
                  <span className="font-bold text-gray-900 text-sm">Estimated Total</span>
                  <span className="font-extrabold text-2xl text-gray-900">
                    ₹{quoteData.totalPrice?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: "Why this option?" Card matching Screen 5 */}
            <div className="lg:col-span-3 bg-gray-50/80 rounded-xl p-5 border border-gray-100 h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Why this option?
                </h4>
                <div className="space-y-2.5 text-xs text-gray-700">
                  {(plan.aiRecommendation?.reasoning || [
                    'Suitable for your dimensions',
                    'Good product protection',
                    'Cost effective',
                    'Can be customized',
                  ]).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 stroke-[3] mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/60">
                <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium">
                  <Sparkles className="w-3 h-3 text-green-600" />
                  NVIDIA NIM AI Verified
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Actions matching Screen 5 */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => setCustomizeOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 shadow-xs transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Customize</span>
          </button>

          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? 'Saving Plan...' : 'Request Quotation'}</span>
          </button>
        </div>

      </div>

      {/* Customize Modal */}
      <CustomizeModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        initialData={plan}
        onApplyChanges={handleApplyCustomization}
      />
    </div>
  );
}
