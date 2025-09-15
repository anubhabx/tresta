import React from "react";
import { BackgroundBeams } from "@workspace/ui/components/background-beams";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="h-screen w-full flex items-center justify-center relative">
      {children}
      <BackgroundBeams className="absolute inset-0 -z-10 h-full w-full" />
    </div>
  );
};

export default AuthLayout;
