"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowRight, Pencil, ArrowLeft } from "lucide-react";
import {
  getDocumentData,
  DocumentData,
  updateDocument,
  addDocument,
  DocumentWithOfficialsData,
} from "@/services/documents";
import { getOfficialData } from "@/services/official";

const DocumentForm = ({ currentStep, setCurrentStep }) => {
  const [initialNomorKontrak, setInitialNomorKontrak] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertType, setAlertType] = useState<"save" | "edit" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData>({
    nomor_kontrak: "",
    tanggal_kontrak: "",
    paket_pekerjaan: "",
    tahun_anggaran: "",
    nomor_pp: "",
    tanggal_pp: "",
    nomor_hps: "",
    tanggal_hps: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    nomor_pph1: "",
    tanggal_pph1: "",
    nomor_pph2: "",
    tanggal_pph2: "",
    nomor_ukn: "",
    tanggal_ukn: "",
    tanggal_undangan_ukn: "",
    nomor_ba_ekn: "",
    nomor_pppb: "",
    tanggal_pppb: "",
    nomor_lppb: "",
    tanggal_lppb: "",
    nomor_ba_stp: "",
    nomor_ba_pem: "",
    nomor_dipa: "",
    tanggal_dipa: "",
    kode_kegiatan: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setDocumentData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitted(true);

    // Validasi
    const requiredFields = Object.keys(documentData) as (keyof DocumentData)[];
    const emptyFields = requiredFields.filter((field) => !documentData[field]);

    if (emptyFields.length > 0) {
      setError(`Mohon lengkapi semua input`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Prepare data
      const officialsResponse = await getOfficialData(token);
      const officials = officialsResponse.data.officials;

      const data: DocumentWithOfficialsData = {
        officials: officials.map((off) => ({
          nip: off.nip,
          periode_jabatan: off.periode_jabatan,
        })),
        document: documentData,
      };

      let response;
      if (isEditMode) {
        // Gunakan nomor kontrak awal untuk endpoint update
        response = await updateDocument(token, initialNomorKontrak, data);
      } else {
        response = await addDocument(token, data);
      }

      setIsSaved(true);
      setIsEditMode(false);
      setShowSuccessAlert(true);
      setAlertType(isEditMode ? "edit" : "save");

      // Update document data dan nomor kontrak awal dengan response
      if (response.data.document) {
        setDocumentData(response.data.document);
        setInitialNomorKontrak(response.data.document.nomor_kontrak);
      }

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

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await getDocumentData();
        const { document, session } = response.data;

        if (document) {
          setDocumentData(document);
          setInitialNomorKontrak(document.nomor_kontrak); // Simpan nomor kontrak awal
          setIsSaved(true);
        } else if (session.temp_data?.document) {
          setDocumentData(session.temp_data.document);
          setInitialNomorKontrak(session.temp_data.document.nomor_kontrak);
        }
      } catch (error) {
        console.error("Error fetching document data:", error);
        setError("Gagal mengambil data dokumen");
      }
    };

    fetchDocumentData();
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
            ? "Data dokumen berhasil disimpan!"
            : alertType === "edit"
            ? "Data dokumen berhasil diperbarui!"
            : ""}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Data Dokumen</CardTitle>
          <p className="text-sm text-red-500">*Wajib diisi</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomor_kontrak">
                Nomor Kontrak <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_kontrak"
                value={documentData.nomor_kontrak}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_kontrak
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_kontrak && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor kontrak tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_kontrak">
                Tanggal Kontrak <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_kontrak"
                type="date"
                value={documentData.tanggal_kontrak}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_kontrak
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_kontrak && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal kontrak tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="paket_pekerjaan">
                Paket Pekerjaan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paket_pekerjaan"
                value={documentData.paket_pekerjaan}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.paket_pekerjaan
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.paket_pekerjaan && (
                <p className="text-red-500 text-sm mt-1">
                  Paket pekerjaan tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tahun_anggaran">
                Tahun Anggaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tahun_anggaran"
                value={documentData.tahun_anggaran}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tahun_anggaran
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tahun_anggaran && (
                <p className="text-red-500 text-sm mt-1">
                  Tahun anggaran tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_pp">
                Nomor Surat Pelaksanaan Pekerjaan{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_pp"
                value={documentData.nomor_pp}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_pp ? "border-red-300" : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_pp && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Pelaksanaan Pekerjaan tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_pp">
                Tanggal Surat Pelaksanaan Pekerjaan{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_pp"
                type="date"
                value={documentData.tanggal_pp}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_pp
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_pp && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Surat Pelaksanaan Pekerjaan tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_hps">
                Nomor Surat Harga Perkiraan Sendiri{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_hps"
                value={documentData.nomor_hps}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_hps ? "border-red-300" : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_hps && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Harga Perkiraan Sendiri tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_hps">
                Tanggal Surat Harga Perkiraan Sendiri{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_hps"
                type="date"
                value={documentData.tanggal_hps}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_hps
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_hps && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Surat Harga Perkiraan Sendiri tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_mulai">
                Tanggal Mulai Pekerjaan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_mulai"
                type="date"
                value={documentData.tanggal_mulai}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_mulai
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_mulai && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Mulai Pekerjaan tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_selesai">
                Tanggal Selesai Pekerjaan{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_selesai"
                type="date"
                value={documentData.tanggal_selesai}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_selesai
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_selesai && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Selesai Pekerjaan tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_pph1">
                Nomor Surat Permintaan Penawaran Harga 1{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_pph1"
                value={documentData.nomor_pph1}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_pph1
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_pph1 && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Permintaan Penawaran Harga 1 tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_pph1">
                Tanggal Surat Permintaan Penawaran Harga 1{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_pph1"
                type="date"
                value={documentData.tanggal_pph1}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_pph1
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_pph1 && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Surat Permintaan Penawaran Harga 1 tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_pph2">
                Nomor Surat Permintaan Penawaran Harga 2{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_pph2"
                value={documentData.nomor_pph2}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_pph2
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_pph2 && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Permintaan Penawaran Harga 2 tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_pph2">
                Tanggal Surat Permintaan Penawaran Harga 2{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_pph2"
                type="date"
                value={documentData.tanggal_pph2}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_pph2
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_pph2 && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Surat Permintaan Penawaran Harga 2 tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_ukn">
                Nomor Surat Undangan Klarifikasi dan Negosiasi{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_ukn"
                value={documentData.nomor_ukn}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_ukn ? "border-red-300" : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_ukn && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Undangan Klarifikasi dan Negosiasi tidak boleh
                  kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_ukn">
                Tanggal Surat Undangan Klarifikasi dan Negosiasi{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_ukn"
                type="date"
                value={documentData.tanggal_ukn}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_ukn
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_ukn && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Surat Undangan Klarifikasi dan Negosiasi tidak boleh
                  kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_undangan_ukn">
                Tanggal Undangan Surat Undangan Klarifikasi dan Negosiasi{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_undangan_ukn"
                type="date"
                value={documentData.tanggal_undangan_ukn}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_undangan_ukn
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_undangan_ukn && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Undangan Surat Undangan Klarifikasi dan Negosiasi
                  tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_ba_ekn">
                Nomor Surat Berita Acara Evaluasi, Klarifikasi, dan Negosiasi{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_ba_ekn"
                value={documentData.nomor_ba_ekn}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_ba_ekn
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_ba_ekn && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Berita Acara Evaluasi, Klarifikasi, dan Negosiasi
                  tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_pppb">
                Nomor Surat Penetapan Pelaksanaan Penyedia Barang/Jasa{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_pppb"
                value={documentData.nomor_pppb}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_pppb
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_pppb && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Penetapan Pelaksanaan Penyedia Barang/Jasa tidak
                  boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_pppb">
                Tanggal Surat Penetapan Pelaksanaan Penyedia Barang/Jasa{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_pppb"
                type="date"
                value={documentData.tanggal_pppb}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_pppb
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_pppb && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Penetapan Pelaksanaan Penyedia Barang/Jasa tidak
                  boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_lppb">
                Nomor Surat Laporan Pelaksanaan Pengadaan Barang/Jasa{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_lppb"
                value={documentData.nomor_lppb}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_lppb
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_lppb && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Laporan Pelaksanaan Pengadaan Barang/Jasa tidak
                  boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_lppb">
                Tanggal Surat Laporan Pelaksanaan Pengadaan Barang/Jasa{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_lppb"
                type="date"
                value={documentData.tanggal_lppb}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_lppb
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_lppb && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal Surat Laporan Pelaksanaan Pengadaan Barang/Jasa tidak
                  boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_ba_stp">
                Nomor Surat Berita Acara Serah Terima Pekerjaan{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_ba_stp"
                value={documentData.nomor_ba_stp}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_ba_stp
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_ba_stp && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Berita Acara Serah Terima Pekerjaan tidak boleh
                  kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_ba_pem">
                Nomor Surat Berita Acara Pembayaran{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_ba_pem"
                value={documentData.nomor_ba_pem}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_ba_pem
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_ba_pem && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor Surat Berita Acara Pembayaran tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nomor_dipa">
                Nomor DIPA <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_dipa"
                value={documentData.nomor_dipa}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.nomor_dipa
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.nomor_dipa && (
                <p className="text-red-500 text-sm mt-1">
                  Nomor DIPA tidak boleh kosong
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal_dipa">
                Tanggal DIPA <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_dipa"
                type="date"
                value={documentData.tanggal_dipa}
                onChange={handleInputChange}
                className={
                  isSubmitted && !documentData.tanggal_dipa
                    ? "border-red-300"
                    : ""
                }
                disabled={isSaved && !isEditMode}
              />
              {isSubmitted && !documentData.tanggal_dipa && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal DIPA tidak boleh kosong
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="kode_kegiatan">
              Kode Kegiatan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="kode_kegiatan"
              value={documentData.kode_kegiatan}
              onChange={handleInputChange}
              className={
                isSubmitted && !documentData.kode_kegiatan
                  ? "border-red-300"
                  : ""
              }
              disabled={isSaved && !isEditMode}
            />
            {isSubmitted && !documentData.kode_kegiatan && (
              <p className="text-red-500 text-sm mt-1">
                Kode Kegiatan tidak boleh kosong
              </p>
            )}
          </div>

          <div className="flex justify-between mt-6">
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
            <div className="flex space-x-4">
              <Button onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
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

export default DocumentForm;
