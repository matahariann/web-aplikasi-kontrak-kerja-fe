import React, { useState } from "react";
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  ImageRun,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import {
  ContractData,
  DocumentData,
  VendorData,
  OfficialData,
  getImage,
} from "@/services/employee";

interface GenerateDocumentProps {
  vendorData: VendorData;
  contractData: ContractData;
  documentData: DocumentData;
  officialData: OfficialData[]; // Add this line
}

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

interface PrintContractProps {
  contractsData: ContractData[];
  documentData: DocumentData;
  vendorData: VendorData;
  officialData: OfficialData[]; // Add this line
  isContractsSaved: boolean;
  isContractsEditMode: boolean;
  onError: (error: string) => void;
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

const PrintDialog = ({ isOpen, onClose, onConfirm }: PrintDialogProps) => {
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

export const generateContractDocument = async ({
  contractData,
  officialData,
  documentData,
  vendorData,
}: GenerateDocumentProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  try {
    // Ambil data gambar
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    const imageData = await getImage(token, 1);
    console.log("Image data received:", imageData); // Debug log

    // Asumsikan imageData.image sudah dalam format base64
    // Jika belum, backend perlu dimodifikasi untuk mengirim data base64

    const vendorSection = new Paragraph({
      children: [
        new TextRun({ text: "DATA VENDOR", bold: true, break: 2 }),
        new TextRun({
          text: `Nama Vendor: ${vendorData.nama_vendor}`,
          break: 1,
        }),
        new TextRun({ text: `Alamat: ${vendorData.alamat_vendor}`, break: 1 }),
        new TextRun({ text: `NPWP: ${vendorData.npwp}`, break: 1 }),
        new TextRun({ text: `Bank: ${vendorData.bank_vendor}`, break: 1 }),
        new TextRun({
          text: `No. Rekening: ${vendorData.norek_vendor}`,
          break: 1,
        }),
        new TextRun({
          text: `Nama Rekening: ${vendorData.nama_rek_vendor}`,
          break: 1,
        }),
      ],
    });

    const contractSection = new Paragraph({
      children: [
        new TextRun({ text: "DATA KONTRAK", bold: true, break: 2 }),
        new TextRun({
          text: `Jenis Kontrak: ${contractData.jenis_kontrak}`,
          break: 1,
        }),
        new TextRun({ text: `Deskripsi: ${contractData.deskripsi}`, break: 1 }),
        new TextRun({
          text: `Jumlah Orang: ${contractData.jumlah_orang}`,
          break: 1,
        }),
        new TextRun({
          text: `Durasi Kontrak: ${contractData.durasi_kontrak} bulan`,
          break: 1,
        }),
        new TextRun({
          text: `Nilai Kontrak Awal: ${formatCurrency(
            contractData.nilai_kontral_awal
          )}`,
          break: 1,
        }),
        new TextRun({
          text: `Nilai Kontrak Akhir: ${formatCurrency(
            contractData.nilai_kontrak_akhir
          )}`,
          break: 1,
        }),
      ],
    });

    const documentSection = new Paragraph({
      children: [
        new TextRun({ text: "DATA DOKUMEN", bold: true, break: 2 }),
        new TextRun({
          text: `Nomor Kontrak: ${documentData.nomor_kontrak}`,
          break: 1,
        }),
        new TextRun({
          text: `Tanggal Kontrak: ${formatDate(documentData.tanggal_kontrak)}`,
          break: 1,
        }),
        new TextRun({
          text: `Paket Pekerjaan: ${documentData.paket_pekerjaan}`,
          break: 1,
        }),
        new TextRun({
          text: `Tahun Anggaran: ${documentData.tahun_anggaran}`,
          break: 1,
        }),
        new TextRun({
          text: `Nomor DIPA: ${documentData.nomor_dipa}`,
          break: 1,
        }),
        new TextRun({
          text: `Tanggal DIPA: ${formatDate(documentData.tanggal_dipa)}`,
          break: 1,
        }),
      ],
    });

    // Create officials section
    const officialsSection = new Paragraph({
      children: [
        new TextRun({ text: "DATA PEJABAT", bold: true, break: 2 }),
        ...officialData.map(
          (official) =>
            new TextRun({
              text: `${official.nama} - ${official.jabatan} (${official.nip})`,
              break: 1,
            })
        ),
      ],
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            // Header with logo
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new ImageRun({
                  data: imageData.image,
                  transformation: {
                    width: 200,
                    height: 100,
                  },
                }),
              ],
            }),
            // Title
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: "SURAT PERINTAH KERJA",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            // Data sections
            vendorSection,
            contractSection,
            documentSection,
            officialsSection,
          ],
        },
      ],
    });

    return doc;
  } catch (error) {
    console.error("Error generating document with image:", error);
    throw new Error(
      "Gagal membuat dokumen: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};

export const PrintContract: React.FC<PrintContractProps> = ({
  contractsData,
  documentData,
  vendorData,
  officialData, // Add this line
  isContractsSaved,
  isContractsEditMode,
  onError,
}) => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isPrintConfirmationOpen, setIsPrintConfirmationOpen] = useState(false);

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
        onError("Nama file harus diisi");
        return;
      }

      // Generate dokumen untuk setiap kontrak
      for (let i = 0; i < contractsData.length; i++) {
        const contract = contractsData[i];
        const doc = await generateContractDocument({
          contractData: contract,
          documentData: documentData,
          vendorData: vendorData,
          officialData: officialData, // Add this line
        });
        const blob = await Packer.toBlob(doc);

        const sanitizedFilename = filename
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fullFilename = `${sanitizedFilename}${
          i > 0 ? `_${i + 1}` : ""
        }.docx`;

        saveAs(blob, fullFilename);
      }

      setIsPrintDialogOpen(false);

      // Refresh halaman setelah delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error generating document:", error);
      onError("Terjadi kesalahan saat mencetak dokumen");
    }
  };

  if (!isContractsSaved || isContractsEditMode) {
    return null;
  }

  return (
    <>
      <Button variant="outline" onClick={handlePrintClick}>
        <Printer className="w-4 h-4 mr-2" />
        Cetak
      </Button>

      <PrintConfirmationDialog
        isOpen={isPrintConfirmationOpen}
        onClose={() => setIsPrintConfirmationOpen(false)}
        onConfirm={handlePrintConfirmed}
      />

      <PrintDialog
        isOpen={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        onConfirm={handlePrint}
      />
    </>
  );
};
