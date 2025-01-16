"use client";
import React, { useState, useEffect } from "react";
import OfficialsForm from "@/components/form/OfficialForm";
import VendorForm from "@/components/form/VendorForm";
import DocumentForm from "@/components/form/DocumentForm";
import ContractsForm from "@/components/form/ContractForm";
import {
  Check,
  Store,
  Users,
  FileText,
  FileSpreadsheet,
  FilePlus2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEYS = {
  CURRENT_STEP: "currentStep",
};

const steps = [
  {
    id: 1,
    name: "Data Vendor",
    icon: Store,
    description: "Informasi mengenai vendor",
  },
  {
    id: 2,
    name: "Data Pejabat",
    icon: Users,
    description: "Informasi mengenai pejabat",
  },
  {
    id: 3,
    name: "Data Dokumen",
    icon: FileText,
    description: "Informasi mengenai dokumen kontrak",
  },
  {
    id: 4,
    name: "Data Kontrak",
    icon: FileSpreadsheet,
    description: "Informasi mengenai rincian kontrak",
  },
];

export default function BuatDokumen() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep.toString());
  }, [currentStep]);

  return (
    <main className="bg-gray-50">
      <div className="max-w-[2000px] mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <FilePlus2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Buat Dokumen</h1>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Langkah {currentStep} dari {steps.length}
          </div>
        </header>

        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol
            role="list"
            className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
          >
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative md:flex md:flex-1">
                {step.id < currentStep ? (
                  <div className="group flex w-full items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                        <Check className="h-6 w-6 text-white" />
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {step.name}
                      </span>
                    </span>
                  </div>
                ) : step.id === currentStep ? (
                  <div
                    className="flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-blue-600">
                      <step.icon className="h-6 w-6 text-blue-600" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-blue-600">
                      {step.name}
                    </span>
                  </div>
                ) : (
                  <div className="group flex items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                        <step.icon className="h-6 w-6 text-blue-600" />
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-500">
                        {step.name}
                      </span>
                    </span>
                  </div>
                )}

                {stepIdx !== steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute right-0 top-0 hidden h-full w-5 md:block",
                      step.id < currentStep ? "bg-blue-600" : "bg-gray-300"
                    )}
                  >
                    <svg
                      className={cn(
                        "h-full w-full",
                        step.id < currentStep
                          ? "text-blue-600"
                          : "text-gray-300"
                      )}
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Form Content */}
        <div className="mt-4">
          {currentStep === 1 && (
            <VendorForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 2 && (
            <OfficialsForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 3 && (
            <DocumentForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 4 && (
            <ContractsForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          )}
        </div>

        {/* Description */}
        <div className="mt-4 text-sm text-gray-500">
          {steps[currentStep - 1].description}
        </div>
      </div>
    </main>
  );
}
