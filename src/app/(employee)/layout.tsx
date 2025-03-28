import Sidebar from "@/components/sidebar";
import React from "react";
import Header from "@/components/header";
import PageWrapper from "@/components/page-wrapper";
import MarginWidthWrapper from "@/components/margin-with-wrapper";
import { Toaster } from "sonner";

type Props = {
  children: React.ReactNode;
};

export default function LayoutProtected({ children }: Props) {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-100 min-h-screen">
          <Header />
          <MarginWidthWrapper>
            <div className="bg-white mx-6 mt-8 mb-4 p-4 rounded-sm shadow-sm">
              <PageWrapper>
                <Toaster position="top-center" expand={true} richColors />
                {children}
              </PageWrapper>
            </div>
          </MarginWidthWrapper>
        </main>
      </div>
    </div>
  );
}
