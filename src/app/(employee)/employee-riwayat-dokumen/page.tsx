"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  FileClock,
  ArrowUpDown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { generateContractDocument } from "@/components/GenerateDocx";
import { getData, getDataDetail } from "@/services/employee";
import { Packer } from "docx";
import { saveAs } from "file-saver";

interface Document {
  id: number;
  nomor_kontrak: string;
  tanggal_kontrak: string;
  paket_pekerjaan: string;
  tahun_anggaran: string;
  vendor?: Array<{
    id: number;
    nama_vendor: string;
  }>;
}

interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

export default function RiwayatDokumen() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [filterYear, setFilterYear] = useState("all");
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getData();
      console.log("Fetched documents:", data); // Debug log

      if (Array.isArray(data)) {
        setDocuments(data);

        // Extract unique years
        const uniqueYears = [...new Set(data.map((doc) => doc.tahun_anggaran))]
          .sort()
          .reverse();
        setYears(uniqueYears);
      } else {
        console.warn("Received non-array data:", data);
        setDocuments([]);
        setYears([]);
      }
    } catch (error) {
      console.error("Error in fetchDocuments:", error);
      setError(error instanceof Error ? error.message : "Gagal mengambil data");
      setDocuments([]);
      setYears([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async (id: number) => {
    try {
      setError("");
      const response = await getDataDetail(id);
      console.log("Print data:", response); // Debug log

      const doc = await generateContractDocument({
        contractsData: response.contracts,
        documentData: response.document,
        vendorData: response.document.vendor,
        officialData: response.officials,
      });

      const blob = await Packer.toBlob(doc);
      const filename = `${response.document.paket_pekerjaan}.docx`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error in handlePrint:", error);
      setError(
        error instanceof Error ? error.message : "Gagal mencetak dokumen"
      );
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const SortButton = ({ column }: { column: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="ml-2 hover:bg-gray-100"
      onClick={() => handleSort(column)}
    >
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );

  // Filter and sort documents
  const filteredAndSortedDocuments = React.useMemo(() => {
    let result = [...documents];

    // Year filter
    if (filterYear !== "all") {
      result = result.filter((doc) => doc.tahun_anggaran === filterYear);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.nomor_kontrak?.toLowerCase().includes(searchLower) ||
          doc.paket_pekerjaan?.toLowerCase().includes(searchLower) ||
          doc.vendor?.some(v => 
            v.nama_vendor?.toLowerCase().includes(searchLower)
          )
      );
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof Document];
        let bVal = b[sortConfig.key as keyof Document];

        // Handle sorting untuk multiple vendors
        if (sortConfig.key === "vendor.nama_vendor") {
          // Gunakan nama vendor pertama untuk sorting
          aVal = a.vendor?.[0]?.nama_vendor;
          bVal = b.vendor?.[0]?.nama_vendor;
        }

        // Handle dates
        if (sortConfig.key === "tanggal_kontrak") {
          aVal = new Date(a.tanggal_kontrak).getTime();
          bVal = new Date(b.tanggal_kontrak).getTime();
        }

        if (!aVal) return 1;
        if (!bVal) return -1;

        const comparison = aVal > bVal ? 1 : -1;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [documents, searchTerm, sortConfig, filterYear]);

  // Pagination
  const totalDocuments = filteredAndSortedDocuments.length;
  const totalPages = Math.ceil(totalDocuments / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalDocuments);
  const currentDocuments = filteredAndSortedDocuments.slice(
    startIndex,
    endIndex
  );

  // Loading skeleton
  const TableSkeleton = () => (
    <>
      {[...Array(itemsPerPage)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-6 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <main className="bg-gray-50">
      <div className="max-w-[2000px] mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <FileClock className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Riwayat Dokumen
            </h1>
          </div>
          <Badge variant="outline" className="text-sm">
            Total: {totalDocuments} dokumen
          </Badge>
        </header>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Daftar Dokumen Kontrak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Cari dokumen atau vendor..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Select
                  value={filterYear}
                  onValueChange={(value) => {
                    setFilterYear(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per halaman</SelectItem>
                  <SelectItem value="10">10 per halaman</SelectItem>
                  <SelectItem value="20">20 per halaman</SelectItem>
                  <SelectItem value="50">50 per halaman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      No. Kontrak
                      <SortButton column="nomor_kontrak" />
                    </TableHead>
                    <TableHead>
                      Paket Pekerjaan
                      <SortButton column="paket_pekerjaan" />
                    </TableHead>
                    <TableHead>
                      Vendor
                      <SortButton column="vendor.nama_vendor" />
                    </TableHead>
                    <TableHead>
                      Tanggal Kontrak
                      <SortButton column="tanggal_kontrak" />
                    </TableHead>
                    <TableHead>
                      Tahun Anggaran
                      <SortButton column="tahun_anggaran" />
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : currentDocuments.length > 0 ? (
                    currentDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.nomor_kontrak}
                        </TableCell>
                        <TableCell>{doc.paket_pekerjaan}</TableCell>
                        <TableCell>
                          {" "}
                          {doc.vendor && doc.vendor.length > 0 ? (
                            <div className="space-y-1">
                              {doc.vendor.map((v, index) => (
                                <div key={v.id} className="flex items-center">
                                  <span>{v.nama_vendor}</span>
                                  {index < doc.vendor!.length - 1 && (
                                    <span className="mx-1 text-gray-400">
                                      |
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(doc.tanggal_kontrak),
                            "dd MMMM yyyy",
                            {
                              locale: id,
                            }
                          )}
                        </TableCell>
                        <TableCell>{doc.tahun_anggaran}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(doc.id)}
                            className="hover:bg-gray-100"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Cetak
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        {documents.length === 0
                          ? "Belum ada dokumen yang tersedia"
                          : "Tidak ada dokumen yang sesuai dengan kriteria pencarian"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Menampilkan {startIndex + 1}-{endIndex} dari {totalDocuments}{" "}
                dokumen
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Halaman {currentPage} dari {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
