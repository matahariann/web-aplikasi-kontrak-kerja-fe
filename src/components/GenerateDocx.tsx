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
  TableRow,
  TableCell,
  Table,
  WidthType,
  LineRuleType,
  VerticalAlign,
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
import { getImage } from "@/services/employee";
import { VendorData } from "@/services/vendor";
import { OfficialData } from "@/services/official";
import { DocumentData } from "@/services/documents";
import {
  ContractData,
  completeForm,
  clearFormSession,
} from "@/services/contract";

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
  setCurrentStep: (step: number) => void;
  onDownloadSuccess: () => void;
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

  const splitTextIntoLines = (text, maxCharsPerLine) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + " " + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  const generateTabelKontrakAwal = (contractsData) => {
    const tableRows = [];

    // Header Row
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 200, before: 200 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "No.",
                    font: "Arial",
                    size: 12 * 2,
                    bold: true,
                  }),
                ],
              }),
            ],
            width: { size: 500, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            shading: { fill: "CCCCCC" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 200, before: 200 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Deskripsi",
                    font: "Arial",
                    size: 12 * 2,
                    bold: true,
                  }),
                ],
              }),
            ],
            width: { size: 3500, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            shading: { fill: "CCCCCC" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 200, before: 200 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Qty",
                    font: "Arial",
                    size: 12 * 2,
                    bold: true,
                  }),
                ],
              }),
            ],
            columnSpan: 2,
            width: { size: 1000, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            shading: { fill: "CCCCCC" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 200, before: 200 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Harga",
                    font: "Arial",
                    size: 12 * 2,
                    bold: true,
                  }),
                ],
              }),
            ],
            width: { size: 2500, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            shading: { fill: "CCCCCC" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 200, before: 200 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Jumlah",
                    font: "Arial",
                    size: 12 * 2,
                    bold: true,
                  }),
                ],
              }),
            ],
            width: { size: 2500, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            shading: { fill: "CCCCCC" },
          }),
        ],
        tableHeader: true,
      })
    );

    // Title Row
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "1",
                    font: "Arial",
                    size: 12 * 2,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: `${documentData.paket_pekerjaan}, detail sbb :`,
                    font: "Arial",
                    size: 12 * 2,
                  }),
                ],
              }),
            ],
            columnSpan: 5,
          }),
        ],
      })
    );

    let grandTotal = 0;

    // Contract Rows
    contractsData.forEach((contract) => {
      // Calculate jumlah for each contract
      const jumlah =
        contract.nilai_kontral_awal *
        contract.jumlah_orang *
        contract.durasi_kontrak;
      grandTotal += jumlah;

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("")],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.JUSTIFIED,
                  children: [
                    new TextRun({
                      text: contract.deskripsi,
                      font: "Arial",
                      size: 12 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${contract.jumlah_orang} org`,
                      font: "Arial",
                      size: 12 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${contract.durasi_kontrak} bln`,
                      font: "Arial",
                      size: 12 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: formatCurrency(contract.nilai_kontral_awal),
                      font: "Arial",
                      size: 12 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: {
                    line: 360,
                    lineRule: LineRuleType.AUTO,
                  },
                  children: [
                    new TextRun({
                      text: formatCurrency(jumlah),
                      font: "Arial",
                      size: 12 * 2,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    });

    // Total Row
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Total",
                    font: "Arial",
                    size: 12 * 2,
                    bold: true,
                  }),
                ],
              }),
            ],
            columnSpan: 5,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatCurrency(grandTotal),
                    font: "Arial",
                    size: 12 * 2,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    return tableRows;
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
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 2500,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new ImageRun({
                          data: imageData.image,
                          transformation: {
                            width: 80,
                            height: 80,
                          },
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 7250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "KEMENTERIAN KOMUNIKASI DAN INFORMATIKA",
                          size: 14 * 2,
                          font: "Arial",
                          color: "000080", // Navy blue
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "DIREKTORAT JENDERAL APLIKASI INFORMATIKA",
                          size: 14 * 2,
                          font: "Arial",
                          color: "000080", // Navy blue
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "SEKRETARIAT DIREKTORAT JENDERAL",
                          size: 10 * 2,
                          font: "Arial",
                          color: "000080", // Navy blue
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Indonesia Terkoneksi: Makin Digital, Makin Maju",
                          bold: true,
                          size: 12 * 2,
                          font: "Brush Script MT",
                          color: "155E95",
                        }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { after: 100 },
                      children: [
                        new TextRun({
                          text: "Jl. Medan Merdeka Barat No. 9 Jakarta 10110 Tel./Fax. 021-3441491 www.kominfo.go.id",
                          size: 7 * 2,
                          font: "Arial",
                          color: "000080",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
            bottom: {
              style: BorderStyle.SINGLE,
              size: 20,
              color: "000000",
            },
          },
        }),
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({
              text: "",
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
          spacing: {
            after: 400,
          },
          children: [
            new TextRun({
              text: "SURAT PERINTAH KERJA",
              font: "Arial Narrow",
              bold: true,
              size: 28 * 2,
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
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: splitTextIntoLines(documentData.paket_pekerjaan, 50).map(
            (line) =>
              new TextRun({
                text: line,
                font: "Arial Narrow",
                size: 12 * 2,
                bold: true,
                break: 1,
              })
          ),
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
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

    const halaman1 = {
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1080,
            bottom: 1440,
            left: 1080,
          },
        },
      },
      headers: {
        default: documentHeader,
      },
      children: [
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 1000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "Nomor",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 8250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_kontrak
                          }\tJakarta, ${formatDate(
                            documentData.tanggal_kontrak
                          )}`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "Sifat",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "Biasa",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "Lampiran",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "-",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "Hal",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Pelaksanaan Pekerjaan",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Yth.",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `Sdr. ${officialData[1].jabatan.split("Sekretariat")[0]},`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `Sekretariat${
                officialData[1].jabatan.split("Sekretariat")[1]
              }`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Kementrian Komunikasi dan informatika",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "di Jakarta",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `\tSehubungan dengan akan dilaksanakan ${documentData.paket_pekerjaan}, Tahun Anggaran ${documentData.tahun_anggaran}, dengan ini diharapkan agar Saudara segera melaksanakan proses pengadaan pekerjaan dimaksud sesuai dengan ketentuan Peraturan Presiden RI No. 54 Tahun 2010 tentang Pengadaan Barang/Jasa Pemerintah, yang terakhir diubah dengan Peraturan Presiden RI No.16 Tahun 2018, serta peraturan perundang-undangan yang berlaku.`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
            after: 200,
          },
          children: [
            new TextRun({
              text: "\tDemikian hal ini kami sampaikan, atas perhatian dan kerjasama Saudara diucapkan terima kasih.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 200 },
                      children: [
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        before: 400,
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `${officialData[0].jabatan}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${officialData[0].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 5,
                        }),
                        new TextRun({
                          text: `NIP. ${officialData[0].nip}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    };

    const halaman2 = {
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1080,
            bottom: 1440,
            left: 1080,
          },
        },
      },
      headers: {
        default: documentHeader,
      },
      children: [
        new Paragraph({
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "HARGA PERIKIRAAN SENDIRI (HPS)",
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `NOMOR: ${documentData.nomor_hps}`,
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `${documentData.paket_pekerjaan.toUpperCase()}`,
              font: "Arial",
              size: 12 * 2,
              bold: true,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `Pelaksanaan pekerjaan: ${formatDate(
                documentData.tanggal_mulai
              )} - ${formatDate(documentData.tanggal_selesai)}`,
              font: "Arial",
              size: 11 * 2,
              bold: true,
            }),
          ],
        }),
        new Table({
          width: { size: 9750, type: WidthType.DXA },
          rows: generateTabelKontrakAwal(contractsData),
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "* Harga sudah termasuk pajak-pajak yang berlaku",
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
          ],
        }),
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 200 },
                      children: [
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        before: 400,
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `Jakarta, ${formatDate(
                            documentData.tanggal_hps
                          )}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${officialData[0].jabatan}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${officialData[0].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 5,
                        }),
                        new TextRun({
                          text: `NIP. ${officialData[0].nip}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    };

    const halaman3 = {
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1080,
            bottom: 1440,
            left: 1080,
          },
        },
      },
      headers: {
        default: documentHeader,
      },
      children: [
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 1000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Nomor",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 8250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_pph1
                          }        Jakarta, ${formatDate(
                            documentData.tanggal_pph1
                          )}`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Sifat",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Biasa",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Lampiran",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "-",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Hal",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Permintaan Penawaran Harga",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Yth.",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Sdr. Pimpinan",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `${vendorData.nama_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `${vendorData.alamat_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `\tDalam rangka ${documentData.paket_pekerjaan}, Tahun Anggaran ${documentData.tahun_anggaran}. Dengan ini kami minta kesediaan saudara untuk mengajukan penawaran harga, dengan spesifikasi sebagai berikut:`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Table({
          width: { size: 9750, type: WidthType.DXA },
          rows: generateTabelKontrakAwal(contractsData),
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "* Harga sudah termasuk pajak-pajak yang berlaku",
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "\tPenawaran harga disampaikan kepada Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen. Aplikasi Informatika Lantai III Kantor Kementerian Komunikasi dan Informatika Jl. Medan Merdeka Barat No.9 Jakarta Pusat 10110, dengan ketentuan sebagai berikut:",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pph-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Surat penawaran harga dibuat rangkap 2 (dua), asli bermaterai Rp.10.000,",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pph-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Surat penawaran harga selambat-lambatnya sudah kami terima 7 (tujuh) hari kalender terhitung sejak tanggal surat permintaan ini.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pph-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Apabila surat penawaran harga Saudara kami terima/setuju, maka Surat Perintah Kerja akan segera kami lakukan kepada Saudara.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pph-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Surat penawaran dilampiri Fotocopy: Akte pendirian perusahaan, SIUP, NPWP, Rekening Koran/Referensi Bank",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Demikian disampaikan, atas perhatian Saudara diucapkan terima kasih.",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 200 },
                      children: [
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        before: 400,
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: `${officialData[1].jabatan}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${officialData[1].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 5,
                        }),
                        new TextRun({
                          text: `NIP. ${officialData[1].nip}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    };

    const halaman4 = {
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1080,
            bottom: 1440,
            left: 1080,
          },
        },
      },
      headers: {
        default: documentHeader,
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "PAKTA INTEGRITAS",
              font: "Arial",
              size: 16 * 2,
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `\tSaya yang bertanda tangan dibawah ini, dalam rangka ${documentData.paket_pekerjaan}, Tahun Anggaran ${documentData.tahun_anggaran}, dengan ini menyatakan bahwa saya:`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pakta-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Tidak akan melakukan praktek KKN;",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pakta-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Akan melaporkan kepada pihak yang berwajib/berwenang apabila mengetahui ada indikasi KKN di dalam proses pengadaan ini;",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pakta-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Dalam proses pengadaan ini, berjanji akan melaksanakan tugas secara bersih, transparan, dan professional dalam arti akan mengerahkan segala kemampuan dan sumber daya secara optimal untuk memberikan hasil kerja terbaik mulai dari penyiapan penawaran, pelaksanaan, dan penyelesaian pekerjaan/kegiatan ini;",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pakta-numbering",
            level: 0,
          },
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Dalam proses pengadaan ini, berjanji akan melaksanakan tugas secara bersih, transparan, dan professional dalam arti akan mengerahkan segala kemampuan dan sumber daya secara optimal untuk memberikan hasil kerja terbaik mulai dari penyiapan penawaran, pelaksanaan, dan penyelesaian pekerjaan/kegiatan ini;",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `Jakarta, ${formatDate(documentData.tanggal_pph1)}`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "1",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: "Pejabat Pembuat Komitmen",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 3500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: `${officialData[0].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 1250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "2",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: "Pejabat Pengadaan",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 3500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: `${officialData[1].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 1250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "3",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: `${vendorData.nama_vendor}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 3500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: `${vendorData.nama_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 1250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 400, after: 400 },
                      children: [
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    };

    const halaman5 = {
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1080,
            bottom: 1440,
            left: 1080,
          },
        },
      },
      headers: {
        default: documentHeader,
      },
      children: [
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 1000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Nomor",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 8250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_ukn
                          }        Jakarta, ${formatDate(
                            documentData.tanggal_ukn
                          )}`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Sifat",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Biasa",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Lampiran",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "-",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Hal",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Undangan Klarifikasi dan Negosiasi",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Yth.",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Sdr. Pimpinan",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `${vendorData.nama_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `${vendorData.alamat_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: `\tBersama ini diharapkan kehadiran Saudara dalam rapat Evaluasi, Klarifikasi dan Negosiasi Harga atas penawaran yang telah disampaikan kepada kami ${documentData.paket_pekerjaan}, Tahun Anggaran ${documentData.tahun_anggaran}, pada:`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 1500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Hari/Tanggal",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 7750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: `${new Date(
                            documentData.tanggal_ukn
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                          })}, ${formatDate(documentData.tanggal_ukn)}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 1500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Pukul",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 7750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "10.00 - selesai.",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 1500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Tempat",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 7750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Ruang Rapat Ditjen Aplikasi Informatika Lantai III, Jl. Merdeka Barat No.9 Jakarta Pusat",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: {
                    size: 1500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Acara",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 7750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: {
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: "Evaluasi, Klarifikasi dan Negosiasi Harga",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
          children: [
            new TextRun({
              text: "Demikian disampaikan, atas perhatiannya diucapkan terimakasih",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Table({
          width: {
            size: 9750,
            type: WidthType.DXA,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  width: {
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 200 },
                      children: [
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        before: 400,
                        line: 360,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [
                        new TextRun({
                          text: `${officialData[1].jabatan}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${officialData[1].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 4,
                        }),
                        new TextRun({
                          text: `NIP. ${officialData[1].nip}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
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
            right: 1080,
            bottom: 1440,
            left: 1080,
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
      numbering: {
        config: [
          {
            reference: "pph-numbering", // Numbering pertama
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 360, hanging: 360 },
                  },
                  run: {
                    font: "Arial",
                    size: 24,
                  },
                },
              },
            ],
          },
          {
            reference: "pakta-numbering", // Numbering kedua
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 360, hanging: 360 },
                  },
                  run: {
                    font: "Arial",
                    size: 24,
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [
        coverPage,
        halaman1,
        halaman2,
        halaman3,
        halaman4,
        halaman5,
        contentPage,
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
  officialData,
  isContractsSaved,
  isContractsEditMode,
  onError,
  setCurrentStep,
  onDownloadSuccess,
}) => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isPrintConfirmationOpen, setIsPrintConfirmationOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrintClick = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const nomorKontrak = documentData?.nomor_kontrak;
      if (!nomorKontrak) {
        throw new Error("Nomor kontrak tidak tersedia");
      }

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
    setIsProcessing(true);
    try {
      if (!filename || !documentData) {
        onError("Nama file harus diisi dan data harus tersedia");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Generate document
      const doc = await generateContractDocument({
        contractsData,
        documentData,
        vendorData,
        officialData,
      });

      // Save document
      const blob = await Packer.toBlob(doc);
      const sanitizedFilename = filename
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      const fullFilename = `${sanitizedFilename}.docx`;
      saveAs(blob, fullFilename);

      // // Complete the form session
      await completeForm(token);

      // // Clear the form session
      await clearFormSession(token);

      setIsPrintDialogOpen(false);

      // Reset form step to 1 and reload the page
      // setCurrentStep(1);

      onDownloadSuccess();

      // Reload the page after a short delay to reset all forms
      setTimeout(() => {
        setCurrentStep(1);
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error in print process:", error);
      onError(
        error instanceof Error
          ? `Terjadi kesalahan: ${error.message}`
          : "Terjadi kesalahan saat mencetak dokumen"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isContractsSaved || isContractsEditMode) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePrintClick}
        disabled={isProcessing}
      >
        <Printer className="w-4 h-4 mr-2" />
        {isProcessing ? "Memproses..." : "Cetak"}
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
