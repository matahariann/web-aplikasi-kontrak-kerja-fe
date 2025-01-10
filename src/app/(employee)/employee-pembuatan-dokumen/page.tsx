"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Save, Printer, ArrowRight, ArrowLeft } from "lucide-react";
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

  const [contracts, setContracts] = useState([
    {
      nomor_kontrak: "",
      jenis_kontrak: "",
      deskripsi: "",
      jumlah_orang: "",
      durasi_kontrak: "",
      nilai_kontrak_awal: "",
      nilai_kontrak_akhir: "",
      id_vendor: "",
    },
  ]);

  const handleContractsSubmit = async () => {
    try {
      for (const contract of contracts) {
        await axios.post("/api/contracts", contract);
      }
    } catch (vendorError) {
      console.vendorError("Error saving contracts:", vendorError);
    }
  };

  const handleGenerateDoc = () => {
    // Add logic to generate and download Word document
    console.log("Generating DOC file...");
  };

  const addContract = () => {
    setContracts([
      ...contracts,
      {
        nomor_kontrak: "",
        jenis_kontrak: "",
        deskripsi: "",
        jumlah_orang: "",
        durasi_kontrak: "",
        nilai_kontrak_awal: "",
        nilai_kontrak_akhir: "",
        id_vendor: contracts[0].id_vendor,
      },
    ]);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep.toString());
  }, [currentStep]);

  const renderContractForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Data Konrak</span>
          <Button onClick={addContract} variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Kontrak
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.map((contract, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-medium mb-4">Deskripsi Kontrak {index + 1}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`jenis_kontrak_${index}`}>Jenis Kontrak</Label>
                <Input
                  id={`jenis_kontrak_${index}`}
                  value={contract.jenis_kontrak}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      jenis_kontrak: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`Deskripsi_${index}`}>Deskripsi</Label>
                <Input
                  id={`deskripsi_${index}`}
                  value={contract.deskripsi}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      deskripsi: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`jumlah_orang_${index}`}>Jumlah Orang</Label>
                <Input
                  id={`jumlah_orang_${index}`}
                  value={contract.jumlah_orang}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      jumlah_orang: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`durasi_kontrak_${index}`}>
                  Durasi Kontrak
                </Label>
                <Input
                  id={`durasi_kontrak_${index}`}
                  value={contract.durasi_kontrak}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      durasi_kontrak: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`nilai_kontrak_awal_${index}`}>
                  Harga Sebelum Negosiasi
                </Label>
                <Input
                  id={`nilai_kontrak_awal_${index}`}
                  value={contract.nilai_kontrak_awal}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      nilai_kontrak_awal: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`nilai_kontrak_akhir_${index}`}>
                  Harga Setelah Negosiasi
                </Label>
                <Input
                  id={`nilai_kontrak_akhir_${index}`}
                  value={contract.nilai_kontrak_akhir}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      nilai_kontrak_akhir: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-6">
          <div className="flex space-x-4">
            <Button onClick={handleContractsSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
            <Button onClick={handleGenerateDoc}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
          </div>
          <div>
            <Button onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sebelumnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
      {currentStep === 4 && renderContractForm()}
    </div>
  );
}
