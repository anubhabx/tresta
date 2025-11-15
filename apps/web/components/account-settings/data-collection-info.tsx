import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  InfoIcon,
  UserIcon,
  FolderIcon,
  MessageSquareIcon,
  CookieIcon,
  ShieldCheckIcon,
  MailIcon,
  ImageIcon,
  LinkIcon,
  ClockIcon,
  LayoutIcon,
  CreditCardIcon,
  UserCheckIcon,
  FingerprintIcon,
  GlobeIcon,
  DatabaseIcon,
  ServerIcon,
  LockIcon,
  Trash2Icon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  LucideIcon,
} from "lucide-react";

interface DataItem {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface DataCategory {
  title: string;
  icon: LucideIcon;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  description: string;
  items: DataItem[];
  note?: string;
}

interface DataUsageItem {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface StorageItem {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface DataRight {
  icon: LucideIcon;
  label: string;
  description: string;
}

const DATA_CATEGORIES: DataCategory[] = [
  {
    title: "Account Information",
    icon: UserIcon,
    badge: "Required",
    badgeVariant: "outline",
    description: "We collect the following data when you create an account:",
    items: [
      {
        icon: MailIcon,
        label: "Email address",
        description:
          "For authentication, account recovery, and important notifications",
      },
      {
        icon: UserIcon,
        label: "First and last name",
        description: "To personalize your experience (optional)",
      },
      {
        icon: ImageIcon,
        label: "Profile picture",
        description:
          "Stored in Azure Blob Storage, synced from OAuth providers or uploaded directly (optional)",
      },
      {
        icon: LinkIcon,
        label: "OAuth connections",
        description:
          "If you sign in with Google or GitHub, we store your provider ID and email for authentication",
      },
      {
        icon: ClockIcon,
        label: "Account timestamps",
        description:
          "Creation and last update dates for security and audit purposes",
      },
    ],
  },
  {
    title: "Project & Content Data",
    icon: FolderIcon,
    badge: "User-Created",
    badgeVariant: "secondary",
    description: "Data you create while using our service:",
    items: [
      {
        icon: FolderIcon,
        label: "Projects",
        description:
          "Name, description, website URL, logo, brand colors, visibility settings, project type",
      },
      {
        icon: LayoutIcon,
        label: "Widgets",
        description:
          "Embed configurations, layout preferences, customization settings (stored as JSON)",
      },
      {
        icon: CreditCardIcon,
        label: "Subscription data",
        description:
          "Plan type (Free/Pro), billing status, subscription period if applicable",
      },
    ],
  },
  {
    title: "Testimonial Submission Data",
    icon: MessageSquareIcon,
    badge: "Public-Facing",
    badgeVariant: "outline",
    description:
      "When someone submits a testimonial to your projects, we collect:",
    items: [
      {
        icon: UserCheckIcon,
        label: "Author information",
        description: "Name, email (optional), role, company, avatar",
      },
      {
        icon: MessageSquareIcon,
        label: "Testimonial content",
        description: "Text, rating, media URLs (video/audio)",
      },
      {
        icon: ShieldCheckIcon,
        label: "OAuth verification data",
        description:
          "Provider (Google/GitHub) and subject ID if verified via OAuth",
      },
      {
        icon: FingerprintIcon,
        label: "Technical metadata",
        description:
          "IP address and user agent (browser information) for spam prevention and analytics",
      },
      {
        icon: GlobeIcon,
        label: "Source information",
        description:
          "Submission method (web form, Twitter import, etc.) and source URL if applicable",
      },
    ],
    note: "Note: IP addresses and user agents are used solely for spam prevention and are not shared publicly.",
  },
  {
    title: "Browser Storage",
    icon: CookieIcon,
    badge: "Local Only",
    badgeVariant: "outline",
    description: "We use browser localStorage to store:",
    items: [
      {
        icon: LayoutIcon,
        label: "UI preferences",
        description:
          "Sidebar state (open/closed), project display mode (grid/list)",
      },
      {
        icon: LockIcon,
        label: "Authentication tokens",
        description:
          "Managed by Clerk (our auth provider) for secure session management",
      },
    ],
    note: "This data never leaves your browser and is not sent to our servers.",
  },
];

const DATA_USAGE: DataUsageItem[] = [
  {
    icon: ServerIcon,
    label: "Provide our services",
    description:
      "Display your projects, manage testimonials, generate widget embeds",
  },
  {
    icon: ShieldCheckIcon,
    label: "Authentication & security",
    description:
      "Verify your identity, prevent unauthorized access, detect spam",
  },
  {
    icon: MailIcon,
    label: "Communication",
    description:
      "Send account-related notifications (password resets, important updates)",
  },
  {
    icon: InfoIcon,
    label: "Improve our platform",
    description:
      "Understand usage patterns to build better features (aggregated, anonymized data only)",
  },
];

const STORAGE_INFO: StorageItem[] = [
  {
    icon: DatabaseIcon,
    label: "Database",
    description: "PostgreSQL (secure, encrypted at rest)",
  },
  {
    icon: ServerIcon,
    label: "File storage",
    description: "Azure Blob Storage (avatars, logos, media files)",
  },
  {
    icon: LockIcon,
    label: "Authentication",
    description: "Clerk (SOC 2 Type II certified, GDPR compliant)",
  },
  {
    icon: Trash2Icon,
    label: "Data deletion",
    description:
      "When you delete your account, all data is permanently removed via cascade deletes",
  },
];

const DATA_RIGHTS: DataRight[] = [
  {
    icon: DownloadIcon,
    label: "Access",
    description: "Export all your data anytime (use the Export button above)",
  },
  {
    icon: EditIcon,
    label: "Rectify",
    description: "Update your profile information at any time",
  },
  {
    icon: Trash2Icon,
    label: "Delete",
    description: "Permanently delete your account and all associated data",
  },
  {
    icon: FileTextIcon,
    label: "Port",
    description: "Download your data in JSON format for portability",
  },
];

const DataCollectionInfo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5" />
          Data Collection Transparency
        </CardTitle>
        <CardDescription>
          Complete disclosure of what data we collect, how we use it, and your
          rights
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {DATA_CATEGORIES.map((category, index) => (
          <React.Fragment key={category.title}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <category.icon className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">{category.title}</h4>
                <Badge variant={category.badgeVariant} className="ml-auto">
                  {category.badge}
                </Badge>
              </div>
              <div className="pl-6 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {category.items.map((item) => (
                    <li key={item.label} className="flex items-start gap-2">
                      <item.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{item.label}</strong> - {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
                {category.note && (
                  <p className="text-xs text-muted-foreground italic mt-2 flex items-start gap-1.5">
                    <AlertCircleIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {category.note}
                  </p>
                )}
              </div>
            </div>
            {index < DATA_CATEGORIES.length - 1 && <Separator />}
          </React.Fragment>
        ))}

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">How We Use Your Data</h4>
          </div>
          <div className="pl-6 space-y-2">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {DATA_USAGE.map((usage) => (
                <li key={usage.label} className="flex items-start gap-2">
                  <usage.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>{usage.label}</strong> - {usage.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Data Storage & Security</h4>
          </div>
          <div className="pl-6 space-y-2">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {STORAGE_INFO.map((storage) => (
                <li key={storage.label} className="flex items-start gap-2">
                  <storage.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>{storage.label}</strong> - {storage.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <p className="text-sm font-semibold">Your Data Rights</p>
          <p className="text-sm text-muted-foreground">
            You have the right to:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {DATA_RIGHTS.map((right) => (
              <li key={right.label} className="flex items-start gap-2">
                <CheckCircle2Icon className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{right.label}</strong> - {right.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            <strong>No third-party analytics or tracking:</strong> We do not use
            Google Analytics, Facebook Pixel, or any third-party tracking
            scripts. We do not sell or share your personal data with third
            parties for marketing purposes.
            <br />
            <br />
            Last updated: November 6, 2025
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCollectionInfo;
