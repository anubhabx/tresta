import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import React from "react";

const page = () => {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
};
export default page;
