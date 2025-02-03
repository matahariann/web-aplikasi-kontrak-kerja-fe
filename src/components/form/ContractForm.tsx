"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [contractType, setContractType] = useState<ContractType | null>(null);
  const [contractsData, setContractsData] = useState<
    Omit<ContractData, "jenis_kontrak">[]
  >([INITIAL_CONTRACT]);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [vendorData, setVendorData] = useState<VendorData[]>([]);
  const [officialData, setOfficialData] = useState<OfficialData[]>([]);

  const TotalValues = ({ contracts }) => {
    const { estimatedTotal, initialTotal, finalTotal } =
      calculateTotalValues(contracts);
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Total Nilai Kontrak</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Harga Perkiraan Sendiri:</p>
            <p className="font-medium">{formatCurrency(estimatedTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Harga Sebelum Negosiasi:</p>
            <p className="font-medium">{formatCurrency(initialTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Harga Setelah Negosiasi:</p>
            <p className="font-medium">{formatCurrency(finalTotal)}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Batas maksimal total untuk jenis kontrak{" "}
          {contractType ? (
            <>
              {contractType}: {formatCurrency(MAX_PRICE[contractType])}
            </>
          ) : (
            "belum dipilih"
          )}
        </p>
      </div>
    );
  };

  const calculateTotalValues = (
    contracts: Omit<ContractData, "jenis_kontrak">[]
  ) => {
    if (!contractType) {
      return { estimatedTotal: 0, initialTotal: 0, finalTotal: 0 };
    }

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
      toast.error(validationError);
      return;
    }

    setContractType(value);
  };

  const addNewContract = () => {
    setContractsData([...contractsData, { ...INITIAL_CONTRACT }]);
  };

  const removeContract = async (index: number) => {
    try {
      const contractToRemove = contractsData[index];

      if (contractsData.length <= 1) {
        toast.error("Harus ada minimal satu kontrak");
        return;
      }

      if (contractToRemove.id) {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        await deleteContract(token, String(contractToRemove.id));
      }

      const newContractsData = contractsData.filter((_, i) => i !== index);
      setContractsData(newContractsData);
    } catch (error) {
      toast.error(
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

    // For price fields, ensure value is at least 0
    const priceFields = [
      "nilai_perkiraan_sendiri",
      "nilai_kontral_awal",
      "nilai_kontrak_akhir",
    ];

    if (priceFields.includes(field)) {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      newContractsData[index] = {
        ...newContractsData[index],
        [field]: Math.max(0, isNaN(numValue) ? 0 : numValue),
      };
    }
    // Existing logic for other fields
    else if (field === "jumlah_orang" || field === "durasi_kontrak") {
      const numValue = typeof value === "string" ? parseInt(value) : value;
      newContractsData[index] = {
        ...newContractsData[index],
        [field]: Math.max(0, isNaN(numValue) ? 0 : numValue),
      };
    } else {
      newContractsData[index] = {
        ...newContractsData[index],
        [field]: value,
      };
    }

    setContractsData(newContractsData);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      if (!contractType) {
        toast.error("Mohon pilih jenis kontrak");
        return;
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
        toast.error("Mohon lengkapi semua input");
        return;
      }

      // Validate total contract values
      const validationError = validateContractValues(contractsData);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      const contractsWithType = contractsData.map((contract) => ({
        ...contract,
        jenis_kontrak: contractType,
        ...(contract.id ? { id: String(contract.id) } : {}),
      }));

      if (isEditMode) {
        // Find a non-null contract ID, preferring existing contracts
        const contractIdToUse =
          contractsData.find((c) => c.id)?.id ||
          (await getContractData()).data.contracts?.[0]?.id;

        if (!contractIdToUse) {
          throw new Error("Tidak dapat menemukan ID kontrak untuk diperbarui");
        }

        const response = await updateContract(
          token,
          String(contractIdToUse),
          contractsWithType
        );

        if (response.data.contracts) {
          setContractsData(response.data.contracts);
        }

        toast.success("Data kontrak berhasil diperbarui!");
      } else {
        for (const contract of contractsWithType) {
          await addContract(token, contract);
        }
        toast.success("Data kontrak berhasil disimpan!");
      }

      setIsSaved(true);
      setIsEditMode(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setIsSaved(false);
  };

  const handleDownloadSuccess = () => {
    toast.success("File berhasil didownload!");
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const docResponse = await getDocumentData();
        if (docResponse.data.document) {
          setDocumentData(docResponse.data.document);
        } else if (docResponse.data.session?.temp_data?.document) {
          setDocumentData(docResponse.data.session.temp_data.document);
        }

        const officialResponse = await getOfficialData();
        if (officialResponse.data.officials) {
          setOfficialData(officialResponse.data.officials);
        } else if (officialResponse.data.session?.temp_data?.officials) {
          setOfficialData(officialResponse.data.session.temp_data.officials);
        }

        const vendorResponse = await getVendorData();
        if (
          vendorResponse.data.vendors &&
          vendorResponse.data.vendors.length > 0
        ) {
          setVendorData(vendorResponse.data.vendors);
        } else if (vendorResponse.data.session?.temp_data?.vendors) {
          setVendorData(vendorResponse.data.session.temp_data.vendors);
        } else {
          setVendorData([]);
        }

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
        toast.error(
          error instanceof Error
            ? `Gagal mengambil data: ${error.message}`
            : "Gagal mengambil data"
        );
      }
    };

    fetchInitialData();
  }, []);

  return (
    <>
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
                value={contractType || ""}
                onValueChange={(value: string) => {
                  handleContractTypeChange(
                    value ? (value as ContractType) : null
                  );
                }}
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
                  disabled={isSaved && !isEditMode}
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
                  onError={toast.error}
                  setCurrentStep={setCurrentStep}
                  onDownloadSuccess={handleDownloadSuccess}
                />
              )}
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
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
