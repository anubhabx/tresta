# Hosting Guide for Tresta

Since your frontend is hosted on Vercel, here is how to host the remaining parts of your application: the **API**, the **Background Workers**, and the **Embeddable Widget**.

## 1. API & Workers (Backend)

The API (`apps/api`) is a Node.js application, and the Workers are background processes that process job queues (email sending, etc.).

### Recommended: Azure App Service (Best for Integration)
Since you are already using Azure Blob Storage, keeping your compute in Azure is a good choice for performance and security.

#### Option A: Single App Service Plan (Cost Effective)
You can run both the API and Workers on the same App Service Plan to share resources.
1.  **Create an App Service (Web App)** for the API.
    *   **Runtime Stack**: Node 20 LTS.
    *   **Command**: `node dist/index.js`
    *   **Env Vars**: Copy from `.env.example` (Database URL, Redis URL, etc.).
2.  **Create a second Web App** (or use WebJobs) for the Workers.
    *   **Command**: `node dist/workers/index.js`
    *   *Note: WebJobs are a native way to run background tasks on the same App Service instance as your API.*

#### Option B: Railway / Render (Easiest Setup)
If you prefer a Vercel-like experience for the backend:
1.  **Connect your Repo**.
2.  **Create a Service for API**:
    *   **Root Directory**: `apps/api`
    *   **Build Command**: `pnpm build`
    *   **Start Command**: `node dist/index.js`
3.  **Create a Service for Workers**:
    *   **Root Directory**: `apps/api`
    *   **Build Command**: `pnpm build`
    *   **Start Command**: `node dist/workers/index.js`
    *   *Tip: On Railway, you can deploy the same repo twice with different start commands.*

## 2. Embeddable Widget (@workspace/widget)

The widget is a static JavaScript bundle (`tresta-widget.js`) that runs on your customers' websites. It should be served from a high-performance CDN, not your API server.

### Hosting on Azure Blob Storage + CDN (Recommended)

1.  **Build the Widget**:
    Run the build command locally or in your CI/CD pipeline:
    ```bash
    pnpm build --filter @workspace/widget
    ```
    This creates `packages/widget/dist/tresta-widget.js`.

2.  **Upload to Storage**:
    Upload the contents of `packages/widget/dist` to a public container in your Azure Blob Storage (e.g., create a container named `widget`).

3.  **Serve via CDN**:
    Use the CDN setup from `docs/CDN_SETUP.md` to serve this file.
    *   **URL**: `https://cdn.tresta.app/widget/tresta-widget.js`

### Why this approach?
*   **Performance**: The CDN caches the script globally, making it load instantly for users anywhere.
*   **Reliability**: Your API going down won't break the widget loading on client sites (though the widget won't be able to fetch data).
*   **Cost**: Serving static files from Blob Storage is extremely cheap compared to serving them from a Node.js server.

## Summary of Architecture

| Component | Host | URL Example |
| :--- | :--- | :--- |
| **Frontend** | Vercel | `https://tresta.app` |
| **API** | Azure App Service / Railway | `https://api.tresta.app` |
| **Workers** | Azure WebJobs / Railway Worker | N/A (Background Process) |
| **Widget** | Azure Blob + CDN | `https://cdn.tresta.app/widget/tresta-widget.js` |
| **Assets** | Azure Blob + CDN | `https://cdn.tresta.app/logos/...` |
