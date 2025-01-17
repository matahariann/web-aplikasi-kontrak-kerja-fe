import React, { useState } from "react";
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  ImageRun,
  BorderStyle,
  Header,
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
  getImage,
} from "@/services/employee";
import { VendorData } from "@/services/vendor";
import { OfficialData } from "@/services/official";
import { DocumentData, getDocumentData } from "@/services/documents";
import { ContractData } from "@/services/contract";


interface GenerateDocumentProps {
  vendorData: VendorData;
  contractsData: ContractData[];
  documentData: DocumentData;
  officialData: OfficialData[];
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
  officialData: OfficialData[];
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
            Apakah Anda yakin ingin mencetak dokumen? Setelah dicetak, sesi
            pembuatan dokumen akan selesai dan semua data form akan tereset.
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
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!filename.trim()) {
      setError("Nama file harus diisi");
      return;
    }
    setError(null);
    onConfirm(filename);
    setFilename("");
    onClose();
  };

  const handleClose = () => {
    setFilename("");
    setError(null);
    onClose();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Simpan Dokumen</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="filename">Nama File</Label>
          <Input
            id="filename"
            value={filename}
            onChange={(e) => {
              setFilename(e.target.value);
              setError(null); // Clear error when user types
            }}
            placeholder="Masukkan nama file"
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Simpan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const generateContractDocument = async ({
  contractsData,
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
    console.log("Image data received:", imageData);

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

    const contractsSection = new Paragraph({
      children: [
        new TextRun({ text: "DATA KONTRAK", bold: true, break: 2 }),
        ...contractsData.flatMap((contract, index) => [
          new TextRun({ text: `Kontrak ${index + 1}`, bold: true, break: 1 }),
          new TextRun({
            text: `Jenis Kontrak: ${contract.jenis_kontrak}`,
            break: 1,
          }),
          new TextRun({ text: `Deskripsi: ${contract.deskripsi}`, break: 1 }),
          new TextRun({
            text: `Jumlah Orang: ${contract.jumlah_orang}`,
            break: 1,
          }),
          new TextRun({
            text: `Durasi Kontrak: ${contract.durasi_kontrak} bulan`,
            break: 1,
          }),
          new TextRun({
            text: `Nilai Kontrak Awal: ${formatCurrency(
              contract.nilai_kontral_awal
            )}`,
            break: 1,
          }),
          new TextRun({
            text: `Nilai Kontrak Akhir: ${formatCurrency(
              contract.nilai_kontrak_akhir
            )}`,
            break: 1,
          }),
          new TextRun({ text: "", break: 1 }), // Add spacing between contracts
        ]),
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
              text: `${official.nama} - ${official.jabatan} (${official.nip}) ${official.surat_keputusan}`,
              break: 1,
            })
        ),
      ],
    });

    const documentHeader = new Header({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: imageData.image,
              transformation: {
                width: 80,
                height: 80,
              },
            }),
            new TextRun({
              text: "KEMENTERIAN KOMUNIKASI DAN INFORMATIKA",
              size: 14 * 2,
              font: "Arial",
              color: "000080", // Navy blue
              break: 1,
            }),
            new TextRun({
              text: "DIREKTORAT JENDERAL APLIKASI INFORMATIKA",
              size: 12 * 2,
              font: "Arial",
              color: "000080", // Navy blue
              break: 1,
            }),
            new TextRun({
              text: "SEKRETARIAT DIREKTORAT JENDERAL",
              size: 10 * 2,
              font: "Arial",
              color: "000080", // Navy blue
              break: 1,
            }),
            new TextRun({
              text: "Indonesia Terkoneksi: Makin Digital, Makin Maju",
              // italics: true,
              bold: true,
              size: 12 * 2,
              font: "Brush Script MT",
              color: "87CEEB",
              break: 1,
            }),
            new TextRun({
              text: "Jl. Medan Merdeka Barat No. 9 Jakarta 10110 Tel./Fax. 021-3441491 www.kominfo.go.id",
              size: 7 * 2,
              font: "Arial",
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "___________________________________________________________________________",
              size: 24,
            }),
          ],
        }),
      ],
    });

    const namaVendorText = vendorData.nama_vendor.toUpperCase();

    const coverPage = {
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 2000,
            left: 1440,
          },
          borders: {
            pageBorderTop: {
              style: BorderStyle.SINGLE,
              size: 50,
              color: "000000",
              space: 24,
            },
            pageBorderRight: {
              style: BorderStyle.SINGLE,
              size: 50,
              color: "000000",
              space: 24,
            },
            pageBorderBottom: {
              style: BorderStyle.SINGLE,
              size: 50,
              color: "000000",
              space: 24,
            },
            pageBorderLeft: {
              style: BorderStyle.SINGLE,
              size: 50,
              color: "000000",
              space: 24,
            },
          },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: "SURAT PERINTAH KERJA",
              font: "Arial Narrow",
              bold: true,
              size: 28 * 2,
              // break: 4,
            }),
            new TextRun({
              text: `Nomor: ${documentData.nomor_kontrak}`,
              font: "Arial Narrow",
              bold: true,
              size: 12 * 2,
              break: 1,
            }),
            new TextRun({
              text: `Tgl.${documentData.tahun_anggaran}`,
              font: "Arial Narrow",
              bold: true,
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [
            new ImageRun({
              data: imageData.image,
              transformation: {
                width: 100,
                height: 100,
              },
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          // spacing: { before: 800 },
          children: [
            new TextRun({
              text: "ANTARA",
              font: "Arial Narrow",
              bold: true,
              size: 12 * 2,
              break: 5,
            }),
            new TextRun({
              text: "PEJABAT PEMBUAT KOMITMEN",
              font: "Arial Narrow",
              size: 12 * 2,
              bold: true,
              break: 3,
            }),
            new TextRun({
              text: "SEKRETARIAT DIREKTORAT JENDERAL",
              font: "Arial Narrow",
              size: 12 * 2,
              bold: true,
              break: 1,
            }),
            new TextRun({
              text: "APLIKASI INFORMATIKA",
              font: "Arial Narrow",
              size: 12 * 2,
              bold: true,
              break: 1,
            }),
            new TextRun({
              text: "DENGAN",
              font: "Arial Narrow",
              size: 12 * 2,
              bold: true,
              break: 2,
            }),
            new TextRun({
              text: namaVendorText,
              font: "Arial Narrow",
              size: 12 * 2,
              bold: true,
              break: 2,
            }),
            new TextRun({
              text: "PEKERJAAN:",
              font: "Arial Narrow",
              size: 19 * 2,
              bold: true,
              break: 3,
            }),
            new TextRun({
              text: `${documentData.paket_pekerjaan}`,
              font: "Arial Narrow",
              size: 12 * 2,
              bold: true,
              break: 4,
            }),
            new TextRun({
              text: "SEKRETARIAT DIREKTORAT JENDERAL APLIKASI INFORMATIKA",
              font: "Arial Narrow",
              size: 10 * 2,
              bold: true,
              break: 3,
            }),
            new TextRun({
              text: `TAHUN ANGGARAN ${documentData.tahun_anggaran}`,
              font: "Arial Narrow",
              size: 10 * 2,
              bold: true,
              break: 1,
            }),
          ],
        }),
      ],
    };

    const contentPage = {
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
      headers: {
        default: documentHeader,
      },
      children: [
        vendorSection,
        contractsSection,
        documentSection,
        officialsSection,
      ],
    };

    const doc = new Document({
      sections: [coverPage, contentPage],
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
  officialData,
  isContractsSaved,
  isContractsEditMode,
  onError,
}) => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isPrintConfirmationOpen, setIsPrintConfirmationOpen] = useState(false);

  const handlePrintClick = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Menggunakan nomor_kontrak dari documentData yang sudah ada
      const nomorKontrak = documentData?.nomor_kontrak;
      if (!nomorKontrak) {
        throw new Error("Nomor kontrak tidak tersedia");
      }

      console.log("Initiating print for document:", nomorKontrak);

      // Fetch document data with all relationships
      // const data = await getDocumentData(token, nomorKontrak);
      // Ganti dari setIsPrintDialogOpen menjadi setIsPrintConfirmationOpen
      setIsPrintConfirmationOpen(true);
    } catch (error) {
      console.error("Error in handlePrintClick:", error);
      onError(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handlePrintConfirmed = () => {
    setIsPrintConfirmationOpen(false);
    setIsPrintDialogOpen(true);
  };

  const handlePrint = async (filename: string) => {
    try {
      if (!filename || !documentData) {
        onError("Nama file harus diisi dan data harus tersedia");
        return;
      }

      // Generate single document with all contracts
      const doc = await generateContractDocument({
        contractsData: contractsData, // Pass all contracts
        documentData: documentData,
        vendorData: vendorData,
        officialData: officialData,
      });

      const blob = await Packer.toBlob(doc);
      const sanitizedFilename = filename
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      const fullFilename = `${sanitizedFilename}.docx`;

      saveAs(blob, fullFilename);

      setIsPrintDialogOpen(false);
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
