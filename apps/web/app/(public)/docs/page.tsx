import Link from "next/link";
import { Metadata } from "next";
import { CodeBlock, InlineCode } from "@workspace/ui/components/code-block";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

export const metadata: Metadata = {
  title: "API Documentation | Tresta",
  description:
    "Fetch testimonials programmatically using our REST API. Learn about authentication, endpoints, and response formats.",
};

// Endpoint documentation component
function EndpointDoc({
  method,
  path,
  description,
  children,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  children?: React.ReactNode;
}) {
  const methodColors = {
    GET: "bg-success/10 text-success border-success/20",
    POST: "bg-primary/10 text-primary border-primary/20",
    PUT: "bg-warning/10 text-warning border-warning/20",
    DELETE: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("font-mono text-xs px-2", methodColors[method])}
        >
          {method}
        </Badge>
        <code className="font-mono text-sm">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="container max-w-4xl py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Fetch testimonials programmatically using our REST API.
        </p>
      </div>

      <div className="space-y-16">
        {/* Quick Start */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              1
            </span>
            Quick Start
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Get your first testimonials in 30 seconds:
            </p>
            <CodeBlock
              language="bash"
              title="Fetch testimonials"
              code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://tresta.app/api/v1/projects/your-project/testimonials`}
            />
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              2
            </span>
            Authentication
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              All API requests (except public endpoints) require an API key.
              Include it in the <InlineCode>Authorization</InlineCode> header:
            </p>
            <CodeBlock
              language="http"
              code={`Authorization: Bearer YOUR_API_KEY`}
            />
            <div className="bg-muted/50 border rounded-lg p-4 text-sm">
              <p className="font-medium mb-1">Get your API key</p>
              <p className="text-muted-foreground">
                Navigate to your{" "}
                <Link
                  href="/projects"
                  className="text-primary underline underline-offset-2"
                >
                  project settings
                </Link>{" "}
                → API Keys tab to create and manage your keys.
              </p>
            </div>
          </div>
        </section>

        {/* Base URL */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              3
            </span>
            Base URL
          </h2>
          <CodeBlock language="text" code={`https://tresta.app/api/v1`} />
        </section>

        {/* Endpoints */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              4
            </span>
            Endpoints
          </h2>

          <div className="border rounded-lg divide-y">
            <EndpointDoc
              method="GET"
              path="/projects/:slug/testimonials"
              description="List all approved testimonials for a project. Supports pagination."
            >
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Query Parameters
                </p>
                <div className="text-sm space-y-1">
                  <p>
                    <InlineCode>page</InlineCode> - Page number (default: 1)
                  </p>
                  <p>
                    <InlineCode>limit</InlineCode> - Items per page (default:
                    10, max: 100)
                  </p>
                  <p>
                    <InlineCode>rating</InlineCode> - Filter by minimum rating
                    (1-5)
                  </p>
                </div>
              </div>
            </EndpointDoc>

            <EndpointDoc
              method="GET"
              path="/testimonials/:id"
              description="Get a single testimonial by its ID."
            />

            <EndpointDoc
              method="POST"
              path="/projects/:slug/testimonials"
              description="Submit a new testimonial. No authentication required (public endpoint)."
            >
              <div className="mt-3">
                <Badge variant="secondary" className="text-xs">
                  Public Endpoint
                </Badge>
              </div>
            </EndpointDoc>

            <EndpointDoc
              method="PUT"
              path="/testimonials/:id/approve"
              description="Approve a pending testimonial. Requires API key."
            />

            <EndpointDoc
              method="DELETE"
              path="/testimonials/:id"
              description="Delete a testimonial. Requires API key."
            />
          </div>
        </section>

        {/* Response Format */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              5
            </span>
            Response Format
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              All responses are JSON. Successful responses have this structure:
            </p>
            <CodeBlock
              language="json"
              title="Success Response"
              code={`{
  "success": true,
  "data": {
    "testimonials": [
      {
        "id": "clp1234567890",
        "content": "Amazing product! Highly recommend.",
        "authorName": "Jane Doe",
        "authorRole": "Product Manager",
        "authorCompany": "Acme Inc",
        "authorAvatar": "https://...",
        "rating": 5,
        "isOAuthVerified": true,
        "status": "APPROVED",
        "createdAt": "2024-02-01T12:00:00Z"
      }
    ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}`}
            />
          </div>
        </section>

        {/* Error Handling */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              6
            </span>
            Error Handling
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Errors return appropriate HTTP status codes with this structure:
            </p>
            <CodeBlock
              language="json"
              title="Error Response"
              code={`{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}`}
            />

            <div className="border rounded-lg divide-y text-sm">
              <div className="p-3 flex items-center gap-4">
                <InlineCode>400</InlineCode>
                <span className="text-muted-foreground">
                  Bad Request - Invalid parameters
                </span>
              </div>
              <div className="p-3 flex items-center gap-4">
                <InlineCode>401</InlineCode>
                <span className="text-muted-foreground">
                  Unauthorized - Missing or invalid API key
                </span>
              </div>
              <div className="p-3 flex items-center gap-4">
                <InlineCode>404</InlineCode>
                <span className="text-muted-foreground">
                  Not Found - Resource doesn't exist
                </span>
              </div>
              <div className="p-3 flex items-center gap-4">
                <InlineCode>429</InlineCode>
                <span className="text-muted-foreground">
                  Rate Limited - Too many requests
                </span>
              </div>
              <div className="p-3 flex items-center gap-4">
                <InlineCode>500</InlineCode>
                <span className="text-muted-foreground">
                  Server Error - Something went wrong
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              7
            </span>
            Rate Limits
          </h2>
          <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-muted-foreground">100 requests/hour</p>
              </div>
              <div>
                <p className="font-medium">Pro Plan</p>
                <p className="text-muted-foreground">10,000 requests/hour</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Rate limit headers are included in all responses:{" "}
              <InlineCode>X-RateLimit-Remaining</InlineCode>,{" "}
              <InlineCode>X-RateLimit-Reset</InlineCode>
            </p>
          </div>
        </section>

        {/* SDKs */}
        {/* <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
              8
            </span>
            SDKs & Libraries
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Use our official SDKs for easier integration:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border rounded-lg p-4">
                <p className="font-medium mb-2">React / Next.js</p>
                <CodeBlock language="bash" code={`npm install @tresta/react`} />
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-medium mb-2">JavaScript</p>
                <CodeBlock language="bash" code={`npm install @tresta/js`} />
              </div>
            </div>

            <CodeBlock
              language="tsx"
              title="React Example"
              code={`import { TrestaWidget } from '@tresta/react';

function Testimonials() {
  return (
    <TrestaWidget 
      project="your-project-slug"
      layout="carousel"
      theme="auto"
    />
  );
}`}
            />
          </div>
        </section> */}

        {/* Support */}
        <section className="border-t pt-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? We're here to help.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="mailto:support@tresta.app"
                className="text-primary underline underline-offset-2 text-sm"
              >
                Contact Support
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href="https://github.com/tresta/api"
                className="text-primary underline underline-offset-2 text-sm"
              >
                GitHub
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
