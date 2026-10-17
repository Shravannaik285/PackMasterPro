import React from 'react';
import { Check } from 'lucide-react';

/**
 * Stepper Component:
 * Recreates the exact 4-step progress bar from the UI reference image.
 * Steps:
 * 1. Packaging Type
 * 2. Product Details
 * 3. Requirements
 * 4. Recommendation
 */
export default function Stepper({ currentStep = 1, onStepClick }) {
  const steps = [
    { number: 1, label: 'Packaging Type' },
    { number: 2, label: 'Product Details' },
    { number: 3, label: 'Requirements' },
    { number: 4, label: 'Recommendation' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
      <div className="flex items-center justify-between relative">
        
        {/* Background Connecting Line */}
        <div className="absolute left-6 right-6 top-4 sm:top-5 h-0.5 bg-gray-200 -z-0" />

        {/* Dynamic Progress Fill Line */}
        <div
          className="absolute left-6 top-4 sm:top-5 h-0.5 bg-green-600 transition-all duration-300 -z-0"
          style={{
            width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 92}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div
              key={step.number}
              onClick={() => onStepClick && onStepClick(step.number)}
              className={`flex flex-col items-center z-10 ${
                onStepClick && step.number < currentStep ? 'cursor-pointer' : ''
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-green-600 text-white shadow-md ring-4 ring-green-100 scale-105'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : step.number}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-[11px] sm:text-xs font-medium text-center transition-colors ${
                  isActive
                    ? 'text-green-700 font-semibold'
                    : isCompleted
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
