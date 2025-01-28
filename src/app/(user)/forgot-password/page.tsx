"use client";
import React, { useState } from "react";
import { forgotPassword } from "@/services/user";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster, toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        toast.success("Kode verifikasi telah dikirim!", {
          description: "Silakan cek email Anda",
          duration: 2000,
        });
        // Redirect to verification page with necessary params
        router.push(
          `/verification-reset-password?user_id=${result.userId}&email=${result.email}`
        );
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 flex items-center justify-center p-4">
      <Toaster position="top-center" expand={true} richColors />

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md relative">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo_kominfo.png"
            alt="Kominfo Logo"
            width={160}
            height={160}
            className="w-24 h-24 object-contain"
            priority
          />
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          Lupa Password
        </h2>

        <p className="text-white/80 text-center mb-6">
          Masukkan email Anda untuk menerima kode verifikasi
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Kode Verifikasi"}
          </button>
        </form>
      </div>
    </div>
  );
}
