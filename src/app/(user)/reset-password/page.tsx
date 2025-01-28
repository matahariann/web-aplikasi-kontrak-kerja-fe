"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/services/user";
import { Toaster, toast } from "sonner";
import Image from "next/image";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const userId = searchParams.get("user_id");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User ID tidak valid");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(userId, password, passwordConfirmation);
      toast.success("Password berhasil diubah!", {
        description: "Silakan login dengan password baru Anda",
        duration: 2000,
      });
      setTimeout(() => router.push("/login"), 2000);
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
          Reset Password
        </h2>

        <p className="text-white/80 text-center mb-6">
          Masukkan password baru Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">Password Baru</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Konfirmasi Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Konfirmasi password baru"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}