"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Employee, getEmployee } from "@/services/employee";
import GoogleDocViewer from "@/components/GoogleDocViewer";

export default function Home() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const docId = "1irDOliYKXNO0wlnVjiYN4N_P6oockBm0";

  const getData = async (token: string) => {
    try {
      const res = await getEmployee(token);
      setEmployee(res);
    } catch (error) {
      console.error("Error getting employee data:", error);
      // Optional: Handle error UI state
      router.push("/"); // Redirect ke login jika terjadi error
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      getData(token);
    }
  }, [router]);

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return "Selamat Pagi";
      } else if (hour >= 12 && hour < 15) {
        return "Selamat Siang";
      } else if (hour >= 15 && hour < 18) {
        return "Selamat Sore";
      } else {
        return "Selamat Malam";
      }
    };

    setGreeting(getGreeting());

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-[2000px] mx-auto space-y-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Beranda</h1>

          {/* Dynamic Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200">
            <div className="p-3 flex items-center gap-3">
              <div>
                <span className="text-md font-medium text-gray-800">
                  {greeting} {employee?.nama}! Selamat datang di Dokumen Kontrak Kerja Apps Ditjen Aptika
                </span>
              </div>
            </div>
          </div>

          {/* Google Doc Container */}
          <div className="w-full">
            <GoogleDocViewer docId={docId} />
          </div>
        </div>
      </div>
    </main>
  );
}
