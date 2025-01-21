"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowRight, Pencil, Minus, Plus } from "lucide-react";
import {
  VendorData,
  getVendorData,
  addVendor,
  updateVendor,
  deleteVendor,
} from "@/services/vendor";

const INITIAL_VENDOR: VendorData = {
  nama_vendor: "",
  alamat_vendor: "",
  nama_pj: "",
  jabatan_pj: "",
  npwp: "",
  bank_vendor: "",
  norek_vendor: "",
  nama_rek_vendor: "",
};

const VendorForm = ({ currentStep, setCurrentStep }) => {
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vendorAlertType, setVendorAlertType] = useState<
    "save" | "edit" | null
  >(null);
  const [vendorShowSuccessAlert, setVendorShowSuccessAlert] = useState(false);
  const [isVendorSubmitted, setIsVendorSubmitted] = useState(false);
  const [isVendorSaved, setIsVendorSaved] = useState(false);
  const [formSessionId, setFormSessionId] = useState<string | null>(null);
  const [vendorsData, setVendorsData] = useState<VendorData[]>([
    INITIAL_VENDOR,
  ]);

  const addNewVendor = () => {
    setVendorsData([...vendorsData, { ...INITIAL_VENDOR }]);
  };

  const removeVendor = async (index: number) => {
    try {
      const vendorToRemove = vendorsData[index];

      if (vendorsData.length <= 1) {
        setVendorError("Harus ada minimal satu vendor");
        return;
      }

      if (vendorToRemove.id) {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        // Delete from database
        await deleteVendor(token, String(vendorToRemove.id));
      }

      // Update local state
      const newVendorsData = vendorsData.filter((_, i) => i !== index);
      setVendorsData(newVendorsData);
    } catch (error) {
      setVendorError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus vendor"
      );
    }
  };

  const handleVendorInputChange = (
    index: number,
    field: keyof VendorData,
    value: string
  ) => {
    const newVendorsData = [...vendorsData];
    newVendorsData[index] = {
      ...newVendorsData[index],
      [field]: value,
    };
    setVendorsData(newVendorsData);
  };

  const handleVendorSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setVendorError(null);
    setIsVendorSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      // Validate required fields
      const requiredFields: (keyof VendorData)[] = [
        "nama_vendor",
        "alamat_vendor",
        "nama_pj",
        "jabatan_pj",
        "npwp",
        "bank_vendor",
        "norek_vendor",
        "nama_rek_vendor",
      ];

      const hasEmptyFields = vendorsData.some((vendor) =>
        requiredFields.some((field) => !vendor[field])
      );

      if (hasEmptyFields) {
        setVendorError("Mohon lengkapi semua input");
        return;
      }

      if (isEditMode) {
        // Prepare vendor data
        const vendorsWithId = vendorsData.map((vendor) => ({
          ...vendor,
          id: vendor.id ? String(vendor.id) : undefined,
        }));

        // Update existing vendors
        const response = await updateVendor(token, vendorsWithId);

        if (response.data.vendors) {
          setVendorsData(
            Array.isArray(response.data.vendors)
              ? response.data.vendors
              : [response.data.vendors]
          );
        }
      } else {
        // Add new vendors one by one
        for (const vendor of vendorsData) {
          const response = await addVendor(token, vendor); // Kirim single vendor
          if (response.data.session?.id && !formSessionId) {
            setFormSessionId(response.data.session.id);
          }
        }

        // Fetch updated vendors list after adding all
        const response = await getVendorData();
        if (response.data.vendors) {
          setVendorsData(
            Array.isArray(response.data.vendors)
              ? response.data.vendors
              : [response.data.vendors]
          );
        }
      }

      setIsVendorSaved(true);
      setIsEditMode(false);
      setVendorShowSuccessAlert(true);
      setVendorAlertType(isEditMode ? "edit" : "save");
      setIsVendorSubmitted(false);

      setTimeout(() => {
        setVendorShowSuccessAlert(false);
        setVendorAlertType(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting vendor:", error);
      setVendorShowSuccessAlert(false);
      setVendorError(
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setIsVendorSaved(false);
  };

  const handleNext = () => {
    if (isVendorSaved && !isEditMode) {
      setCurrentStep(2);
    }
  };

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await getVendorData();
        const { vendors, session } = response.data;

        setFormSessionId(session.id);

        if (vendors?.length > 0) {
          setVendorsData(vendors);
          setIsVendorSaved(true);
        } else if (session.temp_data?.vendors) {
          setVendorsData(session.temp_data.vendors);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchVendorData();
  }, []);

  return (
    <>
      {vendorError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {vendorError}
        </div>
      )}

      {vendorShowSuccessAlert && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          {vendorAlertType === "save"
            ? "Data vendor berhasil disimpan!"
            : vendorAlertType === "edit"
            ? "Data vendor berhasil diperbarui!"
            : ""}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Data Vendor</span>
            {(!isVendorSaved || isEditMode) && (
              <Button onClick={addNewVendor} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Vendor
              </Button>
            )}
          </CardTitle>
          <p className="text-sm text-red-500">*Wajib diisi</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {vendorsData.map((vendor, index) => (
            <div key={index} className="border p-4 rounded-lg relative">
              {index !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 hover:bg-red-100"
                  onClick={() => removeVendor(index)}
                  disabled={isVendorSaved && !isEditMode}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}

              <h3 className="font-medium mb-4">Data Vendor {index + 1}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`nama_vendor_${index}`}>
                    Nama Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nama_vendor_${index}`}
                    value={vendor.nama_vendor}
                    onChange={(e) =>
                      handleVendorInputChange(
                        index,
                        "nama_vendor",
                        e.target.value
                      )
                    }
                    className={
                      isVendorSubmitted && !vendor.nama_vendor
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.nama_vendor && (
                    <p className="text-red-500 text-sm mt-1">
                      Nama Vendor tidak boleh kosong
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`alamat_vendor_${index}`}>
                    Alamat Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`alamat_vendor_${index}`}
                    value={vendor.alamat_vendor}
                    onChange={(e) =>
                      handleVendorInputChange(
                        index,
                        "alamat_vendor",
                        e.target.value
                      )
                    }
                    className={
                      isVendorSubmitted && !vendor.alamat_vendor
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.alamat_vendor && (
                    <p className="text-red-500 text-sm mt-1">
                      Alamat vendor tidak boleh kosong
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`nama_pj_${index}`}>
                    Nama Penanggung Jawab{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nama_pj_${index}`}
                    value={vendor.nama_pj}
                    onChange={(e) =>
                      handleVendorInputChange(index, "nama_pj", e.target.value)
                    }
                    className={
                      isVendorSubmitted && !vendor.nama_pj
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.nama_pj && (
                    <p className="text-red-500 text-sm mt-1">
                      Nama penanggung jawab tidak boleh kosong
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`jabatan_pj_${index}`}>
                    Jabatan Penanggung Jawab{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`jabatan_pj_${index}`}
                    value={vendor.jabatan_pj}
                    onChange={(e) =>
                      handleVendorInputChange(
                        index,
                        "jabatan_pj",
                        e.target.value
                      )
                    }
                    className={
                      isVendorSubmitted && !vendor.jabatan_pj
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.jabatan_pj && (
                    <p className="text-red-500 text-sm mt-1">
                      Jabatan penanggung jawab tidak boleh kosong
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`npwp_${index}`}>
                    NPWP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`npwp_${index}`}
                    value={vendor.npwp}
                    onChange={(e) =>
                      handleVendorInputChange(index, "npwp", e.target.value)
                    }
                    className={
                      isVendorSubmitted && !vendor.npwp ? "border-red-300" : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.npwp && (
                    <p className="text-red-500 text-sm mt-1">
                      NPWP tidak boleh kosong
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`bank_vendor_${index}`}>
                    Nama Bank Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`bank_vendor_${index}`}
                    value={vendor.bank_vendor}
                    onChange={(e) =>
                      handleVendorInputChange(
                        index,
                        "bank_vendor",
                        e.target.value
                      )
                    }
                    className={
                      isVendorSubmitted && !vendor.bank_vendor
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.bank_vendor && (
                    <p className="text-red-500 text-sm mt-1">
                      Nama bank vendor tidak boleh kosong
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`norek_vendor_${index}`}>
                    Nomor Rekening Vendor{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`norek_vendor_${index}`}
                    value={vendor.norek_vendor}
                    onChange={(e) =>
                      handleVendorInputChange(
                        index,
                        "norek_vendor",
                        e.target.value
                      )
                    }
                    className={
                      isVendorSubmitted && !vendor.norek_vendor
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.norek_vendor && (
                    <p className="text-red-500 text-sm mt-1">
                      Nomor rekening vendor tidak boleh kosong
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`nama_rek_vendor_${index}`}>
                    Nama Rekening Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`nama_rek_vendor_${index}`}
                    value={vendor.nama_rek_vendor}
                    onChange={(e) =>
                      handleVendorInputChange(
                        index,
                        "nama_rek_vendor",
                        e.target.value
                      )
                    }
                    className={
                      isVendorSubmitted && !vendor.nama_rek_vendor
                        ? "border-red-300"
                        : ""
                    }
                    disabled={isVendorSaved && !isEditMode}
                  />
                  {isVendorSubmitted && !vendor.nama_rek_vendor && (
                    <p className="text-red-500 text-sm mt-1">
                      Nama rekening vendor tidak boleh kosong
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button
              onClick={
                isVendorSaved && !isEditMode
                  ? handleEditMode
                  : handleVendorSubmit
              }
              variant={isEditMode ? "secondary" : "default"}
            >
              {isVendorSaved && !isEditMode ? (
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
            <Button
              onClick={handleNext}
              disabled={!isVendorSaved || isEditMode}
              style={{ userSelect: "none" }}
            >
              Berikutnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default VendorForm;
