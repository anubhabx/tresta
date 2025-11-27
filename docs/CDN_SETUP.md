# CDN Setup Guide for Tresta

Since Tresta uses Azure Blob Storage for storing assets (logos, testimonials, videos), "hosting a CDN" effectively means setting up a Content Delivery Network to cache and serve these files from edge locations closer to your users.

This guide covers two common approaches:
1. **Azure CDN** (Native integration with your storage)
2. **Cloudflare** (Popular, easy to use, and often free)

## Option 1: Azure CDN (Recommended for Azure Blob Storage)

This is the most seamless integration since your data is already in Azure.

### Steps:

1.  **Create a CDN Profile**
    *   Go to the Azure Portal.
    *   Search for "Front Door and CDN profiles".
    *   Click **Create**.
    *   Choose **Azure CDN Standard from Microsoft** (good balance of features and cost).

2.  **Create an Endpoint**
    *   In your new CDN profile, click **+ Endpoint**.
    *   **Name**: Choose a name (e.g., `tresta-cdn`).
    *   **Origin Type**: Select `Storage`.
    *   **Origin Hostname**: Select your Azure Blob Storage account (`tresta.blob.core.windows.net`).
    *   **Origin Path**: Leave empty (unless you want to restrict to a specific container).
    *   **Origin Host Header**: Leave as default.

3.  **Configure Custom Domain (tresta.app)**
    *   Go to your CDN Endpoint settings -> **Custom domains**.
    *   Click **+ Custom domain**.
    *   **Custom hostname**: Enter `cdn.tresta.app` (or your desired subdomain).
    *   **Validation**: You will need to add a CNAME record in your DNS provider (e.g., GoDaddy, Namecheap, Cloudflare) pointing `cdn.tresta.app` to your CDN endpoint hostname (e.g., `tresta-cdn.azureedge.net`).

4.  **Enable HTTPS**
    *   In the Custom domain settings, enable **Custom Domain HTTPS**.
    *   Azure can manage the certificate for you (simplest) or you can bring your own.

5.  **Update Environment Variables**
    *   Update your `apps/web/.env` and `apps/api/.env`:
        ```env
        NEXT_PUBLIC_CDN_URL=https://cdn.tresta.app
        ```
    *   Update `next.config.mjs` in `apps/web` to allow the new image domain:
        ```js
        images: {
          remotePatterns: [
            {
              hostname: "cdn.tresta.app",
              protocol: "https",
              pathname: "/**",
            },
            // ... keep existing azure blob pattern if needed for direct access
          ],
        }
        ```

## Option 2: Cloudflare (Flexible & Free Tier)

If you manage your DNS with Cloudflare, this is very easy.

### Steps:

1.  **DNS Setup**
    *   In Cloudflare DNS settings for `tresta.app`.
    *   Add a **CNAME** record.
    *   **Name**: `cdn`
    *   **Target**: Your Azure Blob Storage URL (e.g., `tresta.blob.core.windows.net`).
    *   **Proxy status**: **Proxied** (Orange Cloud).

2.  **Azure Storage Configuration**
    *   You need to allow Cloudflare to access your storage.
    *   In Azure Portal -> Storage Account -> **Networking**.
    *   Enable "Enabled from all networks" OR restrict to Cloudflare IP ranges (more complex).
    *   **Custom Domain**: In Azure Storage -> **Networking** -> **Custom domain**, enter `cdn.tresta.app`.
    *   *Note: Azure requires a verification CNAME (`asverify.cdn.tresta.app`) pointing to `asverify.tresta.blob.core.windows.net` to prove ownership.*

3.  **Page Rules (Optional but Recommended)**
    *   In Cloudflare -> **Rules** -> **Page Rules**.
    *   Create a rule for `cdn.tresta.app/*`.
    *   **Cache Level**: Cache Everything.
    *   **Edge Cache TTL**: 7 days (or whatever you prefer).

## Summary

| Feature | Azure CDN | Cloudflare |
| :--- | :--- | :--- |
| **Setup** | Integrated with Azure Portal | Requires DNS management |
| **Cost** | Pay-as-you-go | Generous Free Tier |
| **Performance** | Excellent for Azure origins | Excellent global network |
| **SSL** | Managed by Azure | Managed by Cloudflare |

**Recommendation**: If you are already deep into the Azure ecosystem, **Azure CDN** is the "cleanest" path. If you want to minimize costs and already use Cloudflare for DNS, **Cloudflare** is a great choice.
