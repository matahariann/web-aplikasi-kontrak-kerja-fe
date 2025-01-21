import axiosInstance from "@/lib/axios";
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
  getOfficialData,
  getPeriodes,
  getOfficialsByPeriode,
  OfficialData,
} from "@/services/official";

const INITIAL_OFFICIALS = [
  {
    id: "",
    nip: "",
    nama: "",
    jabatan: "Pejabat Pembuat Komitmen Sekretariat Ditjen Aplikasi Informatika",
    surat_keputusan: "",
    periode_jabatan: "",
  },
  {
    id: "",
    nip: "",
    nama: "",
    jabatan:
      "Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika",
    surat_keputusan: "",
    periode_jabatan: "",
  },
];

const OfficialsForm = ({ currentStep, setCurrentStep }) => {
  const [periodes, setPeriodes] = useState<string[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");
  const [isFromDatabase, setIsFromDatabase] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertType, setAlertType] = useState<"save" | "edit" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [officialsData, setOfficialsData] = useState(INITIAL_OFFICIALS);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handlePeriodeChange = async (periode: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setSelectedPeriode(periode);

      if (periode === "new") {
        // Logic untuk data baru tetap sama
        const newOfficialsData = INITIAL_OFFICIALS.map((official) => ({
          ...official,
          periode_jabatan: "",
        }));
        setOfficialsData(newOfficialsData);
        setIsFromDatabase(false);
        setIsSaved(false);
        setIsEditMode(false);

        if (sessionId) {
          await axiosInstance.put(`/update-session/${sessionId}`, {
            temp_data: {
              official: newOfficialsData,
              selected_periode: "new",
            },
          });
        }
        return;
      }

      // Ambil data dari database untuk periode yang dipilih
      const response = await getOfficialsByPeriode(token, periode);

      // Simpan data periode sebelumnya sebelum mengupdate
      const previousPeriode = selectedPeriode;
      const previousData = officialsData;

      try {
        // Update form session untuk data yang baru dipilih
        for (const official of response.data) {
          try {
            console.log("Updating official session:", {
              officialId: official.id,
              sessionId: sessionId,
            });

            await axiosInstance.put(`/update-official-session/${official.id}`, {
              form_session_id: sessionId,
            });
          } catch (error) {
            console.error("Failed to update official session:", error);
            // Revert changes
            setOfficialsData(previousData);
            setSelectedPeriode(previousPeriode);
            throw error;
          }
        }

        // Jika semua updates berhasil, update state
        setOfficialsData(response.data);
        setIsFromDatabase(true);
        setIsSaved(false);
        setIsEditMode(false);

        // Update session temp data
        if (sessionId) {
          await axiosInstance.put(`/update-session/${sessionId}`, {
            temp_data: {
              official: response.data,
              selected_periode: periode,
            },
          });
        }
      } catch (error) {
        setError("Gagal mengupdate data pejabat");
        console.error("Error updating officials:", error);
      }
    } catch (error) {
      console.error("Failed to fetch officials:", error);
      setError("Gagal mengambil data pejabat untuk periode yang dipilih");
    }
  };

  const handleInputChange = (
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

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitted(true);

    // Validasi
    const hasEmptyFields = officialsData.some((official) => {
      const basicFieldsEmpty = !official.nip || !official.nama;
      const isPPK = official.jabatan.includes("Pejabat Pembuat Komitmen");
      const skEmpty = isPPK && !official.surat_keputusan;
      return basicFieldsEmpty || skEmpty;
    });

    if (hasEmptyFields) {
      setError("Mohon lengkapi semua input");
      return;
    }

    // Cek duplikasi NIP dalam form
    const nips = officialsData.map((official) => official.nip);
    const uniqueNips = new Set(nips);
    if (nips.length !== uniqueNips.size) {
      setError("NIP tidak boleh sama antar pejabat");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      if (isFromDatabase) {
        // Logic untuk data dari database tetap sama
        for (const official of officialsData) {
          if (!official.id) {
            throw new Error("ID official tidak ditemukan untuk update");
          }
          await axiosInstance.put(`/update-official-session/${official.id}`, {
            form_session_id: sessionId,
            current_session_id: sessionId,
          });
        }
      } else {
        // Kirim semua data official sekaligus
        if (isEditMode) {
          // Update existing officials
          for (const official of officialsData) {
            if (!official.id) {
              throw new Error("ID official tidak ditemukan untuk update");
            }
            await updateOfficial(token, official.id, {
              ...official,
              periode_jabatan:
                selectedPeriode === "new"
                  ? officialsData[0].periode_jabatan
                  : selectedPeriode,
            });
          }
        } else {
          // Save new officials dalam satu request
          await addOfficial(
            token,
            officialsData.map((official) => ({
              ...official,
              periode_jabatan:
                selectedPeriode === "new"
                  ? officialsData[0].periode_jabatan
                  : selectedPeriode,
            }))
          );
        }
      }

      // Update state setelah berhasil save/update
      setIsSaved(true);
      setIsEditMode(false);
      setShowSuccessAlert(true);
      setAlertType(isEditMode ? "edit" : "save");

      // Refresh data
      const response = await getOfficialData();
      if (response.data.officials) {
        setOfficialsData(response.data.officials);
      }

      setTimeout(() => {
        setShowSuccessAlert(false);
        setAlertType(null);
      }, 3000);
    } catch (error) {
      setShowSuccessAlert(false);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan");
      }
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setIsSaved(false);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch periodes dan urutkan
        const periodesResponse = await getPeriodes(token);
        const sortedPeriodes = periodesResponse.data.sort((a, b) => {
          // Mengasumsikan format periode adalah angka tahun (e.g. "2024", "2023")
          // Urutkan secara descending (terbaru ke terlama)
          return parseInt(b) - parseInt(a);
        });
        setPeriodes(sortedPeriodes);

        // Rest of the code remains the same...
        const officialsResponse = await getOfficialData();
        const { officials, session } = officialsResponse.data;

        setSessionId(session.id);

        if (officials && officials.length > 0) {
          setOfficialsData(officials);
          setIsSaved(true);
          if (officials[0]?.periode_jabatan) {
            setSelectedPeriode(officials[0].periode_jabatan);
          }
        } else if (session.temp_data?.official) {
          setOfficialsData(session.temp_data.official);
          if (session.temp_data.official[0]?.periode_jabatan) {
            const periode = session.temp_data.official[0].periode_jabatan;
            const isExistingPeriode = sortedPeriodes.includes(periode); // Gunakan sortedPeriodes
            setSelectedPeriode(isExistingPeriode ? periode : "new");
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
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
            ? "Data pejabat berhasil disimpan!"
            : alertType === "edit"
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
                  disabled={isSaved && !isEditMode}
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
                    onChange={async (e) => {
                      const newPeriode = e.target.value;
                      const newOfficialsData = officialsData.map(
                        (official) => ({
                          ...official,
                          periode_jabatan: newPeriode,
                        })
                      );
                      setOfficialsData(newOfficialsData);

                      // Update temp_data in session
                      if (sessionId) {
                        try {
                          await axiosInstance.put(
                            `/update-session/${sessionId}`,
                            {
                              temp_data: {
                                official: newOfficialsData,
                                selected_periode: "new",
                              },
                            }
                          );
                        } catch (error) {
                          console.error("Failed to update session:", error);
                        }
                      }
                    }}
                    disabled={isSaved && !isEditMode}
                    className={
                      isSubmitted && !officialsData[0]?.periode_jabatan
                        ? "border-red-300"
                        : ""
                    }
                  />
                  {isSubmitted && !officialsData[0]?.periode_jabatan && (
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
                      handleInputChange(index, "nip", e.target.value)
                    }
                    className={
                      isSubmitted && !official.nip ? "border-red-300" : ""
                    }
                    disabled={isFromDatabase || (isSaved && !isEditMode)}
                  />
                  {isSubmitted && !official.nip && (
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
                      handleInputChange(index, "nama", e.target.value)
                    }
                    className={
                      isSubmitted && !official.nama ? "border-red-300" : ""
                    }
                    disabled={isFromDatabase || (isSaved && !isEditMode)}
                  />
                  {isSubmitted && !official.nama && (
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
                        handleInputChange(
                          index,
                          "surat_keputusan",
                          e.target.value
                        )
                      }
                      className={
                        isSubmitted && !official.surat_keputusan
                          ? "border-red-300"
                          : ""
                      }
                      disabled={isFromDatabase || (isSaved && !isEditMode)}
                    />
                    {isSubmitted && !official.surat_keputusan && (
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
                isEditMode
                  ? handleSubmit
                  : !isSaved
                  ? handleSubmit
                  : handleEditMode
              }
              variant={isEditMode ? "secondary" : "default"}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              ) : !isSaved ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isFromDatabase ? "Gunakan Data" : "Simpan"}
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
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
                disabled={!isSaved || isEditMode}
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
