import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, IndianRupee, Leaf, Sparkles, CheckCircle, Package } from 'lucide-react';
import { getCurrentUser } from '../services/authService';

/**
 * HomePage Component:
 * Recreates Screen 1 (Landing Page) from the UI reference image.
 */
export default function HomePage({ onOpenAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleAuth = () => setUser(getCurrentUser());
    window.addEventListener('authChange', handleAuth);
    return () => window.removeEventListener('authChange', handleAuth);
  }, []);

  const handleStart = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      else navigate('/plan');
    } else {
      navigate('/plan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">

      {/* Hero Section */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-left">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                <span>Smart Packaging for a Better Tomorrow</span>
              </div>

              {/* Title matching reference image */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Find the right <br />
                packaging for <br />
                <span className="text-green-600">your product.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                We help businesses choose, customize and get quotes for the best packaging solutions.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-700 font-medium text-base px-6 py-3.5 rounded-xl border border-gray-200 shadow-xs transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Column: Hero Graphic matching reference image */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Soft circular background backdrop */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-green-100/60 blur-2xl -z-10" />

              {/* Cardboard Boxes Composition */}
              <div className="relative w-full max-w-md p-4 flex items-center justify-center">
                <div className="relative">
                  {/* Decorative plant element behind box */}
                  <div className="absolute -top-6 -right-6 text-green-700/80 -z-0">
                    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50 10 C60 40 90 50 90 80 C80 90 50 80 50 60 C50 80 20 90 10 80 C10 50 40 40 50 10 Z" opacity="0.3" />
                    </svg>
                  </div>

                  {/* 3D Stacked Cardboard Boxes Graphic */}
                  <svg
                    className="w-72 h-72 sm:w-88 sm:h-88 drop-shadow-2xl"
                    viewBox="0 0 280 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background Big Box */}
                    <g transform="translate(80, 20)">
                      <polygon points="10,50 60,80 60,130 10,100" fill="#B7783C" />
                      <polygon points="60,80 110,50 110,100 60,130" fill="#9C622B" />
                      <polygon points="60,20 110,50 60,80 10,50" fill="#D3904E" />
                      <line x1="60" y1="20" x2="60" y2="80" stroke="#875323" strokeWidth="1.5" strokeDasharray="3 2" />
                    </g>

                    {/* Foreground Medium Box */}
                    <g transform="translate(20, 60)">
                      <polygon points="15,65 80,105 80,170 15,130" fill="#C28445" />
                      <polygon points="80,105 145,65 145,130 80,170" fill="#A86F38" />
                      <polygon points="80,25 145,65 80,105 15,65" fill="#DE9B52" />
                      <line x1="80" y1="25" x2="80" y2="105" stroke="#925F30" strokeWidth="2" strokeDasharray="4 2" />
                    </g>

                    {/* Foreground Small Box */}
                    <g transform="translate(140, 95)">
                      <polygon points="10,45 55,70 55,115 10,90" fill="#C28445" />
                      <polygon points="55,70 100,45 100,90 55,115" fill="#A86F38" />
                      <polygon points="55,20 100,45 55,70 10,45" fill="#DE9B52" />
                      <line x1="55" y1="20" x2="55" y2="70" stroke="#925F30" strokeWidth="1.5" strokeDasharray="3 2" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Feature Highlights matching bottom of Screen 1 */}
      <section className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Feature 1: Durable Packaging */}
            <div className="flex flex-col items-center text-center p-4 group">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Durable Packaging</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Engineered strength with 3-ply and 5-ply corrugated structures tailored for transport.
              </p>
            </div>

            {/* Feature 2: Cost Effective (₹) */}
            <div className="flex flex-col items-center text-center p-4 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition-transform">
                <IndianRupee className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Cost Effective</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Transparent rule-based pricing in INR with volume discount brackets for small businesses.
              </p>
            </div>

            {/* Feature 3: Eco Friendly */}
            <div className="flex flex-col items-center text-center p-4 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Eco Friendly</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                100% recyclable Kraft materials and biodegradable paper options for sustainability.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How PackMaster Pro Works</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            From dimensions to quotation in under 60 seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-left">
              <div className="w-8 h-8 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Select Type</h3>
              <p className="text-xs text-gray-500 mt-1">Choose corrugated boxes, paper bags, or rolls.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-left">
              <div className="w-8 h-8 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Enter Dimensions</h3>
              <p className="text-xs text-gray-500 mt-1">Provide length, width, height, and target quantity.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-left">
              <div className="w-8 h-8 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">AI Recommendation</h3>
              <p className="text-xs text-gray-500 mt-1">AI analyzes product fragility and advises specs.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-left">
              <div className="w-8 h-8 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Instant Quotation</h3>
              <p className="text-xs text-gray-500 mt-1">Get transparent pricing in INR (₹) and save your plan.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
