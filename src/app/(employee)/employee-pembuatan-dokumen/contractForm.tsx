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
import { addContract, updateContract, ContractData, DocumentData } from "@/services/employee";
import { PrintContract } from "./generateDocs";

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

const STORAGE_KEYS = {
  CONTRACTS_DATA: "contractsData",
  IS_CONTRACTS_SAVED: "isContractsSaved",
  SAVED_CONTRACTS_IDS: "savedContractsIds",
  IS_CONTRACTS_EDIT_MODE: "isContractsEditMode",
  CONTRACT_TYPE: "contractType",
};

const INITIAL_CONTRACT = {
  deskripsi: "",
  jumlah_orang: 0,
  durasi_kontrak: 0,
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
  const [contractType, setContractType] = useState<ContractType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRACT_TYPE);
    return saved ? JSON.parse(saved) : ContractType.KONSULTAN;
  });
  const [isContractsEditMode, setIsContractsEditMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_CONTRACTS_EDIT_MODE);
    return saved ? JSON.parse(saved) : false;
  });
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [contractsAlertType, setContractsAlertType] = useState<
    "save" | "delete" | "edit" | null
  >(null);
  const [contractsShowSuccessAlert, setContractsShowSuccessAlert] =
    useState(false);
  const [isContractsSubmitted, setIsContractsSubmitted] = useState(false);
  const [isContractsSaved, setIsContractsSaved] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_CONTRACTS_SAVED);
    return saved ? JSON.parse(saved) : false;
  });
  const [savedContractsIds, setSavedContractsIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CONTRACTS_IDS);
    return saved ? JSON.parse(saved) : [];
  });
  const [documentData] = useState<DocumentData>(() => {
    const saved = localStorage.getItem("documentData");
    return saved ? JSON.parse(saved) : null;
  });
  const [contractsData, setContractsData] = useState<
    Omit<ContractData, "jenis_kontrak">[]
  >(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS_DATA);
    return saved ? JSON.parse(saved) : [INITIAL_CONTRACT];
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.CONTRACTS_DATA,
      JSON.stringify(contractsData)
    );
  }, [contractsData]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.CONTRACT_TYPE,
      JSON.stringify(contractType)
    );
  }, [contractType]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.IS_CONTRACTS_SAVED,
      JSON.stringify(isContractsSaved)
    );
  }, [isContractsSaved]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SAVED_CONTRACTS_IDS,
      JSON.stringify(savedContractsIds)
    );
  }, [savedContractsIds]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.IS_CONTRACTS_EDIT_MODE,
      JSON.stringify(isContractsEditMode)
    );
  }, [isContractsEditMode]);

  const validateContractValue = (value: number): string | null => {
    const maxValue = MAX_PRICE[contractType];
    if (value > maxValue) {
      return `Nilai kontrak untuk ${contractType} tidak boleh melebihi ${formatCurrency(
        maxValue
      )}`;
    }
    return null;
  };

  const handleContractTypeChange = (value: ContractType) => {
    // Validate all existing contracts with new contract type
    for (const contract of contractsData) {
      const initialValueError = validateContractValue(
        contract.nilai_kontral_awal
      );
      const finalValueError = validateContractValue(
        contract.nilai_kontrak_akhir
      );

      if (initialValueError || finalValueError) {
        setContractsError(initialValueError || finalValueError);
        return;
      }
    }

    setContractType(value);
    setContractsError(null);
  };

  const addNewContract = () => {
    setContractsData([...contractsData, { ...INITIAL_CONTRACT }]);
  };

  const removeContract = (index: number) => {
    if (contractsData.length > 1) {
      const newContractsData = contractsData.filter((_, i) => i !== index);
      setContractsData(newContractsData);
    }
  };

  const handleContractInputChange = (
    index: number,
    field: keyof Omit<ContractData, "jenis_kontrak">,
    value: string | number
  ) => {
    const newContractsData = [...contractsData];
    newContractsData[index] = {
      ...newContractsData[index],
      [field]: value,
    };

    // Validate contract values when changing values
    if (field === "nilai_kontral_awal" || field === "nilai_kontrak_akhir") {
      const initialValueError = validateContractValue(
        newContractsData[index].nilai_kontral_awal
      );
      const finalValueError = validateContractValue(
        newContractsData[index].nilai_kontrak_akhir
      );

      if (initialValueError || finalValueError) {
        setContractsError(initialValueError || finalValueError);
        return;
      }
    }

    setContractsData(newContractsData);
    setContractsError(null);
  };

  const handleContractsSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setContractsError(null);
    setIsContractsSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      // Validasi form data
      const hasEmptyFields = contractsData.some(
        (contract) =>
          !contract.deskripsi ||
          !contract.jumlah_orang ||
          !contract.durasi_kontrak ||
          !contract.nilai_kontral_awal ||
          !contract.nilai_kontrak_akhir
      );

      if (!contractType || hasEmptyFields) {
        setContractsError("Mohon lengkapi semua input");
        return;
      }

      // Validasi nilai numerik
      const hasInvalidNumbers = contractsData.some(
        (contract) =>
          contract.jumlah_orang <= 0 ||
          contract.durasi_kontrak <= 0 ||
          contract.nilai_kontral_awal <= 0 ||
          contract.nilai_kontrak_akhir <= 0
      );

      if (hasInvalidNumbers) {
        setContractsError("Nilai numerik harus lebih besar dari 0");
        return;
      }

      // Validasi maksimal harga kontrak
      for (const contract of contractsData) {
        const initialValueError = validateContractValue(
          contract.nilai_kontral_awal
        );
        const finalValueError = validateContractValue(
          contract.nilai_kontrak_akhir
        );

        if (initialValueError || finalValueError) {
          setContractsError(initialValueError || finalValueError);
          return;
        }
      }

      let newSavedIds: string[] = [];

      if (isContractsEditMode) {
        // Handle edit mode
        for (let i = 0; i < contractsData.length; i++) {
          const contract = contractsData[i];
          const formattedContract = {
            ...contract,
            jenis_kontrak: contractType,
            jumlah_orang: Number(contract.jumlah_orang),
            durasi_kontrak: Number(contract.durasi_kontrak),
            nilai_kontral_awal: Number(contract.nilai_kontral_awal),
            nilai_kontrak_akhir: Number(contract.nilai_kontrak_akhir),
          };

          try {
            if (i < savedContractsIds.length) {
              const oldId = savedContractsIds[i];
              const response = await updateContract(
                token,
                oldId,
                formattedContract
              );
              if (response?.data?.id) {
                newSavedIds.push(response.data.id);
              }
            } else {
              const response = await addContract(token, formattedContract);
              if (response?.data?.id) {
                newSavedIds.push(response.data.id);
              }
            }
          } catch (error) {
            console.error(`Error processing contract ${i}:`, error);
            throw error;
          }
        }
      } else {
        // Handle add mode
        for (const contract of contractsData) {
          try {
            const formattedContract = {
              ...contract,
              jenis_kontrak: contractType,
              jumlah_orang: Number(contract.jumlah_orang),
              durasi_kontrak: Number(contract.durasi_kontrak),
              nilai_kontral_awal: Number(contract.nilai_kontral_awal),
              nilai_kontrak_akhir: Number(contract.nilai_kontrak_akhir),
            };

            const response = await addContract(token, formattedContract);
            if (response?.data?.id) {
              newSavedIds.push(response.data.id);
            } else {
              throw new Error("Gagal mendapatkan ID kontrak baru");
            }
          } catch (error) {
            console.error("Error adding contract:", error);
            throw error;
          }
        }
      }

      // Update state setelah berhasil menyimpan
      setSavedContractsIds(newSavedIds);
      setIsContractsSaved(true);
      setContractsShowSuccessAlert(true);
      setContractsAlertType(isContractsEditMode ? "edit" : "save");
      setIsContractsSubmitted(false);
      setIsContractsEditMode(false);

      // Update localStorage
      localStorage.setItem(
        STORAGE_KEYS.SAVED_CONTRACTS_IDS,
        JSON.stringify(newSavedIds)
      );
      localStorage.setItem(
        STORAGE_KEYS.CONTRACTS_DATA,
        JSON.stringify(contractsData)
      );
      localStorage.setItem(
        STORAGE_KEYS.IS_CONTRACTS_SAVED,
        JSON.stringify(true)
      );
      localStorage.setItem(
        STORAGE_KEYS.IS_CONTRACTS_EDIT_MODE,
        JSON.stringify(false)
      );

      setTimeout(() => {
        setContractsShowSuccessAlert(false);
        setContractsAlertType(null);
      }, 3000);
    } catch (error) {
      console.error("Submit error:", error);
      setContractsShowSuccessAlert(false);
      setIsContractsSubmitted(false);
      setContractsError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data"
      );
    }
  };

  const handleEditMode = () => {
    setIsContractsEditMode(true);
    setIsContractsSaved(false);
    const savedIds = localStorage.getItem(STORAGE_KEYS.SAVED_CONTRACTS_IDS);
    if (savedIds) {
      setSavedContractsIds(JSON.parse(savedIds));
    }
  };

  // const clearAllLocalStorage = () => {
  //   Object.values(STORAGE_KEYS).forEach((key) => {
  //     localStorage.removeItem(key);
  //   });
  // };

  return (
    <>
      {contractsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {contractsError}
        </div>
      )}

      {contractsShowSuccessAlert && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          {contractsAlertType === "save"
            ? "Data kontrak berhasil disimpan!"
            : contractsAlertType === "edit"
            ? "Data kontrak berhasil diperbarui!"
            : ""}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Data Kontrak</span>
            {(!isContractsSaved || isContractsEditMode) && (
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
                disabled={isContractsSaved && !isContractsEditMode}
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
              <p className="text-sm text-gray-500 mt-1">
                Batas maksimal nilai kontrak:{" "}
                {formatCurrency(MAX_PRICE[contractType])}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contractsData.map((contract, index) => (
            <div key={index} className="border p-4 rounded-lg relative">
              {index !== 0 && (!isContractsSaved || isContractsEditMode) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeContract(index)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
              <h3 className="font-medium mb-4">
                Deskripsi Kontrak {index + 1}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`deskripsi_${index}`}>
                    Deskripsi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`deskripsi_${index}`}
                    value={contract.deskripsi}
                    onChange={(e) =>
                      handleContractInputChange(
                        index,
                        "deskripsi",
                        e.target.value
                      )
                    }
                    className={
                      isContractsSubmitted && !contract.deskripsi
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isContractsSaved && !isContractsEditMode}
                  />
                  {isContractsSubmitted && !contract.deskripsi && (
                    <p className="text-red-500 text-sm mt-1">
                      Deskripsi tidak boleh kosong
                    </p>
                  )}
                </div>
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
                      handleContractInputChange(
                        index,
                        "jumlah_orang",
                        parseInt(e.target.value)
                      )
                    }
                    className={
                      isContractsSubmitted && !contract.jumlah_orang
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isContractsSaved && !isContractsEditMode}
                  />
                  {isContractsSubmitted && !contract.jumlah_orang && (
                    <p className="text-red-500 text-sm mt-1">
                      Jumlah orang harus diberi nilai
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
                      handleContractInputChange(
                        index,
                        "durasi_kontrak",
                        parseInt(e.target.value)
                      )
                    }
                    className={
                      isContractsSubmitted && !contract.durasi_kontrak
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isContractsSaved && !isContractsEditMode}
                  />
                  {isContractsSubmitted && !contract.durasi_kontrak && (
                    <p className="text-red-500 text-sm mt-1">
                      Durasi kontrak harus diberi nilai
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
                      handleContractInputChange(
                        index,
                        "nilai_kontral_awal",
                        parseFloat(e.target.value)
                      )
                    }
                    className={
                      isContractsSubmitted && !contract.nilai_kontral_awal
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isContractsSaved && !isContractsEditMode}
                  />
                  {contract.nilai_kontral_awal > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(contract.nilai_kontral_awal)}
                    </p>
                  )}
                  {isContractsSubmitted && !contract.nilai_kontral_awal && (
                    <p className="text-red-500 text-sm mt-1">
                      Harga Sebelum Negosiasi harus diberi nilai
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
                      handleContractInputChange(
                        index,
                        "nilai_kontrak_akhir",
                        parseFloat(e.target.value)
                      )
                    }
                    className={
                      isContractsSubmitted && !contract.nilai_kontrak_akhir
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isContractsSaved && !isContractsEditMode}
                  />
                  {contract.nilai_kontral_awal > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(contract.nilai_kontrak_akhir)}
                    </p>
                  )}
                  {isContractsSubmitted && !contract.nilai_kontrak_akhir && (
                    <p className="text-red-500 text-sm mt-1">
                      Harga Setelah Negosiasi harus diberi nilai
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-4">
              <Button
                onClick={
                  isContractsSaved && !isContractsEditMode
                    ? handleEditMode
                    : handleContractsSubmit
                }
                variant={isContractsEditMode ? "secondary" : "default"}
              >
                {isContractsSaved && !isContractsEditMode ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isContractsEditMode ? "Simpan Perubahan" : "Simpan"}
                  </>
                )}
              </Button>
              <PrintContract
                contractsData={contractsData.map((contract) => ({
                  ...contract,
                  jenis_kontrak: contractType,
                }))}
                documentData={documentData}
                isContractsSaved={isContractsSaved}
                isContractsEditMode={isContractsEditMode}
                onError={setContractsError}
                // clearLocalStorage={clearAllLocalStorage}
              />
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
