import Dither from "@/components/ui/dither";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="h-screen w-full flex items-center justify-center relative">
      {children}
      <Dither
        waveColor={[0.5, 0.6, 0.5]}
        disableAnimation={false}
        enableMouseInteraction
        mouseRadius={0.3}
        colorNum={16}
        waveAmplitude={0}
        waveFrequency={0}
        waveSpeed={0.01}
      />
    </div>
  );
};

export default AuthLayout;
