import React from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="h-screen w-full grid lg:grid-cols-[45%_55%] bg-background overflow-hidden">
      {/* Left: Brand panel — hidden on mobile */}
      <AuthBrandPanel />

      {/* Right: Form panel */}
      <div className="flex items-center justify-center px-6 py-10 lg:px-16 bg-background">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
