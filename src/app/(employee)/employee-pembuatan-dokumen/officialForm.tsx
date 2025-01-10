import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowRight, ArrowLeft, Pencil } from "lucide-react";
import {
  addOfficial,
  updateOfficial,
  OfficialData,
} from "@/services/employee";

const STORAGE_KEYS = {
  OFFICIALS_DATA: "officialsData",
  IS_OFFICIALS_SAVED: "isOfficialsSaved",
  SAVED_OFFICIALS_IDS: "savedOfficialsIds",
  IS_OFFICIALS_EDIT_MODE: "isOfficialsEditMode",
};

const INITIAL_OFFICIALS = [
  {
    nip: "",
    nama: "",
    jabatan: "Pejabat Pembuat Komitmen Sekretariat Ditjen Aplikasi Informatika",
    periode_jabatan: "",
  },
  {
    nip: "",
    nama: "",
    jabatan:
      "Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika",
    periode_jabatan: "",
  },
];

const OfficialsForm = ({ currentStep, setCurrentStep }) => {
  const [isOfficialsEditMode, setIsOfficialsEditMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_OFFICIALS_EDIT_MODE);
    return saved ? JSON.parse(saved) : false;
  });
  const [officialsError, setOfficialsError] = useState<string | null>(null);
  const [officialsAlertType, setOfficialsAlertType] = useState<
    "save" | "delete" | "edit" | null
  >(null);
  const [officialsShowSuccessAlert, setOfficialsShowSuccessAlert] =
    useState(false);
  const [isOfficialsSubmitted, setIsOfficialsSubmitted] = useState(false);
  const [isOfficialsSaved, setIsOfficialsSaved] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_OFFICIALS_SAVED);
    return saved ? JSON.parse(saved) : false;
  });
  const [savedOfficialsIds, setSavedOfficialsIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_OFFICIALS_IDS);
    return saved ? JSON.parse(saved) : [];
  });
  const [officialsData, setOfficialsData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFICIALS_DATA);
    return saved ? JSON.parse(saved) : INITIAL_OFFICIALS;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.OFFICIALS_DATA,
      JSON.stringify(officialsData)
    );
  }, [officialsData]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.IS_OFFICIALS_SAVED,
      JSON.stringify(isOfficialsSaved)
    );
  }, [isOfficialsSaved]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SAVED_OFFICIALS_IDS,
      JSON.stringify(savedOfficialsIds)
    );
  }, [savedOfficialsIds]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.IS_OFFICIALS_EDIT_MODE,
      JSON.stringify(isOfficialsEditMode)
    );
  }, [isOfficialsEditMode]);

  useEffect(() => {
    const savedIds = localStorage.getItem(STORAGE_KEYS.SAVED_OFFICIALS_IDS);
    if (savedIds) {
        setSavedOfficialsIds(JSON.parse(savedIds));
    }
}, []);

  const handleOfficialsInputChange = (
    index: number,
    field: keyof OfficialData,
    value: string
  ) => {
    const newOfficialsData = [...officialsData];
    newOfficialsData[index] = {
      ...newOfficialsData[index],
      [field]: value,
    };
    setOfficialsData(newOfficialsData);
  };

//   const handleOfficialsSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setOfficialsError(null);
//     setIsOfficialsSubmitted(true);

//     const hasEmptyFields = officialsData.some(
//         (official) => !official.nip || !official.nama || !official.periode_jabatan
//     );

//     if (hasEmptyFields) {
//         setOfficialsError("Mohon lengkapi semua input");
//         return;
//     }

//     try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//             throw new Error("Anda belum login. Silakan login terlebih dahulu.");
//         }

//         if (isOfficialsEditMode) {
//             // Update existing officials
//             for (let i = 0; i < officialsData.length; i++) {
//                 const official = officialsData[i];
//                 const oldNip = savedOfficialsIds[i]; // Menggunakan NIP lama dari savedOfficialsIds
//                 await updateOfficial(token, oldNip, official);
//             }
//             // Update savedOfficialsIds dengan NIP baru
//             setSavedOfficialsIds(officialsData.map(official => official.nip));
//             setIsOfficialsEditMode(false);
//         } else {
//             // Add new officials
//             const savedIds = [];
//             for (const official of officialsData) {
//                 const response = await addOfficial(token, official);
//                 savedIds.push(response.data.nip);
//             }
//             setSavedOfficialsIds(savedIds);
//         }

//         setIsOfficialsSaved(true);
//         setOfficialsShowSuccessAlert(true);
//         setOfficialsAlertType(isOfficialsEditMode ? "edit" : "save");
//         setIsOfficialsSubmitted(false);

//         setTimeout(() => {
//             setOfficialsShowSuccessAlert(false);
//             setOfficialsAlertType(null);
//         }, 3000);
//     } catch (error) {
//         setOfficialsShowSuccessAlert(false);
//         setOfficialsError(
//             error instanceof Error ? error.message : "Terjadi kesalahan"
//         );
//     }
// };

const handleOfficialsSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  setOfficialsError(null);
  setIsOfficialsSubmitted(true);

  const hasEmptyFields = officialsData.some(
      (official) => !official.nip || !official.nama || !official.periode_jabatan
  );

  if (hasEmptyFields) {
      setOfficialsError("Mohon lengkapi semua input");
      return;
  }

  try {
      const token = localStorage.getItem("token");
      if (!token) {
          throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      let newSavedIds = [...savedOfficialsIds]; // Buat copy dari savedOfficialsIds

      if (isOfficialsEditMode) {
          // Update existing officials
          for (let i = 0; i < officialsData.length; i++) {
              const official = officialsData[i];
              const oldNip = savedOfficialsIds[i];
              
              try {
                  const response = await updateOfficial(token, oldNip, {
                      nip: official.nip,
                      nama: official.nama,
                      jabatan: official.jabatan,
                      periode_jabatan: official.periode_jabatan
                  });
                  
                  // Update savedOfficialsIds dengan NIP baru
                  newSavedIds[i] = official.nip;
                  
                  // Log untuk debugging
                  console.log(`Updated official ${oldNip} to ${official.nip}`);
              } catch (error) {
                  console.error(`Error updating official ${oldNip}:`, error);
                  throw error;
              }
          }
          
          // Update state savedOfficialsIds setelah semua updates selesai
          setSavedOfficialsIds(newSavedIds);
          
          // Update localStorage dengan NIP baru
          localStorage.setItem(STORAGE_KEYS.SAVED_OFFICIALS_IDS, JSON.stringify(newSavedIds));
          
          setIsOfficialsEditMode(false);
      } else {
          // Add new officials
          const savedIds = [];
          for (const official of officialsData) {
              const response = await addOfficial(token, official);
              savedIds.push(response.data.nip);
          }
          setSavedOfficialsIds(savedIds);
          localStorage.setItem(STORAGE_KEYS.SAVED_OFFICIALS_IDS, JSON.stringify(savedIds));
      }

      setIsOfficialsSaved(true);
      setOfficialsShowSuccessAlert(true);
      setOfficialsAlertType(isOfficialsEditMode ? "edit" : "save");
      setIsOfficialsSubmitted(false);

      // Simpan data terbaru ke localStorage
      localStorage.setItem(STORAGE_KEYS.OFFICIALS_DATA, JSON.stringify(officialsData));
      localStorage.setItem(STORAGE_KEYS.IS_OFFICIALS_SAVED, JSON.stringify(true));
      localStorage.setItem(STORAGE_KEYS.IS_OFFICIALS_EDIT_MODE, JSON.stringify(false));

      setTimeout(() => {
          setOfficialsShowSuccessAlert(false);
          setOfficialsAlertType(null);
      }, 3000);
  } catch (error) {
      setOfficialsShowSuccessAlert(false);
      setOfficialsError(
          error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui data"
      );
  }
};

const handleEditMode = () => {
  setIsOfficialsEditMode(true);
  setIsOfficialsSaved(false);
  // Pastikan savedOfficialsIds masih tersedia saat mode edit
  const savedIds = localStorage.getItem(STORAGE_KEYS.SAVED_OFFICIALS_IDS);
  if (savedIds) {
      setSavedOfficialsIds(JSON.parse(savedIds));
  }
};

  return (
    <>
      {officialsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {officialsError}
        </div>
      )}

      {officialsShowSuccessAlert && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          {officialsAlertType === "save"
            ? "Data pejabat berhasil disimpan!"
            : officialsAlertType === "edit"
            ? "Data pejabat berhasil diperbarui!"
            : ""}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Data Pejabat</CardTitle>
          <p className="text-sm text-red-500">*Wajib diisi</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {officialsData.map((official, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-medium mb-4">{official.jabatan}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`nip_${index}`}>
                    NIP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nip_${index}`}
                    value={official.nip}
                    onChange={(e) =>
                      handleOfficialsInputChange(index, "nip", e.target.value)
                    }
                    className={
                      isOfficialsSubmitted && !official.nip
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isOfficialsSaved && !isOfficialsEditMode}
                  />
                  {isOfficialsSubmitted && !official.nip && (
                    <p className="text-red-500 text-sm mt-1">
                      NIP tidak boleh kosong
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`nama_${index}`}>
                    Nama <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nama_${index}`}
                    value={official.nama}
                    onChange={(e) =>
                      handleOfficialsInputChange(index, "nama", e.target.value)
                    }
                    className={
                      isOfficialsSubmitted && !official.nama
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isOfficialsSaved && !isOfficialsEditMode}
                  />
                  {isOfficialsSubmitted && !official.nama && (
                    <p className="text-red-500 text-sm mt-1">
                      Nama tidak boleh kosong
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`jabatan_${index}`}>Jabatan</Label>
                  <Input
                    id={`jabatan_${index}`}
                    value={official.jabatan}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor={`periode_jabatan_${index}`}>
                    Periode Jabatan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`periode_jabatan_${index}`}
                    value={official.periode_jabatan}
                    onChange={(e) =>
                      handleOfficialsInputChange(
                        index,
                        "periode_jabatan",
                        e.target.value
                      )
                    }
                    className={
                      isOfficialsSubmitted && !official.periode_jabatan
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isOfficialsSaved && !isOfficialsEditMode}
                  />
                  {isOfficialsSubmitted && !official.periode_jabatan && (
                    <p className="text-red-500 text-sm mt-1">
                      Periode jabatan tidak boleh kosong
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button
              onClick={
                isOfficialsSaved && !isOfficialsEditMode
                  ? handleEditMode
                  : handleOfficialsSubmit
              }
              variant={isOfficialsEditMode ? "secondary" : "default"}
            >
              {isOfficialsSaved && !isOfficialsEditMode ? (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isOfficialsEditMode ? "Simpan Perubahan" : "Simpan"}
                </>
              )}
            </Button>
            <div className="flex space-x-4">
              <Button onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!isOfficialsSaved || isOfficialsEditMode}
                style={{ userSelect: "none" }}
              >
                Berikutnya
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default OfficialsForm;
