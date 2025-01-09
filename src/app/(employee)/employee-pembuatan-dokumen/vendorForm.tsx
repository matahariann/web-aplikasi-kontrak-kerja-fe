"use client";
// import DocumentForm from '@/components/DocumentForm';
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Save,
  ArrowRight,
  Trash,
} from "lucide-react";
import { addVendor, deleteVendor, VendorData } from "@/services/employee";

const STORAGE_KEYS = {
  VENDOR_DATA: "vendorData",
  IS_VENDOR_SAVED: "isVendorSaved",
  SAVED_VENDOR_ID: "savedVendorId",
  CURRENT_STEP: "currentStep",
};

const VendorForm = ({ currentStep, setCurrentStep }) => {
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [vendorAlertType, setVendorAlertType] = useState<
    "save" | "delete" | null
  >(null);
  const [vendorShowSuccessAlert, setVendorShowSuccessAlert] = useState(false);
  const [isVendorSubmitted, setIsVendorSubmitted] = useState(false);
  const [isVendorSaved, setIsVendorSaved] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_VENDOR_SAVED);
    return saved ? JSON.parse(saved) : false;
  });
  const [savedVendorId, setSavedVendorId] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_VENDOR_ID);
    return saved ? JSON.parse(saved) : null;
  });
  const [vendorData, setVendorData] = useState<VendorData>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDOR_DATA);
    return saved
      ? JSON.parse(saved)
      : {
          nama_vendor: "",
          alamat_vendor: "",
          nama_pj: "",
          jabatan_pj: "",
          npwp: "",
          bank_vendor: "",
          norek_vendor: "",
          nama_rek_vendor: "",
        };
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

      const response = await addVendor(token, vendorData);

      if (response) {
        setVendorShowSuccessAlert(true);
        setVendorAlertType('save');
        setIsVendorSubmitted(false);
        setIsVendorSaved(true);
        setSavedVendorId(response.data.id);
        setTimeout(() => {
          setVendorShowSuccessAlert(false);
          setVendorAlertType(null);
        }, 3000);
      }
    } catch (vendorError) {
      setVendorShowSuccessAlert(false);
      setVendorError(vendorError instanceof Error ? vendorError.message : "Terjadi kesalahan");
    }
  };

  const handleVendorDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !savedVendorId) {
        throw new Error("Terjadi kesalahan");
      }

      await deleteVendor(token, savedVendorId);
      
      setIsVendorSaved(false);
      setSavedVendorId(null);
      // Don't clear vendorData to keep form values
      
      setVendorShowSuccessAlert(true);
      setVendorAlertType('delete');
      setTimeout(() => {
        setVendorShowSuccessAlert(false);
        setVendorAlertType(null);
      }, 3000);
    } catch (vendorError) {
      setVendorError(vendorError instanceof Error ? vendorError.message : "Terjadi kesalahan saat menghapus data");
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDOR_DATA, JSON.stringify(vendorData));
  }, [vendorData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_VENDOR_SAVED, JSON.stringify(isVendorSaved));
  }, [isVendorSaved]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_VENDOR_ID, JSON.stringify(savedVendorId));
  }, [savedVendorId]);

  return(
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
            : "Pembatalan data vendor berhasil!"}
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
                  isVendorSubmitted && !vendorData.nama_vendor ? "border-red-300" : ""
                }
                disabled={isVendorSaved}
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
                disabled={isVendorSaved}
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
                  isVendorSubmitted && !vendorData.nama_pj ? "border-red-300" : ""
                }
                disabled={isVendorSaved}
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
                  isVendorSubmitted && !vendorData.jabatan_pj ? "border-red-300" : ""
                }
                disabled={isVendorSaved}
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
                disabled={isVendorSaved}
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
                  isVendorSubmitted && !vendorData.bank_vendor ? "border-red-300" : ""
                }
                disabled={isVendorSaved}
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
                disabled={isVendorSaved}
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
                disabled={isVendorSaved}
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
              onClick={isVendorSaved ? handleVendorDelete : handleVendorSubmit}
              variant={isVendorSaved ? "destructive" : "default"}
            >
              {isVendorSaved ? (
                <>
                  <Trash className="w-4 h-4 mr-2"/>
                  Batalkan
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
            <Button onClick={() => setCurrentStep(2)} disabled={!isVendorSaved} style={{ userSelect: "none" }}>
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