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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { generateContractDocument } from "@/components/GenerateDocx";
import { getDocumentData } from "@/services/documents";
import { Packer } from "docx";
import { saveAs } from "file-saver";

export default function RiwayatDokumen() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan");
      setIsLoading(false);
      return;
    }

    fetch("http://localhost:8000/api/documents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Gagal mengambil data dokumen");
        return response.json();
      })
      .then((data) => {
        setDocuments(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const handlePrint = async (nomorKontrak) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const documentData = await getDocumentData(token, nomorKontrak);

      // Generate document with all contracts
      const doc = await generateContractDocument({
        contractsData: documentData.contracts,
        documentData: documentData,
        vendorData: documentData.vendor,
        officialData: documentData.officials,
      });

      const blob = await Packer.toBlob(doc);
      const filename = `kontrak_${documentData.nomor_kontrak}.docx`;
      saveAs(blob, filename);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Gagal mencetak dokumen"
      );
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.direction === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredDocuments = sortedDocuments.filter(
    (doc) =>
      doc.nomor_kontrak?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.paket_pekerjaan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vendor?.nama_vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
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
            Total: {documents.length} dokumen
          </Badge>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              Daftar dokumen kontrak yang telah dibuat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cari dokumen atau vendor..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
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
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("nomor_kontrak")}
                    >
                      No. Kontrak{" "}
                      {sortConfig.key === "nomor_kontrak" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("paket_pekerjaan")}
                    >
                      Paket Pekerjaan{" "}
                      {sortConfig.key === "paket_pekerjaan" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("vendor.nama_vendor")}
                    >
                      Vendor{" "}
                      {sortConfig.key === "vendor.nama_vendor" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("tanggal_kontrak")}
                    >
                      Tanggal Kontrak{" "}
                      {sortConfig.key === "tanggal_kontrak" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("tahun_anggaran")}
                    >
                      Tahun Anggaran{" "}
                      {sortConfig.key === "tahun_anggaran" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <TableSkeleton />
                      </TableCell>
                    </TableRow>
                  ) : currentDocuments.length > 0 ? (
                    currentDocuments.map((doc) => (
                      <TableRow
                        key={doc.nomor_kontrak}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {doc.nomor_kontrak}
                        </TableCell>
                        <TableCell>{doc.paket_pekerjaan}</TableCell>
                        <TableCell>{doc.vendor?.nama_vendor}</TableCell>
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(doc.nomor_kontrak)}
                              className="flex items-center gap-2 hover:bg-gray-100"
                            >
                              <Printer className="h-4 w-4" />
                              Cetak
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {documents.length === 0
                          ? "Belum ada dokumen"
                          : "Tidak ada dokumen yang sesuai dengan pencarian"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Menampilkan {startIndex + 1}-
                {Math.min(endIndex, filteredDocuments.length)} dari{" "}
                {filteredDocuments.length} dokumen
              </div>
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
                  Halaman {currentPage} dari {totalPages}
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
