import React, { useState, useEffect } from "react";
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  ImageRun,
  Packer,
} from "docx";
import { saveAs } from "file-saver";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, Pencil, Plus, Minus, Printer } from "lucide-react";
import { addContract, updateContract, ContractData } from "@/services/employee";

const STORAGE_KEYS = {
  CONTRACTS_DATA: "contractsData",
  IS_CONTRACTS_SAVED: "isContractsSaved",
  SAVED_CONTRACTS_IDS: "savedContractsIds",
  IS_CONTRACTS_EDIT_MODE: "isContractsEditMode",
};

const INITIAL_CONTRACT = {
  jenis_kontrak: "",
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

interface PrintConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
}

const PrintConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: PrintConfirmationDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Cetak</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin mencetak dokumen? Setelah proses cetak, sesi
            pembuatan dokumen akan selesai dan semua data sementara akan
            dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Ya, Cetak</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const PrintDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: PrintDialogProps) => {
  const [filename, setFilename] = useState("");

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Simpan Dokumen</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="filename">Nama File</Label>
          <Input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Masukkan nama file"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(filename)}>
            Simpan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const generateContractDocument = async (contractData: ContractData) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SURAT PERINTAH KERJA",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Nomor: ${contractData.nomor_kontrak}`,
                size: 24,
              }),
            ],
          }),
          // Logo placeholder - you would need to add actual logo
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "KOMINFO",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 400,
            },
            children: [
              new TextRun({
                text: "ANTARA",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PEJABAT PEMBUAT KOMITMEN",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SEKRETARIAT DIREKTORAT JENDERAL",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: "APLIKASI INFORMATIKA",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "DENGAN",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: contractData.jenis_kontrak,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PEKERJAAN:",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: contractData.deskripsi,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SEKRETARIAT DIREKTORAT JENDERAL APLIKASI INFORMATIKA",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "TAHUN ANGGARAN 2024",
                bold: true,
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
};

const ContractsForm = ({ currentStep, setCurrentStep }) => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isPrintConfirmationOpen, setIsPrintConfirmationOpen] = useState(false);
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
  const [contractsData, setContractsData] = useState<ContractData[]>(() => {
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
    field: keyof ContractData,
    value: string | number
  ) => {
    const newContractsData = [...contractsData];
    newContractsData[index] = {
      ...newContractsData[index],
      [field]: value,
    };
    setContractsData(newContractsData);
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
          !contract.jenis_kontrak ||
          !contract.deskripsi ||
          !contract.jumlah_orang ||
          !contract.durasi_kontrak ||
          !contract.nilai_kontral_awal ||
          !contract.nilai_kontrak_akhir
      );

      if (hasEmptyFields) {
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

      let newSavedIds: string[] = [];

      if (isContractsEditMode) {
        // Handle edit mode
        for (let i = 0; i < contractsData.length; i++) {
          const contract = contractsData[i];
          const formattedContract = {
            ...contract,
            jumlah_orang: Number(contract.jumlah_orang),
            durasi_kontrak: Number(contract.durasi_kontrak),
            nilai_kontral_awal: Number(contract.nilai_kontral_awal),
            nilai_kontrak_akhir: Number(contract.nilai_kontrak_akhir),
          };

          try {
            if (i < savedContractsIds.length) {
              // Update existing contract
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
              // Add new contract
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

  const clearAllLocalStorage = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  const handlePrintClick = () => {
    setIsPrintConfirmationOpen(true);
  };

  const handlePrintConfirmed = () => {
    setIsPrintConfirmationOpen(false);
    setIsPrintDialogOpen(true);
  };

  const handlePrint = async (filename: string) => {
    try {
      if (!filename) {
        setContractsError("Nama file harus diisi");
        return;
      }

      // Generate dokumen untuk setiap kontrak
      for (let i = 0; i < contractsData.length; i++) {
        const contract = contractsData[i];
        const doc = await generateContractDocument(contract);

        // Export dokumen ke format blob
        const blob = await Packer.toBlob(doc);

        // Simpan file dengan nama yang diinputkan
        const sanitizedFilename = filename
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fullFilename = `${sanitizedFilename}${
          i > 0 ? `_${i + 1}` : ""
        }.docx`;

        // Simpan file
        saveAs(blob, fullFilename);
      }

      // Clear localStorage after successful print
      clearAllLocalStorage();

      // Tutup dialog print
      setIsPrintDialogOpen(false);

      // Tampilkan pesan sukses
      setContractsShowSuccessAlert(true);
      setContractsAlertType("save");

      // Refresh halaman setelah delay singkat untuk memastikan file selesai didownload
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Delay 1 detik sebelum refresh
    } catch (error) {
      console.error("Error generating document:", error);
      setContractsError("Terjadi kesalahan saat mencetak dokumen");
    }
  };

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
          <p className="text-sm text-red-500">*Wajib diisi</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {contractsData.map((contract, index) => (
            <div key={index} className="border p-4 rounded-lg relative">
              {/* Hanya tampilkan tombol hapus jika bukan index 0 */}
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
                  <Label htmlFor={`jenis_kontrak_${index}`}>
                    Jenis Kontrak <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`jenis_kontrak_${index}`}
                    value={contract.jenis_kontrak}
                    onChange={(e) =>
                      handleContractInputChange(
                        index,
                        "jenis_kontrak",
                        e.target.value
                      )
                    }
                    className={
                      isContractsSubmitted && !contract.jenis_kontrak
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isContractsSaved && !isContractsEditMode}
                  />
                </div>
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
              {isContractsSaved && !isContractsEditMode && (
                <Button variant="outline" onClick={handlePrintClick}>
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak
                </Button>
              )}
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setCurrentStep(3)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add PrintConfirmationDialog */}
      <PrintConfirmationDialog
        isOpen={isPrintConfirmationOpen}
        onClose={() => setIsPrintConfirmationOpen(false)}
        onConfirm={handlePrintConfirmed}
      />

      {/* Print Dialog */}
      <PrintDialog
        isOpen={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        onConfirm={handlePrint}
      />
    </>
  );
};

export default ContractsForm;
