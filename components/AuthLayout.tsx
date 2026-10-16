"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col md:flex-row">
      {/* LEFT — Full fashion image */}
      <div className="relative h-[300px] w-full shrink-0 overflow-hidden bg-[#f5f3ee] md:h-auto md:w-1/2 lg:w-[57%]">
        <img
          src="/Images/velmori-Auth-fashion.png"
          alt="VELMORI fashion campaign"
          className="absolute inset-0 h-full w-full object-contain object-center"
          draggable={false}
        />
      </div>

      {/* RIGHT — Auth form panel */}
      <div className="flex w-full flex-1 items-start justify-center overflow-y-auto bg-[#f5f3ee] px-5 py-12 sm:px-8 md:w-1/2 md:items-center md:py-16 lg:w-[43%] lg:px-12">
        <div className="w-full max-w-[480px]">
          {children}
        </div>
      </div>
    </div>
  );
}
