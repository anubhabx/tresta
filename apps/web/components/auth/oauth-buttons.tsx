"use client";

import { Button } from "@workspace/ui/components/button";
import { FaGithub, FaGoogle } from "react-icons/fa";

type OAuthProvider = "google" | "github";

interface OAuthButtonsProps {
  onOAuthClick: (provider: OAuthProvider) => void;
  layout?: "horizontal" | "vertical";
  disabled?: boolean;
}

export function OAuthButtons({
  onOAuthClick,
  layout = "horizontal",
  disabled = false,
}: OAuthButtonsProps) {
  const containerClass =
    layout === "horizontal"
      ? "flex gap-2 items-center justify-center"
      : "flex flex-col gap-2 items-center justify-center";

  const buttonClass = layout === "horizontal" ? "flex-1 px-2" : "w-full";

  return (
    <div className={containerClass}>
      <Button
        variant="secondary"
        className={buttonClass}
        onClick={() => onOAuthClick("google")}
        disabled={disabled}
        type="button"
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="secondary"
        className={buttonClass}
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
