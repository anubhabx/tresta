import React from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen w-full lg:h-screen lg:grid lg:grid-cols-[45%_55%] bg-background">
      {/* Left: Brand panel — desktop only */}
      <AuthBrandPanel />

      {/* Right: Form panel — full page on mobile, scrollable column on desktop */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-16 lg:overflow-y-auto">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
