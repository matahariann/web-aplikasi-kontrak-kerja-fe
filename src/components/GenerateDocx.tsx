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
  vendorData: VendorData[];
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
  vendorData: VendorData[];
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

  const numberToWords = (num: number): string => {
    const units = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
      "Dua Belas",
      "Tiga Belas",
      "Empat Belas",
      "Lima Belas",
      "Enam Belas",
      "Tujuh Belas",
      "Delapan Belas",
      "Sembilan Belas",
    ];
    const tens = [
      "",
      "",
      "Dua Puluh",
      "Tiga Puluh",
      "Empat Puluh",
      "Lima Puluh",
      "Enam Puluh",
      "Tujuh Puluh",
      "Delapan Puluh",
      "Sembilan Puluh",
    ];

    if (num === 0) return "Nol";

    if (num < 20) return units[num];

    if (num < 100) {
      const digit = num % 10;
      const tenDigit = Math.floor(num / 10);
      return digit ? `${tens[tenDigit]} ${units[digit]}` : tens[tenDigit];
    }

    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      const hundredText = hundred === 1 ? "Seratus" : `${units[hundred]} Ratus`;
      return remainder
        ? `${hundredText} ${numberToWords(remainder)}`
        : hundredText;
    }

    return "Angka terlalu besar";
  };

  const calculateDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Menghitung selisih dalam milidetik
    const diffTime = Math.abs(end.getTime() - start.getTime());

    // Mengkonversi milidetik ke hari
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const currencyToWords = (num: number): string => {
    const digits = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
    ];
    const levels = ["", "Ribu", "Juta", "Miliar", "Triliun"];

    if (num === 0) return "Nol";

    const convertGroup = (n: number): string => {
      let result = "";

      // Handle hundreds
      const hundreds = Math.floor(n / 100);
      if (hundreds > 0) {
        result +=
          (hundreds === 1 ? "Seratus" : digits[hundreds] + " Ratus") + " ";
      }

      // Handle tens and ones
      const remainder = n % 100;
      if (remainder > 0) {
        if (remainder < 10) {
          result += digits[remainder];
        } else if (remainder === 10) {
          result += "Sepuluh";
        } else if (remainder === 11) {
          result += "Sebelas";
        } else if (remainder < 20) {
          result += digits[remainder % 10] + " Belas";
        } else {
          const tens = Math.floor(remainder / 10);
          const ones = remainder % 10;
          result += digits[tens] + " Puluh " + digits[ones];
        }
      }

      return result.trim();
    };

    let result = "";
    let number = num;
    let level = 0;

    while (number > 0) {
      const group = number % 1000;
      if (group > 0) {
        const prefix =
          group === 1 && level === 1 ? "Se" : convertGroup(group) + " ";
        result = prefix + levels[level] + " " + result;
      }
      number = Math.floor(number / 1000);
      level++;
    }

    return result.trim() + " Rupiah";
  };

  const calculateContractPerkiraan = (contractsData) => {
    let grandTotal = 0;
    const contractTotals = contractsData.map((contract) => {
      const jumlah =
        contract.nilai_perkiraan_sendiri *
        contract.jumlah_orang *
        contract.durasi_kontrak;
      grandTotal += jumlah;
      return jumlah;
    });

    return {
      grandTotal,
      contractTotals,
    };
  };

  const calculateContractAwal = (contractsData) => {
    let grandTotal = 0;
    const contractTotals = contractsData.map((contract) => {
      const jumlah =
        contract.nilai_kontral_awal *
        contract.jumlah_orang *
        contract.durasi_kontrak;
      grandTotal += jumlah;
      return jumlah;
    });

    return {
      grandTotal,
      contractTotals,
    };
  };

  const calculateContractAkhir = (contractsData) => {
    let grandTotal = 0;
    const contractTotals = contractsData.map((contract) => {
      const jumlah =
        contract.nilai_kontrak_akhir *
        contract.jumlah_orang *
        contract.durasi_kontrak;
      grandTotal += jumlah;
      return jumlah;
    });

    return {
      grandTotal,
      contractTotals,
    };
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

  function getDateAsWord(dateString) {
    // Array untuk konversi angka ke kata
    const numberWords = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
    ];

    // Array untuk konversi puluhan
    const tensWords = ["", "Sepuluh", "Dua Puluh", "Tiga Puluh"];

    // Mengambil tanggal dari string format dd-mm-yyyy
    const day = parseInt(dateString.split("-")[2]);

    // Validasi rentang tanggal
    if (day < 1 || day > 31) {
      return "Tanggal tidak valid";
    }

    // Menghilangkan leading zero jika ada
    const cleanDay = parseInt(day.toString().replace(/^0+/, ""));

    // Logika untuk mengkonversi angka ke kata
    if (cleanDay <= 11) {
      return numberWords[cleanDay];
    } else if (cleanDay <= 19) {
      return numberWords[cleanDay % 10] + " Belas";
    } else {
      const tens = Math.floor(cleanDay / 10);
      const ones = cleanDay % 10;
      return tensWords[tens] + (ones > 0 ? " " + numberWords[ones] : "");
    }
  }

  function getMonthAsWord(dateString) {
    const monthWords = [
      "",
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Mengambil bulan dari format yyyy-mm-dd
    const month = parseInt(dateString.split("-")[1]);

    // Menghilangkan leading zero jika ada
    return monthWords[parseInt(month.toString().replace(/^0+/, ""))];
  }

  function getYearAsWords(dateString) {
    const numberWords = {
      0: "Nol",
      1: "Satu",
      2: "Dua",
      3: "Tiga",
      4: "Empat",
      5: "Lima",
      6: "Enam",
      7: "Tujuh",
      8: "Delapan",
      9: "Sembilan",
      10: "Sepuluh",
      11: "Sebelas",
    };

    // Mengambil tahun dari format yyyy-mm-dd
    const year = dateString.split("-")[0];

    // Memisahkan tahun menjadi dua bagian: 2 dan 024 untuk 2024
    const firstDigit = parseInt(year[0]);
    const secondDigit = parseInt(year[1]);
    const thirdDigit = parseInt(year[2]);
    const fourthDigit = parseInt(year[3]);

    // Fungsi untuk mengonversi angka puluhan (10-99)
    function convertTens(num) {
      if (num === 0) return "";
      if (num === 1) return "Sepuluh";
      if (num === 11) return "Sebelas";
      if (num < 12) return numberWords[num];
      if (num < 20) return `${numberWords[num % 10]} Belas`;
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      return `${
        ones === 0
          ? numberWords[tens] + " Puluh"
          : numberWords[tens] + " Puluh " + numberWords[ones]
      }`;
    }

    // Membuat string hasil
    let result = "";

    // Menambahkan ribuan (Dua Ribu)
    result += numberWords[firstDigit] + " Ribu";

    // Menambahkan ratusan jika ada
    if (secondDigit !== 0) {
      result += " " + numberWords[secondDigit] + " Ratus";
    }

    // Menambahkan puluhan dan satuan
    const lastTwoDigits = thirdDigit * 10 + fourthDigit;
    if (lastTwoDigits > 0) {
      result += " " + convertTens(lastTwoDigits);
    }

    return result.trim();
  }

  const generateTabelPerkiraanSendiri = (contractsData) => {
    const tableRows = [];
    const { contractTotals } = calculateContractPerkiraan(contractsData);

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
                indent: { left: 100, right: 100 },
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: "1",
                    font: "Arial",
                    size: 11 * 2,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { left: 100, right: 100 },
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: `${documentData.paket_pekerjaan}, detail sbb :`,
                    font: "Arial",
                    size: 11 * 2,
                  }),
                ],
              }),
            ],
            columnSpan: 5,
          }),
        ],
      })
    );

    // Contract Rows
    contractsData.forEach((contract, index) => {
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
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: contract.deskripsi,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: `${contract.jumlah_orang} org`,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: `${contract.durasi_kontrak} bln`,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                  indent: { left: 100, right: 100 },
                  children: [
                    new TextRun({
                      text: formatCurrency(contract.nilai_perkiraan_sendiri),
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: formatCurrency(contractTotals[index]),
                      font: "Arial",
                      size: 11 * 2,
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
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: "Total",
                    font: "Arial",
                    size: 11 * 2,
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
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: formatCurrency(
                      calculateContractPerkiraan(contractsData).grandTotal
                    ),
                    font: "Arial",
                    size: 11 * 2,
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

  const generateTabelKontrakAwal = (contractsData) => {
    const tableRows = [];
    // const { contractTotals } = calculateContractAwal(contractsData);

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
                indent: { left: 100, right: 100 },
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: "1",
                    font: "Arial",
                    size: 11 * 2,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { left: 100, right: 100 },
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: `${documentData.paket_pekerjaan}, detail sbb :`,
                    font: "Arial",
                    size: 11 * 2,
                  }),
                ],
              }),
            ],
            columnSpan: 5,
          }),
        ],
      })
    );

    // Contract Rows
    contractsData.forEach((contract, index) => {
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
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: contract.deskripsi,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: `${contract.jumlah_orang} org`,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: `${contract.durasi_kontrak} bln`,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                  indent: { left: 100, right: 100 },
                  children: [
                    new TextRun({
                      text: "",
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: "",
                      font: "Arial",
                      size: 11 * 2,
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
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: "Total",
                    font: "Arial",
                    size: 11 * 2,
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
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: "",
                    font: "Arial",
                    size: 11 * 2,
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

  const generateTabelKontrakAkhir = (contractsData) => {
    const tableRows = [];
    const { contractTotals } = calculateContractAkhir(contractsData);

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
                indent: { left: 100, right: 100 },
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: "1",
                    font: "Arial",
                    size: 11 * 2,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { left: 100, right: 100 },
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: `${documentData.paket_pekerjaan}, detail sbb :`,
                    font: "Arial",
                    size: 11 * 2,
                  }),
                ],
              }),
            ],
            columnSpan: 5,
          }),
        ],
      })
    );

    // Contract Rows
    contractsData.forEach((contract, index) => {
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
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: contract.deskripsi,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: `${contract.jumlah_orang} org`,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: `${contract.durasi_kontrak} bln`,
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: formatCurrency(contract.nilai_kontrak_akhir),
                      font: "Arial",
                      size: 11 * 2,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 100, right: 100 },
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: formatCurrency(contractTotals[index]),
                      font: "Arial",
                      size: 11 * 2,
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
                    size: 11 * 2,
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
                alignment: AlignmentType.CENTER,
                indent: { left: 100, right: 100 },
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({
                    text: formatCurrency(
                      calculateContractAkhir(contractsData).grandTotal
                    ),
                    font: "Arial",
                    size: 11 * 2,
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
                            width: 100,
                            height: 100,
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
                          text: "KEMENTERIAN KOMUNIKASI DAN DIGITAL RI",
                          size: 16 * 2,
                          font: "Archivo",
                          color: "808080",
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "DIREKTORAT JENDERAL APLIKASI INFORMATIKA",
                          size: 14 * 2,
                          font: "Archivo",
                          color: "808080",
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "SEKRETARIAT DIREKTORAT JENDERAL",
                          size: 11 * 2,
                          font: "Archivo",
                          color: "808080",
                        }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { after: 100 },
                      children: [
                        new TextRun({
                          text: "Jl. Medan Merdeka Barat No. 9 Jakarta 10110 Tel./Fax. 021-3441491 www.komdigi.go.id",
                          size: 9 * 2,
                          font: "Archivo",
                          color: "808080",
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
              text: vendorData[0].nama_vendor.toUpperCase(),
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
                  width: {
                    size: 1000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
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
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
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
                    size: 5750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_pp
                          }`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 2500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `Jakarta, ${formatDate(documentData.tanggal_pp)}`,
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
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
                  children: [
                    new Paragraph({
                      spacing: {
                        before: 400,
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
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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
          rows: generateTabelPerkiraanSendiri(contractsData),
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,

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
                  children: [
                    new Paragraph({
                      spacing: {
                        before: 400,
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
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const generateVendorPages = (
      vendorList,
      documentData,
      officialData,
      contractsData
    ) => {
      const vendorPages = [];

      // Function to increment document number
      const getIncrementedNumber = (originalNumber, increment) => {

        const parts = originalNumber.split("/");
        const firstNumber = parseInt(parts[0]);
        const newNumber = firstNumber + increment;
        parts[0] = newNumber.toString();
        return parts.join("/");
      };

      vendorList.forEach((vendor, index) => {
        // Generate new document number for current vendor
        const currentDocNumber = getIncrementedNumber(
          documentData.nomor_pph1,
          index
        );

        // Generate Page 3 for current vendor
        const page3 = {
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
                      width: {
                        size: 1000,
                        type: WidthType.DXA,
                      },
                      children: [
                        new Paragraph({
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
                      width: {
                        size: 500,
                        type: WidthType.DXA,
                      },
                      children: [
                        new Paragraph({
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
                        size: 5750,
                        type: WidthType.DXA,
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${currentDocNumber}`,
                              size: 11 * 2,
                              font: "Arial",
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 2500,
                        type: WidthType.DXA,
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: `Jakarta, ${formatDate(
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
                      children: [
                        new Paragraph({
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
              children: [
                new TextRun({
                  text: `${vendor.nama_vendor}`,
                  font: "Arial",
                  size: 12 * 2,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({
                  text: `${vendor.alamat_vendor}`,
                  font: "Arial",
                  size: 12 * 2,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({
                  text: `\tDalam rangka ${documentData.paket_pekerjaan}, Tahun Anggaran ${documentData.tahun_anggaran}. Dengan ini kami minta kesediaan saudara untuk mengajukan penawaran harga, dengan spesifikasi sebagai berikut:`,
                  font: "Arial",
                  size: 12 * 2,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({
                  text: "",
                  font: "Arial",
                  size: 12 * 2,
                }),
              ],
            }),
            new Table({
              width: { size: 9750, type: WidthType.DXA },
              rows: generateTabelKontrakAwal(contractsData),
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
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
              children: [
                new TextRun({
                  text: "",
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
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: {
                            before: 400,
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
                              underline: {
                                type: "single",
                                color: "000000",
                              },
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
    
        // Generate Page 4 for current vendor (same as before)
        const page4 = {
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
                          indent: { left: 100, right: 100 },
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
                          indent: { left: 100, right: 100 },
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
                          indent: { left: 100, right: 100 },
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
                          indent: { left: 100, right: 100 },
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
                          indent: { left: 100, right: 100 },
                          children: [
                            new TextRun({
                              text: `${vendor.nama_vendor}`,
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
                          indent: { left: 100, right: 100 },
                          children: [
                            new TextRun({
                              text: `${vendor.nama_pj}`,
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

        // Add both pages for this vendor
        vendorPages.push(page3, page4);
      });

      return vendorPages;
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
                    size: 5750,
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
                          text: `${
                            documentData.nomor_ukn
                          }`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 2500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `Jakarta, ${formatDate(
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

          children: [
            new TextRun({
              text: `${vendorData[0].nama_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,

          children: [
            new TextRun({
              text: `${vendorData[0].alamat_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,

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
                      children: [
                        new TextRun({
                          text: `${new Date(
                            documentData.tanggal_undangan_ukn
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                          })} / ${formatDate(
                            documentData.tanggal_undangan_ukn
                          )}`,
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
                          break: 6,
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const halaman6 = {
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

          children: [
            new TextRun({
              text: "BERITA ACARA",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,

          children: [
            new TextRun({
              text: "EVALUASI, KLARIFIKASI DAN NEGOSIASI",
              font: "Arial",
              size: 12 * 2,
              underline: {
                type: "single",
                color: "000000",
              },
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,

          children: [
            new TextRun({
              text: `NO: ${documentData.nomor_ba_ekn}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,

          children: [
            new TextRun({
              text: "Pada hari ini ",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
            new TextRun({
              text: new Date(documentData.tanggal_ba_ekn).toLocaleDateString(
                "id-ID",
                {
                  weekday: "long",
                }
              ),
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
            new TextRun({
              text: " tanggal ",
              font: "Arial",
              size: 12 * 2,
            }),
            new TextRun({
              text: getDateAsWord(documentData.tanggal_ba_ekn),
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
            new TextRun({
              text: " bulan ",
              font: "Arial",
              size: 12 * 2,
            }),
            new TextRun({
              text: getMonthAsWord(documentData.tanggal_ba_ekn),
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
            new TextRun({
              text: " tahun ",
              font: "Arial",
              size: 12 * 2,
            }),
            new TextRun({
              text: getYearAsWords(documentData.tanggal_ba_ekn),
              font: "Arial",
              size: 12 * 2,
              bold: true,
            }),
            new TextRun({
              text: `, bertempat di Ruang Rapat Ditjen Aplikasi Informatika Lantai III, Kementerian Komunikasi dan Informatika, Jalan Medan Merdeka Barat No.9 Jakarta, kami yang bertanda tangan dibawah ini Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika, Kementerian Komunikasi dan Informatika telah mengadakan evaluasi, klarifikasi dan negosiasi calon penyedia barang/jasa ${documentData.paket_pekerjaan}.`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `Rapat dihadiri oleh Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika dan ${vendorData[0].nama_vendor}.`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-numbering",
            level: 0,
          },

          children: [
            new TextRun({
              text: "Evaluasi dengan menggunakan sistem gugur.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-numbering",
            level: 0,
          },

          children: [
            new TextRun({
              text: "Adapun hasil evaluasi sebagai berikut:",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-alphabeting",
            level: 0,
          },

          children: [
            new TextRun({
              text: "Penawaran harga yang disampaikan oleh:",
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
          indent: {
            size: 720,
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
                    size: 3000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Nama Perusahaan",
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
                    size: 6250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].nama_vendor,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Alamat",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].alamat_vendor,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "NPWP",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].npwp,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Harga",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${formatCurrency(
                            calculateContractAwal(contractsData).grandTotal
                          )}`,
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
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-alphabeting",
            level: 0,
          },

          children: [
            new TextRun({
              text: "Evaluasi Administrasi.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 720 },
          children: [
            new TextRun({
              text: "Setelah dilakukan evaluasi administrasi berdasarkan ketentuan dalam dokumen pengadaan, penyedia barang/jasa yang memasukkan surat penawaran telah memenuhi syarat administrasi",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-alphabeting",
            level: 0,
          },

          children: [
            new TextRun({
              text: `Selanjutnya dilakukan evaluasi teknis, hasil evaluasi teknis memenuhi syarat teknis dilanjutkan dengan evaluasi harga Penawaran dari ${
                vendorData[0].nama_vendor
              } sebesar: ${formatCurrency(
                calculateContractAwal(contractsData).grandTotal
              )}`,

              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-alphabeting",
            level: 0,
          },

          children: [
            new TextRun({
              text: "Setelah Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika, melakukan evaluasi administrasi, teknis dan penilaian kewajaran harga dengan pertimbangan bahwa:",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-numbering-2",
            level: 0,
          },

          children: [
            new TextRun({
              text: "Penawaran secara administratif dan teknis dapat dipertanggungjawabkan.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-numbering-2",
            level: 0,
          },

          children: [
            new TextRun({
              text: "Perhitungan harga yang ditawarkan dapat dipertanggungjawabkan.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-numbering-2",
            level: 0,
          },
          children: [
            new TextRun({
              text: "Telah memperhatikan penggunaan semaksimal mungkin produksi dalam negeri.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-ekn-alphabeting",
            level: 0,
          },
          children: [
            new TextRun({
              text: `Selanjutnya atas penawaran penyedia barang/jasa tersebut setelah dilakukan negosiasi diperoleh kesepakatan harga sebesar ${formatCurrency(
                calculateContractAkhir(contractsData).grandTotal
              )} sudah termasuk pajak-pajak, sebagai berikut:`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Table({
          width: { size: 9750, type: WidthType.DXA },
          rows: generateTabelKontrakAkhir(contractsData),
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
          children: [
            new TextRun({
              text: "Demikian Berita Acara ini dibuat dalam rangkap secukupnya untuk dipergunakan seperlunya.",
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
                    size: 4875,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        before: 400,
                      },
                      children: [
                        new TextRun({
                          text: `${vendorData[0].jabatan_pj} ${vendorData[0].nama_vendor}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${vendorData[0].nama_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 6,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 4875,
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
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const halaman7 = {
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
                  width: {
                    size: 1000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
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
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
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
                    size: 5750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_pppb
                          }`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 2500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `Jakarta, ${formatDate(
                            documentData.tanggal_pppb
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Penetapan Pelaksana Penyedia Barang/Jasa",
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
          children: [
            new TextRun({
              text: `${vendorData[0].nama_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `${vendorData[0].alamat_vendor}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `\tBerdasarkan hasil Evaluasi, Klarifikasi dan Negosiasi sesuai Berita Acara Evaluasi, Klarifikasi dan Negosiasi Nomor: ${
                documentData.nomor_ba_ekn
              } tanggal ${formatDate(
                documentData.tanggal_ba_ekn
              )}, dengan ini ditetapkan pelaksana ${
                documentData.paket_pekerjaan
              }, sebagai berikut:`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
                    size: 3000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Nama Perusahaan",
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
                    size: 6250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].nama_vendor,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Alamat",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].alamat_vendor,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "NPWP",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].npwp,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Harga",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${formatCurrency(
                            calculateContractAwal(contractsData).grandTotal
                          )}`,
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
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,

          children: [
            new TextRun({
              text: "\tPenetapan tersebut berdasarkan dengan pertimbangan/alasan-alasan sebagi berikut:",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: "Penawaran memenuhi syarat administratif dan teknis yang ditentukan dalam dokumen.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: "Perhitungan harga yang ditawarkan dapat dipertanggungjawabkan.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: "Telah melakukan penggunaan semaksimal mungkin hasil produksi dalam negeri.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "pppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: "Penawaran harga tersebut diatas dinilai wajar.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "\tDemikian penetapan ini disampaikan, ketentuan dan persyaratan lainnya akan diatur dalam Surat Perintah Kerja.",
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        before: 400,
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
                          break: 6,
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const halaman8 = {
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
                  width: {
                    size: 1000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
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
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
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
                    size: 5750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_lppb
                          }`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 2500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `Jakarta, ${formatDate(
                            documentData.tanggal_lppb
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Laporan Pelaksanaan Pengadaan Barang/Jasa",
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
          children: [
            new TextRun({
              text: "Kepada Yth.",
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `Sdr. ${officialData[0].jabatan.split("Sekretariat")[0]},`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `Sekretariat${
                officialData[0].jabatan.split("Sekretariat")[0]
              }`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
          children: [
            new TextRun({
              text: `\tSebagai tindak lanjut surat Pejabat Pembuat Komitmen Nomor: ${
                documentData.nomor_pp
              } tanggal ${formatDate(documentData.tanggal_pp)} tentang ${
                documentData.paket_pekerjaan
              }, bersama ini dilaporkan hal-hal sebagai berikut:`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "lppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `Sesuai tugas yang diamanatkan dalam surat tersebut diatas, Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika telah meminta penawaran kepada penyedia barang/jasa ${vendorData[0].nama_vendor} untuk mengajukan penawaran ${documentData.paket_pekerjaan}.`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "lppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: "Pelaksanaan pengadaan tersebut dilakukan melalui pengadaan langsung sesuai ketentuan Peraturan Presiden RI No.54 Tahun 2010 yang terakhir diubah dengan Peraturan Presiden RI No.16 Tahun 2019, tentang Pengadaan Barang/Jasa Pemerintah serta peraturan perundangan yang berlaku.",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "lppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `Atas dasar permintaan penawaran Pejabat Pengadaan Barang/Jasa Sekretariat Ditjen Aplikasi Informatika, ${
                vendorData[0].nama_vendor
              } mengajukan ${
                documentData.paket_pekerjaan
              }, melalui surat penawaran tanggal ${formatDate(
                documentData.tanggal_pph1
              )}. Setelah dilakukan evaluasi bahwa penyedia barang/jasa tersebut telah memenuhi persyaratan teknis dan administrasi.`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "lppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `Selanjutnya dilakukan penilaian penawaran harga yang diajukan PT Tangkas Baru Bersama sebesar ${formatCurrency(
                calculateContractAwal(contractsData).grandTotal
              )} dilakukan klarifikasi dan negosiasi harga, disepakati sebesar ${formatCurrency(
                calculateContractAkhir(contractsData).grandTotal
              )} (${currencyToWords(
                calculateContractAkhir(contractsData).grandTotal
              )})`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "lppb-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `Dari hasil evaluasi, klarifikasi dan negosiasi, ditetapkan pelaksana ${documentData.paket_pekerjaan} dilaksanakan oleh:`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
          indent: {
            size: 720,
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
                    size: 3000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Nama Perusahaan",
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
                    size: 6250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].nama_vendor,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Alamat",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].alamat_vendor,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "NPWP",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: vendorData[0].npwp,
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
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Harga",
                          size: 12 * 2,
                          font: "Arial",
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
                          text: ":",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${formatCurrency(
                            calculateContractAwal(contractsData).grandTotal
                          )}`,
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
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "\tDemikian disampaikan untuk dapat diproses lebih lanjut, atas perhatiannya diucapkan terima kasih.",
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        before: 400,
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
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const halaman9 = {
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

          children: [
            new TextRun({
              text: "BERITA ACARA SERAH TERIMA PEKERJAAN",
              font: "Arial",
              size: 12 * 2,
              underline: {
                type: "single",
                color: "000000",
              },
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Nomor: ${documentData.nomor_ba_stp}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `Pada hari ini ${new Date(
                documentData.tanggal_ba_stp
              ).toLocaleDateString("id-ID", {
                weekday: "long",
              })} tanggal ${getDateAsWord(
                documentData.tanggal_ba_stp
              )} bulan ${getMonthAsWord(
                documentData.tanggal_ba_stp
              )} tahun ${getYearAsWords(
                documentData.tanggal_ba_stp
              )}, yang bertandatangan dibawah ini:`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "I.",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 3000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
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
                    size: 6250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `Pejabat Pembuat Komitmen, Sekretariat Ditjen. Aplikasi Informatika yang diangkat berdasarkan Surat Keputusan Menteri Komunikasi dan Informatika ${officialData[0].surat_keputusan} tentang Penetapan Kuasa Pengguna Anggaran Pejabat Pembuat Komitmen, Pejabat Penandatangan Surat Perintah Membayar, Bendahara Penerimaan dan Bendahara Pengeluaran di Lingkungan Kementerian Komunikasi dan Informatika, yang selanjutnya dalam Berita Acara ini disebut PIHAK PERTAMA`,
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
                      children: [
                        new TextRun({
                          text: "II.",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 3000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${vendorData[0].nama_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 6250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${vendorData[0].jabatan_pj}, berkedudukan di Jakarta dalam hal ini bertindak untuk dan atas nama ${vendorData[0].nama_vendor}, yang selanjutnya dalam Berita Acara ini disebut PIHAK KEDUA`,
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
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `Berdasarkan Surat Perintah Kerja (SPK) Nomor: ${
                documentData.nomor_kontrak
              } tanggal ${formatDate(documentData.tanggal_kontrak)} ${
                documentData.paket_pekerjaan
              }`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-stp-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `PIHAK KEDUA menyerahkan kepada PIHAK PERTAMA ${documentData.paket_pekerjaan}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-stp-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `PIHAK PERTAMA telah menerima ${documentData.paket_pekerjaan}, seperti tersebut diatas dari PIHAK KEDUA dalam keadaan baik dan cukup satuan maupun jumlahnya serta berfungsi sebagaimana mestinya.`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          numbering: {
            reference: "ba-stp-numbering",
            level: 0,
          },
          children: [
            new TextRun({
              text: `PIHAK KEDUA berhak menerima pembayaran ${
                documentData.paket_pekerjaan
              }, sebesar ${formatCurrency(
                calculateContractAkhir(contractsData).grandTotal
              )} (${currencyToWords(
                calculateContractAkhir(contractsData).grandTotal
              )}) sudah termasuk pajak-pajak.`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Demikian Berita Acara Serah Terima ini dibuat untuk digunakan sebagaimana mestinya.",
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
                    size: 4875,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        before: 400,
                      },
                      children: [
                        new TextRun({
                          text: "PIHAK KEDUA(II)",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${vendorData[0].jabatan_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${vendorData[0].nama_vendor}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${vendorData[0].nama_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 6,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 4875,
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
                      },
                      children: [
                        new TextRun({
                          text: "PIHAK PERTAMA(I)",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${officialData[1].jabatan}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${officialData[1].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 6,
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const halaman10 = {
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

          children: [
            new TextRun({
              text: "BERITA ACARA PEMBAYARAN",
              font: "Arial",
              size: 12 * 2,
              underline: {
                type: "single",
                color: "000000",
              },
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Nomor: ${documentData.nomor_ba_pem}`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `Pada hari ini ${new Date(
                documentData.tanggal_ba_pem
              ).toLocaleDateString("id-ID", {
                weekday: "long",
              })} tanggal ${getDateAsWord(
                documentData.tanggal_ba_pem
              )} bulan ${getMonthAsWord(
                documentData.tanggal_ba_pem
              )} tahun ${getYearAsWords(
                documentData.tanggal_ba_pem
              )}, yang bertandatangan dibawah ini:`,
              font: "Arial",
              size: 12 * 2,
              break: 1,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "I.",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 3000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
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
                    size: 6250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `Pejabat Pembuat Komitmen, Sekretariat Ditjen. Aplikasi Informatika yang diangkat berdasarkan Surat Keputusan Menteri Komunikasi dan Informatika ${officialData[0].surat_keputusan} tentang Penetapan Kuasa Pengguna Anggaran Pejabat Pembuat Komitmen, Pejabat Penandatangan Surat Perintah Membayar, Bendahara Penerimaan dan Bendahara Pengeluaran di Lingkungan Kementerian Komunikasi dan Informatika, yang selanjutnya dalam Berita Acara ini disebut PIHAK PERTAMA`,
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
                      children: [
                        new TextRun({
                          text: "II.",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 3000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${vendorData[0].nama_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 6250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${vendorData[0].jabatan_pj}, berkedudukan di Jakarta dalam hal ini bertindak untuk dan atas nama ${vendorData[0].nama_vendor}, yang selanjutnya dalam Berita Acara ini disebut PIHAK KEDUA`,
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
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: `Berdasarkan Berita Acara Serah Terima ${documentData.paket_pekerjaan}, Nomor: ${documentData.nomor_ba_stp}, Tanggal BELOM ADA, maka PIHAK KEDUA berhak menerima pembayaran dari PIHAK PERTAMA, sebagai berikut:`,
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
                    size: 3500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "Nilai pembayaran sebesar",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                  columnSpan: 2,
                }),
                new TableCell({
                  width: {
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${formatCurrency(
                            calculateContractAkhir(contractsData).grandTotal
                          )} (${currencyToWords(
                            calculateContractAwal(contractsData).grandTotal
                          )})`,
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
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "a. ",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 2000,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: "Untuk pembayaran",
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
                      alignment: AlignmentType.JUSTIFIED,
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
                    size: 6750,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${
                            documentData.paket_pekerjaan
                          } sesuai Surat Perintah Kerja Nomor: ${
                            documentData.paket_pekerjaan
                          }, tanggal ${formatDate(
                            documentData.tanggal_kontrak
                          )}.`,
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
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: "Demikian Berita Acara Pembayaran ini dibuat untuk dipergunakan seperlunya.",
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
                    size: 4875,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        before: 400,
                      },
                      children: [
                        new TextRun({
                          text: "PIHAK KEDUA(II)",
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${vendorData[0].jabatan_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${vendorData[0].nama_vendor}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${vendorData[0].nama_pj}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 6,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 4875,
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
                      },
                      children: [
                        new TextRun({
                          text: "PIHAK PERTAMA(I)",
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
                          break: 6,
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const halaman11 = {
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
          children: [
            new TextRun({
              text: "RINGAKSAN KONTRAK",
              font: "Arial",
              size: 14 * 2,
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
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
                    size: 500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "1.",
                          size: 11 * 2,
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
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Nomor dan tanggal DIPA",
                          size: 11 * 2,
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
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_dipa
                          } Tanggal ${formatDate(documentData.tanggal_dipa)}`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "2.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Kode Kegiatan/Output/Akun",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${documentData.kode_kegiatan}`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "3.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Nomor dan tanggal SPK/Kontrak",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${
                            documentData.nomor_kontrak
                          } Tanggal ${formatDate(
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "4.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Nama Kontraktor/perusahaan",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${vendorData[0].nama_vendor}`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "5.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Alamat perusahaan",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${vendorData[0].alamat_vendor}`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "6.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Nilai SPK/Kontrak",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${formatCurrency(
                            calculateContractAkhir(contractsData).grandTotal
                          )} (${currencyToWords(
                            calculateContractAkhir(contractsData).grandTotal
                          )})`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "7.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Uraian dan volume pekerjaan",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${documentData.paket_pekerjaan}`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "8.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Cara pembayaran",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100 },
                      children: [
                        new TextRun({
                          text: `Langsung 100% ke `,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${vendorData[0].nama_vendor},`,
                          size: 11 * 2,
                          font: "Arial",
                          bold: true,
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `${vendorData[0].bank_vendor},`,
                          size: 11 * 2,
                          font: "Arial",
                          bold: true,
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: `No. Rekening ${vendorData[0].norek_vendor}`,
                          size: 11 * 2,
                          font: "Arial",
                          bold: true,
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { after: 100 },
                      children: [
                        new TextRun({
                          text: `a.n. ${vendorData[0].nama_vendor}`,
                          size: 11 * 2,
                          font: "Arial",
                          bold: true,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "9.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Jangka waktu pelaksanaan",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100 },
                      children: [
                        new TextRun({
                          text: `${calculateDaysBetween(
                            documentData.tanggal_mulai,
                            documentData.tanggal_selesai
                          )} (${numberToWords(
                            calculateDaysBetween(
                              documentData.tanggal_mulai,
                              documentData.tanggal_selesai
                            )
                          )}) hari kalender`,
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { after: 100 },
                      children: [
                        new TextRun({
                          text: `${formatDate(documentData.tanggal_mulai)}`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "10.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Tanggal penyelesaian pekerjaan",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: `${formatDate(documentData.tanggal_selesai)}`,
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "11.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Jangka waktu pemeliharaan",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "12.",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Ketentuan sanksi",
                          size: 11 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
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
                    size: 5250,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Denda 1‰ perhari maksimum 5% dari nilai SPK. Apabila telah mencapai angka 5%, Pihak Pertama berhak membatalkan SPK",
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
          children: [
            new TextRun({
              text: "",
              font: "Arial",
              size: 12 * 2,
              break: 2,
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
                    size: 4500,
                    type: WidthType.DXA,
                  },
                  children: [
                    new Paragraph({
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `Jakarta, ${formatDate(
                            documentData.tanggal_kontrak
                          )}`,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: `${officialData[0].jabatan}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 2,
                        }),
                        new TextRun({
                          text: `${officialData[0].nama}`,
                          size: 12 * 2,
                          font: "Arial",
                          break: 5,
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const halaman12 = {
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
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  verticalAlign: VerticalAlign.CENTER,
                  rowSpan: 2,
                  width: {
                    size: 30,
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 100, after: 100 },
                      indent: { left: 100, right: 100 },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "SURAT PERINTAH KERJA\n(SPK)",
                          bold: true,
                          size: 12 * 2,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  verticalAlign: VerticalAlign.CENTER,
                  width: {
                    size: 70,
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100, after: 100 },
                      indent: { left: 100, right: 100 },
                      children: [
                        new TextRun({
                          text: "SATUAN KERJA: SETDITJEN APLIKASI INFORMATIKA",
                          size: 10 * 2,
                          font: "Arial MT",
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
                  rowSpan: 2,
                  verticalAlign: VerticalAlign.CENTER,
                  width: {
                    size: 70,
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { before: 100 },
                      indent: {
                        left: 100,
                        right: 100,
                      },
                      children: [
                        new TextRun({
                          text: `NOMOR SPK\t: ${documentData.nomor_kontrak}`,
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { after: 100 },
                      indent: {
                        left: 100,
                        right: 100,
                      },
                      children: [
                        new TextRun({
                          text: `TANGGAL\t: ${formatDate(
                            documentData.tanggal_kontrak
                          )}`,
                          size: 10 * 2,
                          font: "Arial MT",
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
                    size: 30,
                    type: WidthType.PERCENTAGE,
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      spacing: { before: 100, after: 100 },
                      indent: { left: 100, right: 100 },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Halaman 1 dari 7",
                          size: 10 * 2,
                          font: "Arial MT",
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
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100 },
                      indent: { left: 100, right: 100 },
                      children: [
                        new TextRun({
                          text: "PAKET PEKERJAAN:",
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 100 },
                      indent: { left: 100, right: 100 },
                      children: [
                        new TextRun({
                          text: `${documentData.paket_pekerjaan}`,
                          size: 10 * 2,
                          font: "Arial MT",
                          break: 1,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      indent: { left: 100, right: 100 },
                      children: [
                        new TextRun({
                          text: "SPK ini mulai berlaku efektif terhitung sejak tanggal diterbitkannya SPK dan penyelesaian keseluruhan pekerjaan sebagaimana diatur dalam SPK ini.",
                          size: 10 * 2,
                          font: "Arial MT",
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
                  verticalAlign: VerticalAlign.CENTER,
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      spacing: { before: 100, after: 100 },
                      indent: {
                        left: 360,
                        right: 360,
                      },
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: `SUMBER DANA: DIPA Direktorat Jenderal Aplikasi Informatika ${documentData.nomor_dipa} Tahun Anggaran ${documentData.tahun_anggaran} dalam Rangka ${documentData.paket_pekerjaan}`,
                          size: 10 * 2,
                          font: "Arial MT",
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
                  verticalAlign: VerticalAlign.CENTER,
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                      indent: {
                        left: 360,
                        right: 360,
                      },
                      children: [
                        new TextRun({
                          text: `WAKTU PELAKSANAAN PEKERJAAN: ${calculateDaysBetween(
                            documentData.tanggal_mulai,
                            documentData.tanggal_selesai
                          )} Hari Kalender`,
                          size: 10 * 2,
                          font: "Arial MT",
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
                  verticalAlign: VerticalAlign.CENTER,
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "",
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                      ],
                    }),
                    new Table({
                      alignment: AlignmentType.CENTER,
                      width: { size: 9000, type: WidthType.DXA },
                      rows: generateTabelKontrakAkhir(contractsData),
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "",
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      indent: {
                        left: 360,
                        right: 360,
                      },
                      children: [
                        new TextRun({
                          text: "INSTRUKSI KEPADA PENYEDIA: Penagihan hanya dapat dilakukan setelah penyelesaian pekerjaan yang diperintahkan dalam SPK ini dan dibuktikan dengan Berita Acara Serah Terima. Jika pekerjaan tidak dapat diselesaikan dalam jangka waktu pelaksanaan pekerjaan karena kesalahan atau kelalaian penyedia maka penyedia berkewajiban untuk membayar denda kepada PPK sebesar 1/1000 (satu per seribu) dari nilai SPK atau nilai bagian SPK untuk setiap hari keterlambatan.",
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "",
                          size: 10 * 2,
                          font: "Arial MT",
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
                    size: 50,
                    type: WidthType.PERCENTAGE,
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      indent: {
                        left: 360,
                        right: 360,
                      },
                      children: [
                        new TextRun({
                          text: "Untuk dan atas nama Setditjen Aplikasi Informatika",
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                        new TextRun({
                          text: `${officialData[0].jabatan}`,
                          size: 10 * 2,
                          font: "Arial MT",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${officialData[0].nama}`,
                          size: 12 * 2,
                          font: "Arial MT",
                          break: 6,
                          bold: true,
                          underline: {
                            type: "single",
                            color: "000000",
                          },
                        }),
                        new TextRun({
                          text: `NIP. ${officialData[0].nip}`,
                          size: 10 * 2,
                          font: "Arial MT",
                          break: 1,
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "",
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE,
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      indent: {
                        left: 360,
                        right: 360,
                      },
                      children: [
                        new TextRun({
                          text: "Untuk dan atas nama penyedia",
                          size: 10 * 2,
                          font: "Arial MT",
                        }),
                        new TextRun({
                          text: `${vendorData[0].jabatan_pj}`,
                          size: 10 * 2,
                          font: "Arial MT",
                          break: 1,
                        }),
                        new TextRun({
                          text: "",
                          size: 12 * 2,
                          font: "Arial MT",
                          break: 6,
                        }),
                        new TextRun({
                          text: "(materai 10.000)",
                          size: 8 * 2,
                          font: "Arial MT",
                          break: 1,
                        }),
                        new TextRun({
                          text: `${vendorData[0].nama_pj}`,
                          size: 12 * 2,
                          font: "Arial MT",
                          break: 1,
                          bold: true,
                          underline: {
                            type: "single",
                            color: "000000",
                          },
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

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "pph-numbering",
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
            reference: "pakta-numbering",
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
            reference: "ba-ekn-numbering",
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
            reference: "ba-ekn-alphabeting",
            levels: [
              {
                level: 0,
                format: "lowerLetter",
                text: "%1.",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 },
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
            reference: "ba-ekn-numbering-2",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 1080, hanging: 360 },
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
            reference: "pppb-numbering",
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
            reference: "lppb-numbering",
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
            reference: "ba-stp-numbering",
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
        ...generateVendorPages(
          vendorData,
          documentData,
          officialData,
          contractsData
        ),
        halaman5,
        halaman6,
        halaman7,
        halaman8,
        halaman9,
        halaman10,
        halaman11,
        halaman12,
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
