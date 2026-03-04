"use client";

import { Button } from "@workspace/ui/components/button";
import { FaGithub, FaGoogle } from "react-icons/fa";

type OAuthProvider = "google" | "github";

interface OAuthButtonsProps {
  onOAuthClick: (provider: OAuthProvider) => void;
  disabled?: boolean;
}

export function OAuthButtons({
  onOAuthClick,
  disabled = false,
}: OAuthButtonsProps) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center md:flex-row">
      <Button
        variant="secondary"
        className="flex-1 px-2 w-full"
        onClick={() => onOAuthClick("google")}
        disabled={disabled}
        type="button"
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="secondary"
        className="flex-1 px-2 w-full"
        onClick={() => onOAuthClick("github")}
        disabled={disabled}
        type="button"
      >
        <FaGithub className="mr-2 h-4 w-4" />
        Continue with Github
      </Button>
    </div>
  );
}
