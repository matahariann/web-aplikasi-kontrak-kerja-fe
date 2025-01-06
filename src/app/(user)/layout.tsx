import Sidebar from "@/components/sidebar";
import React from "react";
import Header from "@/components/header";
import PageWrapper from "@/components/page-wrapper";
import MarginWidthWrapper from "@/components/margin-with-wrapper";

type Props = {
  children: React.ReactNode;
};

export default function LayoutProtected({ children }: Props) {
  return (
    <html lang="en">
      <Sidebar />
      <body className="bg-gray-100">
        <div className="flex">
          <main className="flex-1">
            <Header />
            <MarginWidthWrapper>
              <div className="bg-white ml-6 mt-8 mb-4 p-4 rounded-sm shadow-sm">
              <PageWrapper>{children}</PageWrapper>
              </div>
            </MarginWidthWrapper>
          </main>
        </div>
      </body>
    </html>
  );
}
