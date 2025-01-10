"use client";
import React, { useState, useEffect } from "react";
import OfficialsForm from "./officialForm";
import VendorForm from "./vendorForm";
import DocumentForm from "./documentForm";

const STORAGE_KEYS = {
  CURRENT_STEP: "currentStep",
};

export default function BuatDokumen() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep.toString());
  }, [currentStep]);


  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">Buat Dokumen</h1>
      {currentStep === 1 && (
        <VendorForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
      )}
      {currentStep === 2 && (
        <OfficialsForm
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}
      {/* {currentStep === 3 && renderDocumentsForm()} */}
      {currentStep === 3 && (
        <DocumentForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
      )}
    </div>
  );
}
