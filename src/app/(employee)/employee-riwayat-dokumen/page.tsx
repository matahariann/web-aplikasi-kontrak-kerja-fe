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
import { Printer, Search } from "lucide-react";
import { generateContractDocument } from "@/components/GenerateDocx";
import { getDocumentData } from "@/services/employee";
import { Packer } from "docx";
import { saveAs } from "file-saver";

export default function RiwayatDokumen() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan");
      setIsLoading(false);
      return;
    }

    // Fetch documents with eager loaded relationships
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

      // Generate document for each contract using the related data
      for (const contract of documentData.contracts) {
        const doc = await generateContractDocument({
          contractData: contract,
          documentData: documentData,
          vendorData: documentData.vendor,
          officialData: documentData.officials,
        });

        const blob = await Packer.toBlob(doc);
        const filename = `kontrak_${documentData.nomor_kontrak}_${contract.id}.docx`;
        saveAs(blob, filename);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Gagal mencetak dokumen"
      );
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.nomor_kontrak?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.paket_pekerjaan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vendor?.nama_vendor?.toLowerCase().includes(searchTerm.toLowerCase()) // Added vendor name search
  );

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Riwayat Dokumen</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar dokumen kontrak yang telah dibuat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cari dokumen atau vendor..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Kontrak</TableHead>
                  <TableHead>Paket Pekerjaan</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Tanggal Kontrak</TableHead>
                  <TableHead>Tahun Anggaran</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading &&
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.nomor_kontrak}>
                      <TableCell>{doc.nomor_kontrak}</TableCell>
                      <TableCell>{doc.paket_pekerjaan}</TableCell>
                      <TableCell>{doc.vendor?.nama_vendor}</TableCell>
                      <TableCell>
                        {format(new Date(doc.tanggal_kontrak), "dd MMMM yyyy", {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell>{doc.tahun_anggaran}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(doc.nomor_kontrak)}
                          className="flex items-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Cetak
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {documents.length === 0
                          ? "Belum ada dokumen"
                          : "Tidak ada dokumen yang sesuai dengan pencarian"}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
