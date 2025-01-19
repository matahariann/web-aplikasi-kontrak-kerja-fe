import axios from "axios";
import axiosInstance from "@/lib/axios";

export type Employee = {
  nip: string;
  nama: string;
  email: string;
  noTelp: string;
  alamat: string;
};

export interface EmployeeResponse {
  success: boolean;
  data: {
    employee: Employee;
  };
}

export interface ImageData {
  id: number;
  name: string;
  image: string;
}

export interface DocumentListResponse {
  status: string;
  data: Document[];
  message: string;
}

export interface Document {
  id: number;
  nomor_kontrak: string;
  tanggal_kontrak: string;
  paket_pekerjaan: string;
  tahun_anggaran: string;
  vendor_id: number;
  vendor?: {
    id: number;
    nama_vendor: string;
    alamat_vendor: string;
    nama_pj: string;
    jabatan_pj: string;
    npwp: string;
    bank_vendor: string;
    norek_vendor: string;
    nama_rek_vendor: string;
  };
  officials?: Array<{
    id: number;
    nip: string;
    nama: string;
    jabatan: string;
    periode_jabatan: string;
  }>;
  contracts?: Array<{
    id: number;
    document_id: number;
    jenis_kontrak: string;
    deskripsi: string;
    nilai_kontral_awal: number;
    nilai_kontrak_akhir: number;
  }>;
}

export interface DocumentDetailResponse {
  status: string;
  data: {
    document: Document;
    vendor: {
      id: number;
      nama_vendor: string;
      alamat_vendor: string;
      npwp: string;
      bank_vendor: string;
      norek_vendor: string;
      nama_rek_vendor: string;
    };
    officials: Array<{
      id: number;
      nip: string;
      nama: string;
      jabatan: string;
      periode_jabatan: string;
      surat_keputusan: string;
    }>;
    contracts: Array<{
      id: number;
      document_id: number;
      jenis_kontrak: string;
      deskripsi: string;
      jumlah_orang: number;
      durasi_kontrak: number;
      nilai_kontral_awal: number;
      nilai_kontrak_akhir: number;
    }>;
  };
  message: string;
}

export const getEmployee = async (token: string): Promise<Employee> => {
  try {
    const response = await axios.get<EmployeeResponse>(
      `http://localhost:8000/api/employee/authenticated`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Return hanya bagian employee dari response
    return response.data.data.employee;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data pegawai"
      );
    }
    throw error;
  }
};

export const getData = async (): Promise<Document[]> => {
  try {
    const response = await axiosInstance.get<DocumentListResponse>("/get-data");

    // Log response untuk debugging
    console.log("Response from getData:", response.data);

    if (
      response.data.status === "success" &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Gagal mengambil data dokumen");
  } catch (error) {
    console.error("Error fetching documents:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Gagal mengambil data dokumen");
  }
};

export const getDataDetail = async (
  id: number
): Promise<DocumentDetailResponse["data"]> => {
  try {
    const response = await axiosInstance.get<DocumentDetailResponse>(
      `/get-data-detail/${id}`
    );

    // Log response untuk debugging
    console.log("Response from getDataDetail:", response.data);

    if (response.data.status === "success") {
      return response.data.data;
    }

    throw new Error(response.data.message || "Gagal mengambil detail dokumen");
  } catch (error) {
    console.error("Error fetching document detail:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Gagal mengambil detail dokumen");
  }
};

export const getSessionData = async (token: string, sessionId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/session-data/${sessionId}`,
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
        error.response?.data?.message || "Gagal mengambil data session"
      );
    }
    throw error;
  }
};

export const getImage = async (
  token: string,
  id: number
): Promise<ImageData> => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/showImage/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      return response.data.data;
    }

    throw new Error(response.data.message || "Gagal mengambil gambar");
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Terjadi kesalahan dalam mendapatkan gambar");
  }
};
