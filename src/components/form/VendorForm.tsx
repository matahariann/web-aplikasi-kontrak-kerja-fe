"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowRight, Pencil } from "lucide-react";
import {
  VendorData,
  getVendorData,
  addVendor,
  updateVendor,
} from "@/services/vendor";


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
  const [vendorData, setVendorData] = useState<VendorData>({
    nama_vendor: "",
    alamat_vendor: "",
    nama_pj: "",
    jabatan_pj: "",
    npwp: "",
    bank_vendor: "",
    norek_vendor: "",
    nama_rek_vendor: "",
  });

  const handleVendorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setVendorData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleVendorSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setVendorError(null);
    setIsVendorSubmitted(true);

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

    const emptyFields = requiredFields.filter((field) => !vendorData[field]);

    if (emptyFields.length > 0) {
      setVendorError(`Mohon lengkapi semua input`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      let response;
      if (isEditMode) {
        response = await updateVendor(token, vendorData);
      } else {
        response = await addVendor(token, vendorData);
      }

      if (response) {
        setIsVendorSaved(true);
        setIsEditMode(false);
        setVendorShowSuccessAlert(true);
        setVendorAlertType(isEditMode ? "edit" : "save");
        setIsVendorSubmitted(false);

        if (response.data.session?.id) {
          setFormSessionId(response.data.session.id);
        }

        setTimeout(() => {
          setVendorShowSuccessAlert(false);
          setVendorAlertType(null);
        }, 3000);
      }
    } catch (error) {
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
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await getVendorData(token);
        const { vendor, session } = response.data;

        setFormSessionId(session.id);

        if (vendor) {
          setVendorData(vendor);
          setIsVendorSaved(true);
        } else if (session.temp_data?.vendor) {
          setVendorData(session.temp_data.vendor);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchVendorData();
  }, []);

  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEYS.VENDOR_DATA, JSON.stringify(vendorData));
  // }, [vendorData]);

  // useEffect(() => {
  //   localStorage.setItem(
  //     STORAGE_KEYS.IS_VENDOR_SAVED,
  //     JSON.stringify(isVendorSaved)
  //   );
  // }, [isVendorSaved]);

  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEYS.IS_EDIT_MODE, JSON.stringify(isEditMode));
  // }, [isEditMode]);

  // useEffect(() => {
  //   if (isVendorSaved && !isEditMode) {
  //     // Pastikan status tersimpan di localStorage
  //     localStorage.setItem(STORAGE_KEYS.IS_VENDOR_SAVED, "true");
  //     localStorage.setItem(STORAGE_KEYS.IS_EDIT_MODE, "false");
  //   }
  // }, [isVendorSaved, isEditMode]);

  // useEffect(() => {
  //   if (formSessionId) {
  //     localStorage.setItem("form_session_id", formSessionId);
  //   }
  // }, [formSessionId]);

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
          <CardTitle>Data Vendor</CardTitle>
          <p className="text-sm text-red-500">*Wajib diisi</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nama_vendor">
                Nama Vendor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama_vendor"
                value={vendorData.nama_vendor}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.nama_vendor
                    ? "border-red-300"
                    : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.nama_vendor && (
                <p className="text-red-500 text-sm mt-1">
                  Nama Vendor tidak boleh kosong
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="alamat_vendor">
                Alamat Vendor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="alamat_vendor"
                value={vendorData.alamat_vendor}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.alamat_vendor
                    ? "border-red-300"
                    : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.alamat_vendor && (
                <p className="text-red-500 text-sm mt-1">
                  Alamat vendor tidak boleh kosong
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="nama_pj">
                Nama Penanggung Jawab <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama_pj"
                value={vendorData.nama_pj}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.nama_pj
                    ? "border-red-300"
                    : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.nama_pj && (
                <p className="text-red-500 text-sm mt-1">
                  Nama penanggung jawab tidak boleh kosong
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="jabatan_pj">
                Jabatan Penanggung Jawab <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jabatan_pj"
                value={vendorData.jabatan_pj}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.jabatan_pj
                    ? "border-red-300"
                    : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.jabatan_pj && (
                <p className="text-red-500 text-sm mt-1">
                  Jabatan penanggung jawab tidak boleh kosong
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="npwp">
                NPWP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="npwp"
                value={vendorData.npwp}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.npwp ? "border-red-300" : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.npwp && (
                <p className="text-red-500 text-sm mt-1">
                  NPWP tidak boleh kosong
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="bank_vendor">
                Nama Bank Vendor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bank_vendor"
                value={vendorData.bank_vendor}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.bank_vendor
                    ? "border-red-300"
                    : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.bank_vendor && (
                <p className="text-red-500 text-sm mt-1">
                  Nama bank vendor tidak boleh kosong
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="norek_vendor">
                Nomor Rekening Vendor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="norek_vendor"
                value={vendorData.norek_vendor}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.norek_vendor
                    ? "border-red-300"
                    : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.norek_vendor && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor rekening vendor tidak boleh kosong
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="nama_rek_vendor">
                Nama Rekening Vendor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama_rek_vendor"
                value={vendorData.nama_rek_vendor}
                onChange={handleVendorInputChange}
                className={
                  isVendorSubmitted && !vendorData.nama_rek_vendor
                    ? "border-red-300"
                    : ""
                }
                disabled={isVendorSaved && !isEditMode}
              />
              {isVendorSubmitted && !vendorData.nama_rek_vendor && (
                <p className="text-red-500 text-sm mt-1">
                  Nama rekening vendor tidak boleh kosong
                </p>
              )}
            </div>
          </div>

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
