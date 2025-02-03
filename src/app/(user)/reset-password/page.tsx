"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/services/user";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <Toaster position="top-center" expand={true} richColors />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-800/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-150" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-300" />
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Card Container */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md relative border border-white/20 shadow-2xl">
        {/* Logo Container with Glow Effect */}
        <div className="mb-6 flex justify-center relative">
          <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full" />
          <div className="w-32 h-32 relative">
            <Image
              src="/logo_komdigi.png"
              alt="Logo Komdigi"
              width={160}
              height={160}
              className="w-full h-full object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-wide">
          Reset Password
        </h2>
        <div className="flex-grow border-t border-white/20 my-4"></div>
        <p className="text-white/80 text-center mb-8">
          Masukkan password baru Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Input */}
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium pl-1">
              Password Baru
            </label>
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
                         focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300
                         group-hover:border-white/30"
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium pl-1">
              Konfirmasi Password
            </label>
            <div className="relative group">
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Konfirmasi password baru"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
                         focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300
                         group-hover:border-white/30"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 
                     text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     font-semibold text-lg shadow-lg shadow-blue-900/30"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </span>
            ) : (
              "Simpan Password Baru"
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-8 text-center text-white/70 text-sm">
          <Link
            href="/login"
            className="text-white font-medium hover:underline transition-all duration-300"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}