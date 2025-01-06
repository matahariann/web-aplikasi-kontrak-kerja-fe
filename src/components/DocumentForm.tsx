// components/DocumentForm.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Save, Printer, ArrowRight } from "lucide-react";
import axios from "axios";

const DocumentForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorData, setVendorData] = useState({
    nama_vendor: "",
    alamat_vendor: "",
    nama_pj: "",
    jabatan_pj: "",
    npwp: "",
    bank_vendor: "",
    norek_vendor: "",
    nama_rek_vendor: "",
  });

  // Rest of the component code remains the same...
  // (Copy all the state declarations and functions from the previous component)
  const [officialsData, setOfficialsData] = useState([
    {
      nip: "",
      nama: "",
      jabatan: "Pejabat Pembuat Komitmen",
      periode_jabatan: "",
    },
    {
      nip: "",
      nama: "",
      jabatan: "Pejabat Pengadaan Barang/Jasa",
      periode_jabatan: "",
    },
  ]);

  const [documents, setDocuments] = useState([
    {
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
      id_vendor: "",
    },
  ]);

  const [contractData, setContractData] = useState({
    nomor_kontrak: "",
    jenis_kontrak: "",
    deskripsi: "",
    jumlah_orang: "",
    durasi_kontrak: "",
    nilai_kontral_awal: "",
    nilai_kontrak_akhir: "",
  });

  const handleVendorSubmit = async () => {
    try {
      const response = await axios.post("/api/vendors", vendorData);
      if (response.status === 201) {
        // Update form with vendor ID for documents
        setDocuments((docs) =>
          docs.map((doc) => ({
            ...doc,
            id_vendor: response.data.data.id,
          }))
        );
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  const handleOfficialsSubmit = async () => {
    try {
      for (const official of officialsData) {
        await axios.post("/api/officials", official);
      }
    } catch (error) {
      console.error("Error saving officials:", error);
    }
  };

  const handleDocumentsSubmit = async () => {
    try {
      for (const doc of documents) {
        await axios.post("/api/documents", doc);
      }
    } catch (error) {
      console.error("Error saving documents:", error);
    }
  };

  const handleContractSubmit = async () => {
    try {
      await axios.post("/api/contracts", contractData);
    } catch (error) {
      console.error("Error saving contract:", error);
    }
  };

  const handleGenerateDoc = () => {
    // Add logic to generate and download Word document
    console.log("Generating DOC file...");
  };

  const addDocument = () => {
    setDocuments([
      ...documents,
      {
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
        id_vendor: documents[0].id_vendor,
      },
    ]);
  };

  const renderVendorForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Vendor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nama_vendor">Nama Vendor</Label>
            <Input
              id="nama_vendor"
              value={vendorData.nama_vendor}
              onChange={(e) =>
                setVendorData({ ...vendorData, nama_vendor: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="alamat_vendor">Alamat Vendor</Label>
            <Input
              id="alamat_vendor"
              value={vendorData.alamat_vendor}
              onChange={(e) =>
                setVendorData({ ...vendorData, alamat_vendor: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nama_pj">Nama Penanggung Jawab</Label>
            <Input
              id="nama_pj"
              value={vendorData.nama_pj}
              onChange={(e) =>
                setVendorData({ ...vendorData, nama_pj: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="jabtan_pj">Jabatan Penanggung Jawab</Label>
            <Input
              id="jabatan_pj"
              value={vendorData.jabatan_pj}
              onChange={(e) =>
                setVendorData({ ...vendorData, jabatan_pj: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="npwp">NPWP</Label>
            <Input
              id="npwp"
              value={vendorData.npwp}
              onChange={(e) =>
                setVendorData({ ...vendorData, npwp: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="bank_vendor">Nama Bank Vendor</Label>
            <Input
              id="bank_vendor"
              value={vendorData.bank_vendor}
              onChange={(e) =>
                setVendorData({ ...vendorData, bank_vendor: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="norek_vendor">Nomor Rekening Vendor</Label>
            <Input
              id="norek_vendor"
              value={vendorData.norek_vendor}
              onChange={(e) =>
                setVendorData({ ...vendorData, norek_vendor: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nama_rek_vendor">Nama Rekening Vendor</Label>
            <Input
              id="nama_rek_vendor"
              value={vendorData.nama_rek_vendor}
              onChange={(e) =>
                setVendorData({ ...vendorData, nama_rek_vendor: e.target.value })
              }
            />
          </div>
          {/* Add other vendor fields */}
        </div>
        <div className="flex justify-between mt-6">
          <Button onClick={handleVendorSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
          <Button onClick={() => setCurrentStep(2)}>
            Berikutnya
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderOfficialsForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Pejabat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {officialsData.map((official, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-medium mb-4">{official.jabatan}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`nip_${index}`}>NIP</Label>
                <Input
                  id={`nip_${index}`}
                  value={official.nip}
                  onChange={(e) => {
                    const newOfficialsData = [...officialsData];
                    newOfficialsData[index].nip = e.target.value;
                    setOfficialsData(newOfficialsData);
                  }}
                />
              </div>
              {/* Add other official fields */}
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-6">
          <Button onClick={handleOfficialsSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
          <Button onClick={() => setCurrentStep(3)}>
            Berikutnya
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDocumentsForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Data Dokumen</span>
          <Button onClick={addDocument} variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Dokumen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {documents.map((doc, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-medium mb-4">Dokumen {index + 1}</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Add document fields */}
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-6">
          <Button onClick={handleDocumentsSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
          <Button onClick={() => setCurrentStep(4)}>
            Berikutnya
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContractForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Kontrak</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Add contract fields */}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleGenerateDoc}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between mb-8">
        <Button
          variant={currentStep === 1 ? "default" : "outline"}
          onClick={() => setCurrentStep(1)}
        >
          Vendor
        </Button>
        <Button
          variant={currentStep === 2 ? "default" : "outline"}
          onClick={() => setCurrentStep(2)}
        >
          Pejabat
        </Button>
        <Button
          variant={currentStep === 3 ? "default" : "outline"}
          onClick={() => setCurrentStep(3)}
        >
          Dokumen
        </Button>
        <Button
          variant={currentStep === 4 ? "default" : "outline"}
          onClick={() => setCurrentStep(4)}
        >
          Kontrak
        </Button>
      </div>

      {currentStep === 1 && renderVendorForm()}
      {currentStep === 2 && renderOfficialsForm()}
      {currentStep === 3 && renderDocumentsForm()}
      {currentStep === 4 && renderContractForm()}
    </div>
  );
};

export default DocumentForm;
