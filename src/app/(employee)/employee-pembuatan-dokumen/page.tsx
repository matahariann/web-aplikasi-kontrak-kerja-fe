"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Save, Printer, ArrowRight, ArrowLeft } from "lucide-react";
import OfficialsForm from "./officialForm";
import VendorForm from "./vendorForm";
import DocumentForm from "./documentForm";

const STORAGE_KEYS = {
  CURRENT_STEP: "currentStep",
};

export default function BuatDokumen() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
    return saved ? parseInt(saved) : 1;
  });

  const [documents, setDocuments] = useState({
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
  });

  const [contracts, setContracts] = useState([
    {
      nomor_kontrak: "",
      jenis_kontrak: "",
      deskripsi: "",
      jumlah_orang: "",
      durasi_kontrak: "",
      nilai_kontrak_awal: "",
      nilai_kontrak_akhir: "",
      id_vendor: "",
    },
  ]);

  const handleDocumentsSubmit = async () => {
    try {
      for (const doc of documents) {
        await axios.post("/api/documents", doc);
      }
    } catch (vendorError) {
      console.vendorError("Error saving documents:", vendorError);
    }
  };

  const handleContractsSubmit = async () => {
    try {
      for (const contract of contracts) {
        await axios.post("/api/contracts", contract);
      }
    } catch (vendorError) {
      console.vendorError("Error saving contracts:", vendorError);
    }
  };

  const handleGenerateDoc = () => {
    // Add logic to generate and download Word document
    console.log("Generating DOC file...");
  };

  const addContract = () => {
    setContracts([
      ...contracts,
      {
        nomor_kontrak: "",
        jenis_kontrak: "",
        deskripsi: "",
        jumlah_orang: "",
        durasi_kontrak: "",
        nilai_kontrak_awal: "",
        nilai_kontrak_akhir: "",
        id_vendor: contracts[0].id_vendor,
      },
    ]);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep.toString());
  }, [currentStep]);

  const renderDocumentsForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Dokumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nomor_kontrak">Nomor Kontrak</Label>
            <Input
              id="nomor_kontrak"
              value={documents.nomor_kontrak}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_kontrak: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_kontrak">Tanggal Kontrak</Label>
            <Input
              id="tanggal_kontrak"
              value={documents.tanggal_kontrak}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_kontrak: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="paket_pekerjaan">Nama Paket Pekerjaan</Label>
            <Input
              id="paket_pekerjaan"
              value={documents.paket_pekerjaan}
              onChange={(e) =>
                setDocuments({ ...documents, paket_pekerjaan: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tahun_anggaran">Tahun Anggaran</Label>
            <Input
              id="tahun_anggaran"
              value={documents.tahun_anggaran}
              onChange={(e) =>
                setDocuments({ ...documents, tahun_anggaran: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_pp">Nomor Surat Pelaksanaan Pekerjaan</Label>
            <Input
              id="nomor_pp"
              value={documents.nomor_pp}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_pp: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_pp">
              Tanggal Surat Pelaksanaan Pekerjaan
            </Label>
            <Input
              id="tanggal_pp"
              value={documents.tanggal_pp}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_pp: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_hps">
              Nomor Surat Harga Perkiraan Sendiri
            </Label>
            <Input
              id="nomor_hps"
              value={documents.nomor_hps}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_hps: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_hps">
              Tanggal Surat Harga Perkiraan Sendiri
            </Label>
            <Input
              id="tanggal_hps"
              value={documents.tanggal_hps}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_hps: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_mulai">Tanggal Mulai Pekerjaan</Label>
            <Input
              id="tanggal_mulai"
              value={documents.tanggal_mulai}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_mulai: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_selesai">Tanggal Selesai Pekerjaan</Label>
            <Input
              id="tanggal_selesai"
              value={documents.tanggal_selesai}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_selesai: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_pph1">
              Nomor Surat Permintaan Penawaran Harga 1
            </Label>
            <Input
              id="nomor_pph1"
              value={documents.nomor_pph1}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_pph1: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_pph1">
              Tanggal Surat Permintaan Penawaran Harga 1
            </Label>
            <Input
              id="tanggal_pph1"
              value={documents.tanggal_pph1}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_pph1: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_pph2">
              Nomor Surat Permintaan Penawaran Harga 2
            </Label>
            <Input
              id="nomor_pph2"
              value={documents.nomor_pph2}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_pph2: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_pph2">
              Tanggal Surat Permintaan Penawaran Harga 2
            </Label>
            <Input
              id="tanggal_pph2"
              value={documents.tanggal_pph2}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_pph2: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_ukn">
              Nomor Surat Undangan Klarifikasi dan Negosiasi
            </Label>
            <Input
              id="nomor_ukn"
              value={documents.nomor_ukn}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_ukn: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_ukn">
              Tanggal Surat Undangan Klarifikasi dan Negosiasi
            </Label>
            <Input
              id="tanggal_ukn"
              value={documents.nomor_ukn}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_ukn: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_undangan_ukn">
              Tanggal Undangan Klarifikasi dan Negosiasi
            </Label>
            <Input
              id="tanggal_undangan_ukn"
              value={documents.tanggal_undangan_ukn}
              onChange={(e) =>
                setDocuments({
                  ...documents,
                  tanggal_undangan_ukn: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_ba_ekn">
              Nomor Surat Berita Acara Evaluasi, Klarifikasi, dan Negosiasi
            </Label>
            <Input
              id="nomor_ba_ekn"
              value={documents.nomor_ba_ekn}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_ukn: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_pppb">
              Nomor Surat Penetapan Pelaksanaan Penyedia Barang/Jasa
            </Label>
            <Input
              id="nomor_pppb"
              value={documents.nomor_pppb}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_pppb: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_pppb">
              Tanggal Surat Penetapan Pelaksanaan Penyedia Barang/Jasa
            </Label>
            <Input
              id="tanggal_pppb"
              value={documents.tanggal_pppb}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_pppb: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_lppb">
              Nomor Surat Laporan Pelaksanaan Pengadaan Barang/Jasa
            </Label>
            <Input
              id="nomor_lppb"
              value={documents.nomor_lppb}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_lppb: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_lppb">
              Tanggal Surat Laporan Pelaksanaan Pengadaan Barang/Jasa
            </Label>
            <Input
              id="tanggal_lppb"
              value={documents.tanggal_lppb}
              onChange={(e) =>
                setDocuments({ ...documents, tanggal_lppb: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_ba_stp">
              Nomor Surat Berita Acara Serah Terima Pekerjaan
            </Label>
            <Input
              id="nomor_ba_stp"
              value={documents.nomor_ba_stp}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_ba_stp: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_ba_pem">
              Nomor Surat Berita Acara Pembayaran
            </Label>
            <Input
              id="nomor_ba_pem"
              value={documents.nomor_ba_pem}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_ba_pem: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="nomor_dipa">Nomor DIPA</Label>
            <Input
              id="nomor_dipa"
              value={documents.nomor_dipa}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_dipa: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="tanggal_dipa">Tanggal DIPA</Label>
            <Input
              id="tanggal_dipa"
              value={documents.nomor_dipa}
              onChange={(e) =>
                setDocuments({ ...documents, nomor_dipa: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <Label htmlFor="kode_kegiatan">Kode Kegiatan</Label>
          <Input
            id="kode_kegiatan"
            value={documents.kode_kegiatan}
            onChange={(e) =>
              setDocuments({ ...documents, kode_kegiatan: e.target.value })
            }
          />
        </div>
        <div className="flex justify-between mt-6">
          <div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sebelumnya
            </Button>
            <Button onClick={() => setCurrentStep(4)}>
              Berikutnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContractForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Data Konrak</span>
          <Button onClick={addContract} variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Kontrak
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.map((contract, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-medium mb-4">Deskripsi Kontrak {index + 1}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`jenis_kontrak_${index}`}>Jenis Kontrak</Label>
                <Input
                  id={`jenis_kontrak_${index}`}
                  value={contract.jenis_kontrak}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      jenis_kontrak: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`Deskripsi_${index}`}>Deskripsi</Label>
                <Input
                  id={`deskripsi_${index}`}
                  value={contract.deskripsi}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      deskripsi: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`jumlah_orang_${index}`}>Jumlah Orang</Label>
                <Input
                  id={`jumlah_orang_${index}`}
                  value={contract.jumlah_orang}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      jumlah_orang: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`durasi_kontrak_${index}`}>
                  Durasi Kontrak
                </Label>
                <Input
                  id={`durasi_kontrak_${index}`}
                  value={contract.durasi_kontrak}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      durasi_kontrak: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`nilai_kontrak_awal_${index}`}>
                  Harga Sebelum Negosiasi
                </Label>
                <Input
                  id={`nilai_kontrak_awal_${index}`}
                  value={contract.nilai_kontrak_awal}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      nilai_kontrak_awal: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`nilai_kontrak_akhir_${index}`}>
                  Harga Setelah Negosiasi
                </Label>
                <Input
                  id={`nilai_kontrak_akhir_${index}`}
                  value={contract.nilai_kontrak_akhir}
                  onChange={(e) => {
                    const updatedContracts = [...contracts];
                    updatedContracts[index] = {
                      ...contract,
                      nilai_kontrak_akhir: e.target.value,
                    };
                    setContracts(updatedContracts);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-6">
          <div className="flex space-x-4">
            <Button onClick={handleContractsSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
            <Button onClick={handleGenerateDoc}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
          </div>
          <div>
            <Button onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sebelumnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">Buat Dokumen</h1>
      {currentStep === 1 && (
        <VendorForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
      )}
      {currentStep === 2 && (
        <OfficialsForm
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}
      {/* {currentStep === 3 && renderDocumentsForm()} */}
      {currentStep === 3 && (
        <DocumentForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
      )}
      {currentStep === 4 && renderContractForm()}
    </div>
  );
}
