import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowRight, ArrowLeft, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addOfficial,
  updateOfficial,
  getPeriodes,
  getOfficialsByPeriode,
  OfficialData,
} from "@/services/employee";

const STORAGE_KEYS = {
  OFFICIALS_DATA: "officialsData",
  IS_OFFICIALS_SAVED: "isOfficialsSaved",
  SAVED_OFFICIALS_IDS: "savedOfficialsIds",
  IS_OFFICIALS_EDIT_MODE: "isOfficialsEditMode",
  SELECTED_PERIOD: "selectedPeriod",
};

const INITIAL_OFFICIALS = [
  {
    nip: "",
    nama: "",
    jabatan: "Pejabat Pembuat Komitmen Sekretariat Ditjen Aplikasi Informatika",
    surat_keputusan: "",
  },
  {
    nip: "",
    nama: "",
    jabatan:
      "Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika",
    surat_keputusan: "", // Ini akan diabaikan di form
  },
];

const OfficialsForm = ({ currentStep, setCurrentStep }) => {
  const [periodes, setPeriodes] = useState<string[]>([]);
  const [formSessionId, setFormSessionId] = useState<string | null>(() => {
    return localStorage.getItem("form_session_id");
  });
  const [selectedPeriode, setSelectedPeriode] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PERIOD);
    return saved || "";
  });
  const [isFromDatabase, setIsFromDatabase] = useState(false);
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
    const fetchPeriodes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await getPeriodes(token);
        setPeriodes(response.data);

        const storedPeriode = localStorage.getItem(
          STORAGE_KEYS.SELECTED_PERIOD
        );
        if (
          storedPeriode &&
          !response.data.includes(storedPeriode) &&
          storedPeriode !== "new"
        ) {
          localStorage.removeItem(STORAGE_KEYS.SELECTED_PERIOD);
          setSelectedPeriode("");
        }
      } catch (error) {
        console.error("Failed to fetch periodes:", error);
      }
    };

    fetchPeriodes();
  }, []);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PERIOD, selectedPeriode);
  }, [selectedPeriode]);

  useEffect(() => {
    const sessionId = localStorage.getItem("form_session_id");
    if (!sessionId) {
      setOfficialsError("Mohon isi form vendor terlebih dahulu");
      setCurrentStep(1); // Kembali ke form vendor
    } else {
      setFormSessionId(sessionId);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedPeriode = localStorage.getItem(STORAGE_KEYS.SELECTED_PERIOD);
      if (storedPeriode && storedPeriode !== "new") {
        await handlePeriodeChange(storedPeriode);
      }
    };

    fetchInitialData();
  }, []);

  const handlePeriodeChange = async (periode: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setSelectedPeriode(periode);
      localStorage.setItem(STORAGE_KEYS.SELECTED_PERIOD, periode);

      if (periode === "new") {
        setOfficialsData(
          INITIAL_OFFICIALS.map((official) => ({
            ...official,
            periode_jabatan: "",
          }))
        );
        setIsFromDatabase(false);
        setIsOfficialsSaved(false);
        setIsOfficialsEditMode(false);
        setSavedOfficialsIds([]);
        return;
      }

      const response = await getOfficialsByPeriode(token, periode);
      setOfficialsData(response.data);
      setSavedOfficialsIds(response.data.map((official) => official.id));
      setIsFromDatabase(true);
      setIsOfficialsSaved(true); // Ubah menjadi true karena data dari database
      setIsOfficialsEditMode(false); // Pastikan mode edit false
    } catch (error) {
      console.error("Failed to fetch officials:", error);
      setOfficialsError(
        "Gagal mengambil data pejabat untuk periode yang dipilih"
      );
    }
  };

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

  const handleOfficialsSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setOfficialsError(null);
    setIsOfficialsSubmitted(true);

    if (!formSessionId) {
      setOfficialsError("Form session tidak ditemukan");
      return;
    }

    const hasEmptyFields = officialsData.some((official) => {
      const basicFieldsEmpty =
        !official.nip || !official.nama || !official.periode_jabatan;
      const isPPK = official.jabatan.includes("Pejabat Pembuat Komitmen");
      const skEmpty = isPPK && !official.surat_keputusan;

      return basicFieldsEmpty || skEmpty;
    });

    if (hasEmptyFields) {
      setOfficialsError("Mohon lengkapi semua input");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      if (isOfficialsEditMode) {
        // Update existing officials
        for (let i = 0; i < officialsData.length; i++) {
          const official = officialsData[i];
          const officialId = savedOfficialsIds[i];

          await updateOfficial(token, officialId, {
            ...official,
            form_session_id: formSessionId,
          });
        }
      } else {
        // Add new officials
        const savedIds = [];
        for (const official of officialsData) {
          const response = await addOfficial(token, {
            ...official,
            form_session_id: formSessionId,
          });
          savedIds.push(response.data.id);
        }
        setSavedOfficialsIds(savedIds);
      }

      // Update states setelah berhasil menyimpan
      setIsOfficialsSaved(true);
      setIsOfficialsEditMode(false);
      setOfficialsShowSuccessAlert(true);
      setOfficialsAlertType(isOfficialsEditMode ? "edit" : "save");
      setIsOfficialsSubmitted(false);
      setIsFromDatabase(selectedPeriode !== "new"); // Update isFromDatabase berdasarkan periode

      // Update localStorage
      localStorage.setItem(
        STORAGE_KEYS.OFFICIALS_DATA,
        JSON.stringify(officialsData)
      );
      localStorage.setItem(
        STORAGE_KEYS.IS_OFFICIALS_SAVED,
        JSON.stringify(true)
      );
      localStorage.setItem(
        STORAGE_KEYS.IS_OFFICIALS_EDIT_MODE,
        JSON.stringify(false)
      );
      localStorage.setItem(
        STORAGE_KEYS.SAVED_OFFICIALS_IDS,
        JSON.stringify(savedOfficialsIds)
      );

      setTimeout(() => {
        setOfficialsShowSuccessAlert(false);
        setOfficialsAlertType(null);
      }, 3000);
    } catch (error) {
      setOfficialsShowSuccessAlert(false);
      if (error instanceof Error) {
        setOfficialsError(error.message);
      } else {
        setOfficialsError("Terjadi kesalahan saat menyimpan data");
      }
    }
  };

  const handleEditMode = () => {
    setIsOfficialsEditMode(true);
    setIsOfficialsSaved(false);

    // Pastikan data yang tersimpan di localStorage tetap ada saat mode edit
    const savedData = localStorage.getItem(STORAGE_KEYS.OFFICIALS_DATA);
    if (savedData) {
      setOfficialsData(JSON.parse(savedData));
    }

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
          <div className="border p-4 rounded-lg mb-6">
            <Label htmlFor="periode-select">
              Periode Jabatan <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  onValueChange={handlePeriodeChange}
                  value={selectedPeriode}
                  disabled={isOfficialsSaved && !isOfficialsEditMode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih periode atau tambah baru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Tambah Periode Baru</SelectItem>
                    {periodes.map((periode) => (
                      <SelectItem key={periode} value={periode}>
                        {periode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPeriode === "new" && (
                <div>
                  <Input
                    placeholder="cth. 2024"
                    value={officialsData[0]?.periode_jabatan || ""}
                    onChange={(e) => {
                      const newPeriode = e.target.value;
                      setOfficialsData((prev) =>
                        prev.map((official) => ({
                          ...official,
                          periode_jabatan: newPeriode,
                        }))
                      );
                    }}
                    disabled={isOfficialsSaved && !isOfficialsEditMode}
                    className={
                      isOfficialsSubmitted && !officialsData[0]?.periode_jabatan
                        ? "border-red-300"
                        : ""
                    }
                  />
                  {isOfficialsSubmitted &&
                    !officialsData[0]?.periode_jabatan && (
                      <p className="text-red-500 text-sm mt-1">
                        Periode jabatan tidak boleh kosong
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
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
                    disabled={
                      isFromDatabase ||
                      (isOfficialsSaved && !isOfficialsEditMode)
                    }
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
                    disabled={
                      isFromDatabase ||
                      (isOfficialsSaved && !isOfficialsEditMode)
                    }
                  />
                  {isOfficialsSubmitted && !official.nama && (
                    <p className="text-red-500 text-sm mt-1">
                      Nama tidak boleh kosong
                    </p>
                  )}
                </div>
                {/* Surat Keputusan hanya untuk Pejabat Pembuat Komitmen */}
                {official.jabatan.includes("Pejabat Pembuat Komitmen") && (
                  <div className="col-span-2">
                    <Label htmlFor={`surat_keputusan_${index}`}>
                      Surat Keputusan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`surat_keputusan_${index}`}
                      value={official.surat_keputusan}
                      onChange={(e) =>
                        handleOfficialsInputChange(
                          index,
                          "surat_keputusan",
                          e.target.value
                        )
                      }
                      className={
                        isOfficialsSubmitted && !official.surat_keputusan
                          ? "border-red-300"
                          : ""
                      }
                      disabled={
                        isFromDatabase ||
                        (isOfficialsSaved && !isOfficialsEditMode)
                      }
                    />
                    {isOfficialsSubmitted && !official.surat_keputusan && (
                      <p className="text-red-500 text-sm mt-1">
                        Surat Keputusan tidak boleh kosong untuk Pejabat Pembuat
                        Komitmen
                      </p>
                    )}
                  </div>
                )}
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
