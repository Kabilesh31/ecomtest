"use client";
import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Cart" },
    { id: 2, label: "Checkout" },
    { id: 3, label: "Order Success" },
  ];

  return (
    <div className="relative flex items-center justify-between w-full max-w-lg sm:max-w-md md:max-w-xl mx-auto mt-8 mb-6 px-4">
      <div className="absolute top-1/2 left-5 right-14 h-[3px] bg-gray-200 rounded-full -translate-y-1/2" />

      <motion.div
        className="absolute top-1/2 h-[3px] bg-green-600 rounded-full -translate-y-1/2"
        style={{ left: "1.25rem" }}
        initial={{ width: 0 }}
       animate={{
  width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 65px)`,
}}

        transition={{ duration: 0.4 }}
      />

      {steps.map((step) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const showTick = isCompleted || (isActive && step.id === steps.length);

        return (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center"
          >
            <div
              className={`w-9 h-9 md:w-13 md:h-13 flex items-center justify-center rounded-full border-2 text-sm md:text-base transition-all duration-300
                ${
                  showTick
                    ? "bg-green-600 border-green-600 text-white"
                    : isActive
                    ? "border-green-600 text-green-600 bg-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
            >
              {showTick ? <Check size={18} /> : step.id}
            </div>

            <span
              className={`mt-2 text-xs md:text-sm font-medium ${
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
