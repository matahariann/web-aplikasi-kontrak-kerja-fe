import React, { useState } from "react";
import { Document, Paragraph, TextRun, AlignmentType, Packer } from "docx";
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
import { ContractData } from "@/services/employee";

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
  isContractsSaved: boolean;
  isContractsEditMode: boolean;
  onError: (error: string) => void;
  clearLocalStorage: () => void;
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

export const generateContractDocument = async (contractData: ContractData) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SURAT PERINTAH KERJA",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Nomor: ${contractData.nomor_kontrak}`,
                size: 24,
              }),
            ],
          }),
          // Logo placeholder - you would need to add actual logo
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "KOMINFO",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 400,
            },
            children: [
              new TextRun({
                text: "ANTARA",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PEJABAT PEMBUAT KOMITMEN",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SEKRETARIAT DIREKTORAT JENDERAL",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: "APLIKASI INFORMATIKA",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "DENGAN",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: contractData.jenis_kontrak,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PEKERJAAN:",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: contractData.deskripsi,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SEKRETARIAT DIREKTORAT JENDERAL APLIKASI INFORMATIKA",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "TAHUN ANGGARAN 2024",
                bold: true,
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
};

export const PrintContract: React.FC<PrintContractProps> = ({
  contractsData,
  isContractsSaved,
  isContractsEditMode,
  onError,
  clearLocalStorage,
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
        const doc = await generateContractDocument(contract);
        const blob = await Packer.toBlob(doc);

        const sanitizedFilename = filename
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fullFilename = `${sanitizedFilename}${
          i > 0 ? `_${i + 1}` : ""
        }.docx`;

        saveAs(blob, fullFilename);
      }

      clearLocalStorage();
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
