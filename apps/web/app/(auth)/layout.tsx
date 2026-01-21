import Dither from "@/components/ui/dither";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="h-screen w-full flex items-center justify-center relative">
      {children}
      <div className="absolute inset-0 -z-10">
        <Dither
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.3}
          colorNum={16}
          waveAmplitude={0}
          waveFrequency={0}
          waveSpeed={0.01}
        />
      </div>
    </div>
  );
};

export default AuthLayout;
