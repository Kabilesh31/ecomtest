"use client";
import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number; // 1, 2, or 3
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Cart" },
    { id: 2, label: "Checkout" },
    { id: 3, label: "Order Success" },
  ];

  return (
    <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto mt-10 mb-6">
      {/* Background line */}
      <div className="absolute top-1/2 left-0 w-full h-[4px] bg-gray-200 rounded-full -translate-y-1/2" />

      {/* Filled line (animated) */}
      <motion.div
        className="absolute top-1/2 left-0 h-[4px] bg-green-600 rounded-full -translate-y-1/2"
        initial={{ width: 0 }}
        animate={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Steps */}
      {steps.map((step) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        // ✅ Show tick if step is completed OR if it's the last active step (Order Success)
        const showTick = isCompleted || (isActive && step.id === steps.length);

        return (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Circle */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300
                ${
                  showTick
                    ? "bg-green-600 border-green-600 text-white"
                    : isActive
                    ? "border-green-600 text-green-600 bg-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
            >
              {showTick ? <Check size={20} /> : step.id}
            </div>
            {/* Label */}
            <span
              className={`mt-2 text-sm font-medium ${
                isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
