import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles, Box, ShieldAlert, DollarSign, Award, Layers } from 'lucide-react';
import Stepper from '../components/Stepper';
import PackagingPreview from '../components/PackagingPreview';
import { getAIRecommendation } from '../services/planService';

/**
 * PlanWizardPage:
 * Multi-step wizard covering:
 * - Step 1: Packaging Type Selection (Screen 2)
 * - Step 2: Product Details & Dimensions (Screen 3)
 * - Step 3: Requirements (Protection, Cost, Eco-friendly)
 * - Step 4: AI Recommendation & 3-Way Comparison (Screen 4)
 */
export default function PlanWizardPage() {
  const navigate = useNavigate();

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingAI, setLoadingAI] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    packagingType: 'Corrugated Box',
    productName: 'Electronics Item',
    category: 'Electronics',
    dimensions: {
      length: 20,
      width: 15,
      height: 8,
    },
    quantity: 500,
    requirements: {
      protectionLevel: 'Medium',
      costPreference: 'Balanced',
      ecoFriendly: false,
      customPrint: true,
    },
  });

  // AI Recommendation State
  const [aiResult, setAiResult] = useState(null);
  const [selectedOptionType, setSelectedOptionType] = useState('Corrugated Box');

  // Packaging types catalog matching Screen 2
  const packagingTypes = [
    {
      id: 'Corrugated Box',
      name: 'Corrugated Box',
      desc: 'Durable multi-ply cartons for shipping & storage',
      svg: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
          <polygon points="15,40 50,60 50,90 15,70" fill="#C28445" />
          <polygon points="50,60 85,40 85,70 50,90" fill="#A86F38" />
          <polygon points="50,20 85,40 50,60 15,40" fill="#DE9B52" />
        </svg>
      ),
    },
    {
      id: 'Paper Bag',
      name: 'Paper Bag',
      desc: 'Eco-friendly biodegradable retail carry bags',
      svg: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
          <path d="M40 30 C40 15, 60 15, 60 30" stroke="#92400E" strokeWidth="3" fill="none" />
          <path d="M25 30 L75 30 L80 90 L20 90 Z" fill="#D97706" />
          <path d="M25 30 L30 90 L20 90 Z" fill="#B45309" />
        </svg>
      ),
    },
    {
      id: 'Plastic Packaging',
      name: 'Plastic Packaging',
      desc: 'Protective pouches, bubble wrap & poly mailers',
      svg: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
          <rect x="25" y="20" width="50" height="70" rx="8" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="35" y="10" width="30" height="10" rx="2" fill="#94A3B8" />
          <circle cx="50" cy="55" r="14" fill="#38BDF8" fillOpacity="0.4" />
        </svg>
      ),
    },
    {
      id: 'Labels',
      name: 'Labels',
      desc: 'High-adhesion shipping & brand barcode rolls',
      svg: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="50" rx="35" ry="22" fill="#E2E8F0" />
          <ellipse cx="50" cy="50" rx="18" ry="11" fill="#94A3B8" />
          <path d="M15 50 C15 65 30 75 50 75 C70 75 85 65 85 50 L85 65 C85 80 70 90 50 90 C30 90 15 80 15 65 Z" fill="#CBD5E1" />
          <path d="M65 60 L85 70 L85 80 L65 70 Z" fill="#22C55E" />
        </svg>
      ),
    },
  ];

  // Dynamic fallback generator matching user's selected packet type
  const getDefaultFallbackOptions = (selectedType) => {
    switch (selectedType) {
      case 'Paper Bag':
        return [
          {
            type: 'Paper Bag',
            tag: 'Recommended',
            materialGrade: 'Kraft Paper 180 GSM',
            description: '100% biodegradable and recyclable Kraft paper retail carry bag.',
            pros: ['Zero-plastic eco material', 'Cost effective', 'Customizable brand print'],
            recommended: true,
          },
          {
            type: 'Mailing Box',
            tag: 'Alternative',
            materialGrade: 'E-Flute Corrugated Board',
            description: 'Rigid tab-locking fold carton for enhanced unboxing presentation.',
            pros: ['Premium look', 'Added rigidity', 'Branding options'],
            recommended: false,
          },
          {
            type: 'Plastic Packaging',
            tag: 'Budget Friendly',
            materialGrade: 'Polyethylene Cushion Film',
            description: 'Waterproof protective mailer pouch for lightweight items.',
            pros: ['Moisture proof', 'Lightweight', 'Low shipping cost'],
            recommended: false,
          },
        ];
      case 'Plastic Packaging':
        return [
          {
            type: 'Plastic Packaging',
            tag: 'Recommended',
            materialGrade: 'Polyethylene Cushion Film',
            description: 'Puncture-resistant moisture-proof protective poly bubble mailers.',
            pros: ['Waterproof protection', 'Extremely lightweight', 'Lowest unit cost'],
            recommended: true,
          },
          {
            type: 'Corrugated Box',
            tag: 'Alternative',
            materialGrade: '3-Ply Standard Corrugated',
            description: 'Rigid cardboard box for heavier structural protection.',
            pros: ['High stacking strength', 'Impact resistance', 'Recyclable'],
            recommended: false,
          },
          {
            type: 'Paper Bag',
            tag: 'Eco-friendly',
            materialGrade: 'Kraft Paper 180 GSM',
            description: 'Sustainable biodegradable alternative to single-use plastics.',
            pros: ['Zero plastic', 'Rustic aesthetic', 'Biodegradable'],
            recommended: false,
          },
        ];
      case 'Labels':
        return [
          {
            type: 'Labels',
            tag: 'Recommended',
            materialGrade: 'Thermal Coated Adhesive Roll',
            description: 'High-adhesion commercial branding and shipping barcode rolls.',
            pros: ['High barcode clarity', 'Strong permanent adhesive', 'Universal branding'],
            recommended: true,
          },
          {
            type: 'Mailing Box',
            tag: 'Alternative',
            materialGrade: 'E-Flute Corrugated Board',
            description: 'Rigid packaging carton paired with custom branding labels.',
            pros: ['Full packaging set', 'Clean unboxing', 'Rigid structure'],
            recommended: false,
          },
          {
            type: 'Paper Bag',
            tag: 'Eco-friendly',
            materialGrade: 'Kraft Paper 180 GSM',
            description: 'Eco-friendly carry bag with custom brand labels applied.',
            pros: ['Sustainable presentation', 'Retail-ready', 'Recyclable'],
            recommended: false,
          },
        ];
      case 'Corrugated Box':
      default:
        return [
          {
            type: 'Corrugated Box',
            tag: 'Recommended',
            materialGrade: '5-Ply Corrugated Cardboard',
            description: 'Heavy duty multi-ply cartons engineered for structural strength and shipping.',
            pros: ['High stacking strength', 'Impact shock absorption', 'Ideal for shipping cartons'],
            recommended: true,
          },
          {
            type: 'Mailing Box',
            tag: 'Alternative',
            materialGrade: 'E-Flute Corrugated Board',
            description: 'Clean look, suitable for e-commerce unboxing.',
            pros: ['Lightweight', 'Professional look', 'Branding options'],
            recommended: false,
          },
          {
            type: 'Paper Bag',
            tag: 'Eco-friendly',
            materialGrade: 'Kraft Paper 180 GSM',
            description: 'Eco-friendly and budget friendly carry option.',
            pros: ['Sustainable option', 'Good for retail', 'Custom sizes available'],
            recommended: false,
          },
        ];
    }
  };

  // Call Express backend -> NVIDIA NIM API
  const handleFetchAIRecommendation = async () => {
    setLoadingAI(true);
    try {
      const response = await getAIRecommendation({
        productName: formData.productName,
        category: formData.category,
        dimensions: formData.dimensions,
        quantity: formData.quantity,
        userSelectedType: formData.packagingType,
        requirements: formData.requirements,
      });

      if (response && response.data) {
        setAiResult(response.data);
        setSelectedOptionType(response.data.recommendedType || formData.packagingType);
      }
    } catch (err) {
      console.warn('API recommendation fallback:', err);
      const fallbackOptions = getDefaultFallbackOptions(formData.packagingType);
      setAiResult({
        recommendedType: formData.packagingType,
        materialGrade: fallbackOptions[0].materialGrade,
        suitabilityScore: 95,
        comparisonWithUser: `Engineered specifically for your chosen ${formData.packagingType} and specifications.`,
        options: fallbackOptions,
      });
      setSelectedOptionType(formData.packagingType);
    } finally {
      setLoadingAI(false);
      setCurrentStep(4);
    }
  };

  // Proceed to Step 5 (Quotation)
  const handleProceedToQuotation = (chosenType) => {
    const finalType = chosenType || selectedOptionType || formData.packagingType;
    const material =
      aiResult?.materialGrade ||
      (finalType === 'Paper Bag'
        ? 'Kraft Paper 180 GSM'
        : finalType === 'Labels'
        ? 'Thermal Coated Adhesive Roll'
        : '5-Ply Corrugated Cardboard');

    // Save transient plan data to sessionStorage
    const planDraft = {
      ...formData,
      packagingType: finalType,
      materialGrade: material,
      aiRecommendation: aiResult,
    };
    sessionStorage.setItem('packmaster_current_plan', JSON.stringify(planDraft));
    navigate('/quotation');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-4">
          <button
            onClick={() => {
              if (currentStep > 1) setCurrentStep(currentStep - 1);
              else navigate('/');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Stepper matching reference UI */}
        <Stepper currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />

        {/* STEP 1: CHOOSE PACKAGING TYPE (Screen 2) */}
        {currentStep === 1 && (
          <div className="bg-transparent animate-in fade-in duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Choose Packaging Type
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select the type of packaging you need.
              </p>
            </div>

            {/* 2x2 Grid matching Screen 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {packagingTypes.map((type) => {
                const isSelected = formData.packagingType === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => {
                      const chosenType = type.id;
                      setSelectedOptionType(chosenType);
                      setFormData((prev) => {
                        const isDefaultName =
                          !prev.productName ||
                          prev.productName === 'Electronics Item' ||
                          prev.productName === 'Eco Kraft Paper Bag' ||
                          prev.productName === 'Poly Bubble Mailer' ||
                          prev.productName === 'Brand Barcode Labels';

                        const defaultNames = {
                          'Paper Bag': 'Eco Kraft Paper Bag',
                          'Plastic Packaging': 'Poly Bubble Mailer',
                          'Labels': 'Brand Barcode Labels',
                          'Corrugated Box': 'Electronics Item',
                        };

                        const defaultCategories = {
                          'Paper Bag': 'Apparel & Fashion',
                          'Plastic Packaging': 'Apparel & Fashion',
                          'Labels': 'Logistics & Shipping',
                          'Corrugated Box': 'Electronics',
                        };

                        return {
                          ...prev,
                          packagingType: chosenType,
                          productName: isDefaultName ? (defaultNames[chosenType] || prev.productName) : prev.productName,
                          category: isDefaultName ? (defaultCategories[chosenType] || prev.category) : prev.category,
                          requirements: {
                            ...prev.requirements,
                            ecoFriendly: chosenType === 'Paper Bag' ? true : prev.requirements.ecoFriendly,
                          },
                        };
                      });
                    }}
                    className={`relative p-6 rounded-2xl bg-white border-2 cursor-pointer transition-all duration-200 flex items-center justify-between group shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-green-600 bg-green-50/20 ring-2 ring-green-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-green-50/50 transition-colors flex-shrink-0">
                        {type.svg}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{type.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                      </div>
                    </div>

                    {/* Arrow / Check Indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
                      }`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Next Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-7 py-3 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRODUCT DETAILS & DIMENSIONS (Screen 3) */}
        {currentStep === 2 && (
          <div className="bg-transparent animate-in fade-in duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Tell us about your product
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your product details and dimensions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Form: Inputs matching Screen 3 */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Electronics Item, Ceramic Cup, Organic Cotton Shirt"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Fragile & Glassware">Fragile & Glassware</option>
                    <option value="Logistics & Shipping">Logistics & Shipping</option>
                  </select>
                </div>

                {/* Dimensions (cm) - 3 Columns */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Dimensions (cm)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Length</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.dimensions.length}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, length: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Width</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.dimensions.width}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, width: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Height</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.dimensions.height}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, height: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      step="50"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full pl-4 pr-16 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                    />
                    <span className="absolute right-4 top-2.5 text-xs font-medium text-gray-400">
                      units
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Product Preview matching Screen 3 */}
              <div className="lg:col-span-5 h-full">
                <PackagingPreview
                  packagingType={formData.packagingType}
                  dimensions={formData.dimensions}
                />
              </div>

            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                ← Back to Types
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-7 py-3 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PACKAGING REQUIREMENTS (Step 3) */}
        {currentStep === 3 && (
          <div className="bg-transparent animate-in fade-in duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Packaging Requirements
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Help our AI recommend the ideal material density and protection level.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              
              {/* Protection Level */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Protection Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Standard', 'Medium', 'High'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          requirements: { ...formData.requirements, protectionLevel: lvl },
                        })
                      }
                      className={`py-3 px-4 rounded-xl border text-sm font-medium text-center transition-all ${
                        formData.requirements.protectionLevel === lvl
                          ? 'border-green-600 bg-green-50 text-green-800 font-semibold ring-1 ring-green-600'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lvl === 'High' ? '🛡️ High (Fragile/Heavy)' : lvl === 'Medium' ? '📦 Medium (Standard Goods)' : '✉️ Standard (Lightweight)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Preference */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Cost Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Economy', 'Balanced', 'Premium'].map((cost) => (
                    <button
                      key={cost}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          requirements: { ...formData.requirements, costPreference: cost },
                        })
                      }
                      className={`py-3 px-4 rounded-xl border text-sm font-medium text-center transition-all ${
                        formData.requirements.costPreference === cost
                          ? 'border-green-600 bg-green-50 text-green-800 font-semibold ring-1 ring-green-600'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cost === 'Economy' ? '💰 Economy (Lowest cost)' : cost === 'Balanced' ? '⚖️ Balanced (Best value)' : '✨ Premium (Top finish)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.requirements.ecoFriendly}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: { ...formData.requirements, ecoFriendly: e.target.checked },
                      })
                    }
                    className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Eco-Friendly Priority</span>
                    <span className="text-xs text-gray-500">
                      Prioritize 100% biodegradable and recyclable Kraft materials.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.requirements.customPrint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: { ...formData.requirements, customPrint: e.target.checked },
                      })
                    }
                    className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Custom Brand Printing</span>
                    <span className="text-xs text-gray-500">
                      Print custom logo, SKU barcode, and branding artwork on packaging.
                    </span>
                  </div>
                </label>
              </div>

            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                ← Back to Details
              </button>
              <button
                onClick={handleFetchAIRecommendation}
                disabled={loadingAI}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loadingAI ? 'Analyzing with AI...' : 'Get AI Recommendation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: RECOMMENDED PACKAGING (Screen 4) */}
        {currentStep === 4 && (
          <div className="bg-transparent animate-in fade-in duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Recommended Packaging
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Based on your product details, here are the best options.
              </p>
            </div>

            {/* Dynamic 3-Column Comparison Grid matching AI Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {((aiResult && Array.isArray(aiResult.options) && aiResult.options.length > 0)
                ? aiResult.options
                : getDefaultFallbackOptions(formData.packagingType)
              ).map((opt, idx) => {
                const isRecommended = Boolean(opt.recommended || opt.tag === 'Recommended');
                const isSelected = selectedOptionType === opt.type;

                // Dynamic icon renderer based on packaging type
                const renderVisualIcon = () => {
                  switch (opt.type) {
                    case 'Corrugated Box':
                      return (
                        <svg className="w-20 h-20 drop-shadow-sm" viewBox="0 0 100 100" fill="none">
                          <polygon points="15,40 50,60 50,90 15,70" fill="#C28445" />
                          <polygon points="50,60 85,40 85,70 50,90" fill="#A86F38" />
                          <polygon points="50,20 85,40 50,60 15,40" fill="#DE9B52" />
                        </svg>
                      );
                    case 'Paper Bag':
                      return (
                        <svg className="w-20 h-20 drop-shadow-sm" viewBox="0 0 100 100" fill="none">
                          <path d="M40 30 C40 15, 60 15, 60 30" stroke="#92400E" strokeWidth="3" fill="none" />
                          <path d="M25 30 L75 30 L80 90 L20 90 Z" fill="#D97706" />
                          <path d="M25 30 L30 90 L20 90 Z" fill="#B45309" />
                        </svg>
                      );
                    case 'Plastic Packaging':
                      return (
                        <svg className="w-20 h-20 drop-shadow-sm" viewBox="0 0 100 100" fill="none">
                          <rect x="25" y="20" width="50" height="70" rx="8" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                          <rect x="35" y="10" width="30" height="10" rx="2" fill="#94A3B8" />
                          <circle cx="50" cy="55" r="14" fill="#38BDF8" fillOpacity="0.4" />
                        </svg>
                      );
                    case 'Labels':
                      return (
                        <svg className="w-20 h-20 drop-shadow-sm" viewBox="0 0 100 100" fill="none">
                          <ellipse cx="50" cy="50" rx="35" ry="22" fill="#E2E8F0" />
                          <ellipse cx="50" cy="50" rx="18" ry="11" fill="#94A3B8" />
                          <path d="M15 50 C15 65 30 75 50 75 C70 75 85 65 85 50 L85 65 C85 80 70 90 50 90 C30 90 15 80 15 65 Z" fill="#CBD5E1" />
                          <path d="M65 60 L85 70 L85 80 L65 70 Z" fill="#22C55E" />
                        </svg>
                      );
                    case 'Mailing Box':
                    default:
                      return (
                        <svg className="w-20 h-20 drop-shadow-sm" viewBox="0 0 100 100" fill="none">
                          <polygon points="15,40 50,60 50,90 15,70" fill="#CBD5E1" />
                          <polygon points="50,60 85,40 85,70 50,90" fill="#94A3B8" />
                          <polygon points="50,20 85,40 50,60 15,40" fill="#F1F5F9" />
                        </svg>
                      );
                  }
                };

                return (
                  <div
                    key={opt.type || idx}
                    className={`relative bg-white rounded-2xl p-6 border-2 flex flex-col justify-between shadow-sm transition-all duration-200 ${
                      isSelected
                        ? 'border-green-600 ring-2 ring-green-100 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Top Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isRecommended
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {opt.tag || (isRecommended ? 'Recommended' : 'Alternative')}
                      </span>
                    </div>

                    <div className="pt-6 text-center">
                      {/* Image/Visual */}
                      <div className="w-24 h-24 mx-auto my-3 flex items-center justify-center">
                        {renderVisualIcon()}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{opt.type}</h3>
                      <p className="text-xs text-gray-500 mt-1 mb-2 h-10 line-clamp-2">
                        {opt.description || 'Optimized packaging engineered for your specifications.'}
                      </p>

                      {/* Material grade badge */}
                      {opt.materialGrade && (
                        <div className="mb-4 text-[11px] font-medium text-green-700 bg-green-50 py-0.5 px-2 rounded-md inline-block">
                          {opt.materialGrade}
                        </div>
                      )}

                      {/* Checklist */}
                      <div className="space-y-2 text-left border-t border-gray-100 pt-4 mb-6 text-xs text-gray-600">
                        {(opt.pros || ['Good protection', 'Cost effective', 'Customizable print']).map((pro, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600 stroke-[3] flex-shrink-0" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => {
                        setSelectedOptionType(opt.type);
                        handleProceedToQuotation(opt.type);
                      }}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isSelected
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Select
                    </button>
                  </div>
                );
              })}
            </div>

            {/* AI Reasoning Summary Banner */}
            {aiResult && aiResult.comparisonWithUser && (
              <div className="mt-8 p-4 bg-green-50/70 border border-green-200 rounded-xl text-xs sm:text-sm text-green-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">AI Packaging Engineering Analysis:</span>
                  <span>{aiResult.comparisonWithUser}</span>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                ← Back to Requirements
              </button>
              <button
                onClick={() => handleProceedToQuotation(selectedOptionType)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-7 py-3 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <span>Continue with Selected</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
