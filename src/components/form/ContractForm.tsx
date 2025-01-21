"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, Pencil, Plus, Minus } from "lucide-react";
import {
  ContractData,
  getContractData,
  addContract,
  updateContract,
  deleteContract,
} from "@/services/contract";
import { PrintContract } from "@/components/GenerateDocx";
import { getVendorData, VendorData } from "@/services/vendor";
import { getOfficialData, OfficialData } from "@/services/official";
import { DocumentData, getDocumentData } from "@/services/documents";

enum ContractType {
  KONSULTAN = "Konsultan",
  BARANG = "Barang",
  KONSTRUKSI = "Konstruksi",
  JASA_LAINNYA = "Jasa Lainnya",
}

const MAX_PRICE = {
  [ContractType.KONSULTAN]: 100000000, // 100 juta
  [ContractType.BARANG]: 200000000, // 200 juta
  [ContractType.KONSTRUKSI]: 200000000, // 200 juta
  [ContractType.JASA_LAINNYA]: 200000000, // 200 juta
};

const INITIAL_CONTRACT: Omit<ContractData, "jenis_kontrak"> = {
  deskripsi: "",
  jumlah_orang: 0,
  durasi_kontrak: 0,
  nilai_perkiraan_sendiri: 0,
  nilai_kontral_awal: 0,
  nilai_kontrak_akhir: 0,
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ContractsForm = ({ currentStep, setCurrentStep }) => {
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertType, setAlertType] = useState<"save" | "edit" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [contractType, setContractType] = useState<ContractType>(
    ContractType.KONSULTAN
  );
  const [contractsData, setContractsData] = useState<
    Omit<ContractData, "jenis_kontrak">[]
  >([INITIAL_CONTRACT]);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [vendorData, setVendorData] = useState<VendorData[]>([]);
  const [officialData, setOfficialData] = useState<OfficialData[]>([]);
  const [showDownloadSuccessAlert, setShowDownloadSuccessAlert] =
    useState(false);

  const TotalValues = ({ contracts }) => {
    const { estimatedTotal, initialTotal, finalTotal } =
      calculateTotalValues(contracts);
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Total Nilai Kontrak</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Nilai Perkiraan:</p>
            <p className="font-medium">{formatCurrency(estimatedTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Nilai Awal:</p>
            <p className="font-medium">{formatCurrency(initialTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Nilai Akhir:</p>
            <p className="font-medium">{formatCurrency(finalTotal)}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Batas maksimal total untuk jenis kontrak {contractType}:{" "}
          {formatCurrency(MAX_PRICE[contractType])}
        </p>
      </div>
    );
  };

  const calculateTotalValues = (
    contracts: Omit<ContractData, "jenis_kontrak">[]
  ) => {
    return contracts.reduce(
      (totals, contract) => ({
        estimatedTotal:
          totals.estimatedTotal +
          contract.nilai_perkiraan_sendiri *
            contract.jumlah_orang *
            contract.durasi_kontrak,
        initialTotal:
          totals.initialTotal +
          contract.nilai_kontral_awal *
            contract.jumlah_orang *
            contract.durasi_kontrak,
        finalTotal:
          totals.finalTotal +
          contract.nilai_kontrak_akhir *
            contract.jumlah_orang *
            contract.durasi_kontrak,
      }),
      { estimatedTotal: 0, initialTotal: 0, finalTotal: 0 }
    );
  };

  const validateContractValues = (
    contracts: Omit<ContractData, "jenis_kontrak">[]
  ): string | null => {
    const maxValue = MAX_PRICE[contractType];
    const { estimatedTotal, initialTotal, finalTotal } =
      calculateTotalValues(contracts);

    if (estimatedTotal > maxValue) {
      return `Total nilai perkiraan sendiri untuk ${contractType} tidak boleh melebihi ${formatCurrency(
        maxValue
      )}`;
    }
    if (initialTotal > maxValue) {
      return `Total nilai kontrak awal untuk ${contractType} tidak boleh melebihi ${formatCurrency(
        maxValue
      )}`;
    }
    if (finalTotal > maxValue) {
      return `Total nilai kontrak akhir untuk ${contractType} tidak boleh melebihi ${formatCurrency(
        maxValue
      )}`;
    }
    return null;
  };

  const handleContractTypeChange = (value: ContractType) => {
    const validationError = validateContractValues(contractsData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setContractType(value);
    setError(null);
  };

  const addNewContract = () => {
    setContractsData([...contractsData, { ...INITIAL_CONTRACT }]);
  };

  const removeContract = async (index: number) => {
    try {
      const contractToRemove = contractsData[index];

      if (contractsData.length <= 1) {
        setError("Harus ada minimal satu kontrak");
        return;
      }

      if (contractToRemove.id) {
        // Kontrak sudah ada di database
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        // Delete from database
        await deleteContract(token, String(contractToRemove.id));
      }

      // Update local state
      const newContractsData = contractsData.filter((_, i) => i !== index);
      setContractsData(newContractsData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus kontrak"
      );
    }
  };

  const handleInputChange = (
    index: number,
    field: keyof Omit<ContractData, "jenis_kontrak">,
    value: string | number
  ) => {
    const newContractsData = [...contractsData];
    newContractsData[index] = {
      ...newContractsData[index],
      [field]: value,
    };

    if (
      field === "nilai_perkiraan_sendiri" ||
      field === "nilai_kontral_awal" ||
      field === "nilai_kontrak_akhir"
    ) {
      const validationError = validateContractValues(newContractsData);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setContractsData(newContractsData);
    setError(null);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Validate required fields and numeric values
      const hasEmptyFields = contractsData.some(
        (contract) =>
          !contract.deskripsi ||
          contract.jumlah_orang <= 0 ||
          contract.durasi_kontrak <= 0 ||
          contract.nilai_kontral_awal <= 0 ||
          contract.nilai_kontrak_akhir <= 0
      );

      if (hasEmptyFields) {
        setError("Mohon lengkapi semua input dengan nilai yang valid");
        return;
      }

      // Validate total contract values
      const validationError = validateContractValues(contractsData);
      if (validationError) {
        setError(validationError);
        return;
      }

      const contractsWithType = contractsData.map((contract) => ({
        ...contract,
        jenis_kontrak: contractType,
        // Pastikan id adalah string atau tidak ada
        ...(contract.id ? { id: String(contract.id) } : {}),
      }));

      if (isEditMode) {
        // Get the ID of the first contract for the update endpoint
        const firstContract = contractsData.find((c) => c.id);
        if (!firstContract?.id) {
          throw new Error("Invalid contract ID");
        }

        // Update existing contracts and add new ones
        const response = await updateContract(
          token,
          String(firstContract.id),
          contractsWithType
        );

        if (response.data.contracts) {
          setContractsData(response.data.contracts);
        }
      } else {
        // Add new contracts
        for (const contract of contractsWithType) {
          await addContract(token, contract);
        }
      }

      setIsSaved(true);
      setIsEditMode(false);
      setShowSuccessAlert(true);
      setAlertType(isEditMode ? "edit" : "save");

      setTimeout(() => {
        setShowSuccessAlert(false);
        setAlertType(null);
      }, 3000);
    } catch (error) {
      setShowSuccessAlert(false);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setIsSaved(false);
  };

  const handleDownloadSuccess = () => {
    setShowDownloadSuccessAlert(true);
    setTimeout(() => {
      setShowDownloadSuccessAlert(false);
    }, 3000);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch document data
        const docResponse = await getDocumentData();
        if (docResponse.data.document) {
          setDocumentData(docResponse.data.document);
        } else if (docResponse.data.session?.temp_data?.document) {
          setDocumentData(docResponse.data.session.temp_data.document);
        }

        // Fetch official data
        const officialResponse = await getOfficialData();
        if (officialResponse.data.officials) {
          setOfficialData(officialResponse.data.officials);
        } else if (officialResponse.data.session?.temp_data?.officials) {
          setOfficialData(officialResponse.data.session.temp_data.officials);
        }

        // Fetch vendor data
        const vendorResponse = await getVendorData();
        if (
          vendorResponse.data.vendors &&
          vendorResponse.data.vendors.length > 0
        ) {
          setVendorData(vendorResponse.data.vendors);
        } else if (vendorResponse.data.session?.temp_data?.vendors) {
          setVendorData(vendorResponse.data.session.temp_data.vendors);
        } else {
          setVendorData([]); // Set empty array if no vendors
        }

        // Fetch contract data
        const contractResponse = await getContractData();
        if (contractResponse.data.contracts?.length > 0) {
          setContractsData(contractResponse.data.contracts);
          setContractType(
            contractResponse.data.contracts[0].jenis_kontrak as ContractType
          );
          setIsSaved(true);
        } else if (contractResponse.data.session?.temp_data?.contracts) {
          setContractsData(contractResponse.data.session.temp_data.contracts);
          if (
            contractResponse.data.session.temp_data.contracts[0]?.jenis_kontrak
          ) {
            setContractType(
              contractResponse.data.session.temp_data.contracts[0]
                .jenis_kontrak as ContractType
            );
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (error instanceof Error) {
          setError(`Gagal mengambil data: ${error.message}`);
        } else {
          setError("Gagal mengambil data");
        }
      }
    };

    fetchInitialData();
  }, []);

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {showSuccessAlert && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          {alertType === "save"
            ? "Data kontrak berhasil disimpan!"
            : alertType === "edit"
            ? "Data kontrak berhasil diperbarui!"
            : ""}
        </div>
      )}

      {showDownloadSuccessAlert && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          File berhasil didownload!
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Data Kontrak</span>
            {(!isSaved || isEditMode) && (
              <Button onClick={addNewContract} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kontrak
              </Button>
            )}
          </CardTitle>
          <div className="space-y-2">
            <p className="text-sm text-red-500">*Wajib diisi</p>
            <div>
              <Label htmlFor="contract_type">
                Jenis Kontrak <span className="text-red-500">*</span>
              </Label>
              <Select
                value={contractType}
                onValueChange={handleContractTypeChange}
                disabled={isSaved && !isEditMode}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Pilih jenis kontrak" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ContractType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <TotalValues contracts={contractsData} />
          {contractsData.map((contract, index) => (
            <div key={index} className="border p-4 rounded-lg relative">
              {index !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 hover:bg-red-100"
                  onClick={() => removeContract(index)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}

              <h3 className="font-medium mb-4">
                Keterangan Kontrak {index + 1}
              </h3>
              <div>
                <Label htmlFor={`deskripsi_${index}`}>
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id={`deskripsi_${index}`}
                  value={contract.deskripsi}
                  onChange={(e) =>
                    handleInputChange(index, "deskripsi", e.target.value)
                  }
                  className={`w-full min-h-[120px] p-2 border border-gray-200 rounded-md resize-y ${
                    isSubmitted && !contract.deskripsi ? "border-red-300" : ""
                  }`}
                  placeholder="Masukkan deskripsi lengkap kontrak..."
                  disabled={isSaved && !isEditMode}
                  style={{
                    resize: "vertical",
                    minHeight: "120px",
                    maxHeight: "400px",
                  }}
                />
                {isSubmitted && !contract.deskripsi && (
                  <p className="text-red-500 text-sm mt-1">
                    Deskripsi tidak boleh kosong
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`jumlah_orang_${index}`}>
                    Jumlah Orang <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`jumlah_orang_${index}`}
                    type="number"
                    min="1"
                    value={contract.jumlah_orang}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "jumlah_orang",
                        parseInt(e.target.value)
                      )
                    }
                    className={
                      isSubmitted && !contract.jumlah_orang
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isSaved && !isEditMode}
                  />
                  {isSubmitted && contract.jumlah_orang <= 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      Jumlah orang harus lebih dari 0
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`durasi_kontrak_${index}`}>
                    Durasi Kontrak (bulan){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`durasi_kontrak_${index}`}
                    type="number"
                    min="1"
                    value={contract.durasi_kontrak}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "durasi_kontrak",
                        parseInt(e.target.value)
                      )
                    }
                    className={
                      isSubmitted && !contract.durasi_kontrak
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isSaved && !isEditMode}
                  />
                  {isSubmitted && contract.durasi_kontrak <= 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      Durasi kontrak harus lebih dari 0
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`nilai_perkiraan_sendiri_${index}`}>
                    Harga Perkiraan Sendiri{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nilai_perkiraan_sendiri_${index}`}
                    type="number"
                    min="0"
                    value={contract.nilai_perkiraan_sendiri}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "nilai_perkiraan_sendiri",
                        parseFloat(e.target.value)
                      )
                    }
                    className={
                      isSubmitted && !contract.nilai_perkiraan_sendiri
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isSaved && !isEditMode}
                  />
                  {contract.nilai_perkiraan_sendiri > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(contract.nilai_perkiraan_sendiri)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`nilai_kontral_awal_${index}`}>
                    Harga Sebelum Negosiasi{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nilai_kontral_awal_${index}`}
                    type="number"
                    min="0"
                    value={contract.nilai_kontral_awal}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "nilai_kontral_awal",
                        parseFloat(e.target.value)
                      )
                    }
                    className={
                      isSubmitted && !contract.nilai_kontral_awal
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isSaved && !isEditMode}
                  />
                  {contract.nilai_kontral_awal > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(contract.nilai_kontral_awal)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`nilai_kontrak_akhir_${index}`}>
                    Harga Setelah Negosiasi{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nilai_kontrak_akhir_${index}`}
                    type="number"
                    min="0"
                    value={contract.nilai_kontrak_akhir}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "nilai_kontrak_akhir",
                        parseFloat(e.target.value)
                      )
                    }
                    className={
                      isSubmitted && !contract.nilai_kontrak_akhir
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isSaved && !isEditMode}
                  />
                  {contract.nilai_kontrak_akhir > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(contract.nilai_kontrak_akhir)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <div className="flex space-x-4">
              <Button
                onClick={isSaved && !isEditMode ? handleEditMode : handleSubmit}
                variant={isEditMode ? "secondary" : "default"}
              >
                {isSaved && !isEditMode ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? "Simpan Perubahan" : "Simpan"}
                  </>
                )}
              </Button>

              {/* Tambahkan PrintContract component */}
              {documentData && vendorData && officialData.length > 0 && (
                <PrintContract
                  contractsData={contractsData.map((contract) => ({
                    ...contract,
                    jenis_kontrak: contractType,
                  }))}
                  documentData={documentData}
                  vendorData={vendorData}
                  officialData={officialData}
                  isContractsSaved={isSaved}
                  isContractsEditMode={isEditMode}
                  onError={setError}
                  setCurrentStep={setCurrentStep}
                  onDownloadSuccess={handleDownloadSuccess}
                />
              )}
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ContractsForm;
