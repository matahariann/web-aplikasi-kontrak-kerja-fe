import axios from "axios";

import { OfficialData } from "./official";
import axiosInstance from "@/lib/axios";

export interface DocumentData {
  id: number;
  nomor_kontrak: string;
  tanggal_kontrak: string;
  paket_pekerjaan: string;
  tahun_anggaran: string;
  nomor_pp: string;
  tanggal_pp: string;
  nomor_hps: string;
  tanggal_hps: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_pph1: string;
  tanggal_pph1: string;
  nomor_ukn: string;
  tanggal_ukn: string;
  tanggal_undangan_ukn: string;
  nomor_ba_ekn: string;
  tanggal_ba_ekn: string;
  nomor_pppb: string;
  tanggal_pppb: string;
  nomor_lppb: string;
  tanggal_lppb: string;
  nomor_ba_stp: string;
  tanggal_ba_stp: string;
  nomor_ba_pem: string;
  tanggal_ba_pem: string;
  nomor_dipa: string;
  tanggal_dipa: string;
  kode_kegiatan: string;
  form_session_id?: string;
}

interface DocumentResponse {
  message: string;
  data: {
    document: DocumentData;
    session: {
      id: string;
      current_step: string;
    };
  };
}

export interface DocumentWithOfficialsData {
  officials: OfficialData[];
  document: DocumentData;
}

export const getDocumentData = async () => {
  try {
    const response = await axiosInstance.get("/get-document");
    return response.data;
  } catch (error) {
    console.error("Document fetch error:", error);
    return {
      data: {
        document: null,
        session: {
          id: "",
          current_step: "document",
          temp_data: {},
        },
      },
    };
  }
};

export const addDocument = async (
  token: string,
  data: DocumentWithOfficialsData
): Promise<DocumentResponse> => {
  try {
    const response = await axios.post<DocumentResponse>(
      `http://localhost:8000/api/add-document`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Gagal menyimpan data dokumen"
      );
    }
    throw error;
  }
};

export const updateDocument = async (
  token: string,
  id: number, // Mengubah parameter dari nomor_kontrak menjadi id
  data: DocumentWithOfficialsData
): Promise<DocumentResponse> => {
  try {
    const response = await axios.put<DocumentResponse>(
      `http://localhost:8000/api/update-document/${id}`, // Mengubah URL
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Gagal memperbarui data dokumen"
      );
    }
    throw error;
  }
};
