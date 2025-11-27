# Azure Deployment Guide for Tresta

This guide walks you through deploying the **API** and **Workers** to Azure App Service. Since you are new to Azure, we will use the **VS Code Azure Extension** method, which is the most visual and easiest way to get started.

## Prerequisites

1.  **Azure Account**: [Sign up for free](https://azure.microsoft.com/free/) if you haven't already.
2.  **VS Code Azure Tools Extension**: Install the "Azure Tools" extension pack in VS Code.
3.  **Sign In**: Click the Azure icon in the VS Code sidebar and sign in to your account.

---

## Part 1: Create the App Service (The Server)

1.  In the VS Code Azure sidebar, find **App Services**.
2.  Right-click your subscription and select **Create App Service (Web App)...**.
3.  Follow the prompts:
    *   **Name**: Enter a unique name (e.g., `tresta-api-prod`).
    *   **Runtime Stack**: Select **Node.js 20 LTS**.
    *   **Pricing Tier**: Select **Free (F1)** for testing, or **Basic (B1)** for production (needed for Always On/SSL).
    *   **Location**: Choose a region close to you (e.g., `East US`).
4.  Wait for the resource to be created.

---

## Part 2: Configure Environment Variables

Before deploying code, let's set up the secrets.

1.  In the Azure sidebar, expand your new App Service (`tresta-api-prod`).
2.  Right-click **Application Settings** and select **Upload Local Settings...**.
    *   *Note: This might try to upload `local.settings.json`. If you don't have that, you can add them manually.*
3.  **Manual Method (Recommended for first time)**:
    *   Right-click **Application Settings** -> **Add New Setting...**.
    *   Add every variable from your `apps/api/.env` file.
    *   **Crucial Variables**:
        *   `DATABASE_URL`
        *   `REDIS_URL`
        *   `AZURE_STORAGE_ACCOUNT_NAME`
        *   `AZURE_STORAGE_ACCOUNT_KEY`
        *   `APP_URL` (set to `https://tresta-api-prod.azurewebsites.net`)
        *   `FRONTEND_URL` (set to `https://tresta.app`)

---

## Part 3: Deploy the API

Since this is a monorepo, we need to tell Azure how to build just the API.

1.  **Create a Startup Command**:
    *   In the Azure sidebar, right-click your App Service -> **Configure Deployment Source...** (skip this if just deploying zip).
    *   Actually, for VS Code zip deploy, we just need to configure the startup command.
    *   Go to **Application Settings** -> **Add New Setting**.
    *   Key: `SCM_DO_BUILD_DURING_DEPLOYMENT`, Value: `true`.

2.  **Deploy from VS Code**:
    *   Right-click your App Service in the sidebar.
    *   Select **Deploy to Web App...**.
    *   Select the **Root Folder** of your project (`c:\dev\tresta`).
    *   VS Code will ask if you want to build. Say **Yes**.
    *   *Important*: Since it's a monorepo, Azure might get confused. A better way for monorepos is often **GitHub Actions**, but let's try the direct deploy first.
    *   **If direct deploy fails**, use the "Deployment Center" method below.

### Alternative: Deployment Center (GitHub - Recommended)

1.  Go to the [Azure Portal](https://portal.azure.com).
2.  Navigate to your App Service (`tresta-api-prod`).
3.  In the left menu, click **Deployment Center**.
4.  **Source**: Select **GitHub**.
5.  **Authorize** and select your repository (`anubhabx/tresta`).
6.  **Build Provider**: **App Service Build Service** (or GitHub Actions).
7.  **Configure**:
    *   **Project**: `apps/api` (This is key! Point it to the API folder).
8.  Click **Save**. Azure will pull your code, build the API, and deploy it.

---

## Part 4: Deploy the Workers (WebJobs)

The workers need to run alongside the API.

1.  **In your local project**:
    *   Ensure `apps/api/package.json` has a build script that compiles the worker code (it does: `tsc`).
2.  **In Azure Portal**:
    *   Go to your App Service.
    *   Search for **WebJobs** in the left menu.
    *   Click **+ Add**.
    *   **Name**: `email-worker`.
    *   **File Upload**: You need to upload the compiled worker file.
        *   *Tricky part*: WebJobs usually expect a zip or a script.
        *   **Easier Path**: Since we are using Node.js, we can just run the worker as a "second process" using a process manager like PM2, OR just deploy a **second App Service** specifically for workers using the same steps as Part 3.

### Recommendation for Beginners: Two App Services

1.  Create another App Service named `tresta-workers-prod`.
2.  Configure the same Environment Variables.
3.  Deploy the same code (using GitHub Deployment Center, pointing to `apps/api`).
4.  **Change the Startup Command**:
    *   Go to **Configuration** -> **General Settings**.
    *   **Startup Command**: `node dist/workers/index.js`
5.  Save. Now this instance will run your workers instead of the API server.

---

## Summary

1.  **Database/Redis**: Ensure these are hosted and accessible (e.g., Neon for Postgres, Upstash for Redis).
2.  **API App Service**: Connects to GitHub -> `apps/api` -> Runs `npm start` (API).
3.  **Worker App Service**: Connects to GitHub -> `apps/api` -> Runs `node dist/workers/index.js`.
4.  **Frontend**: Vercel -> Connects to GitHub -> `apps/web`.

This separates your concerns and makes debugging much easier!

---

## Troubleshooting: Can't find your App Service?

If you created the App Service in VS Code but can't see it in the Azure Portal:

1.  **Check Global Search**:
    *   In the top search bar of the Azure Portal, type the name you gave your app (e.g., `tresta-api-prod`).
    *   It should appear under "Resources".

2.  **Check Subscription Filter**:
    *   Sometimes the Portal hides resources from certain subscriptions.
    *   Click the **Settings** (gear icon) in the top right.
    *   Select **Directories + subscriptions**.
    *   Ensure your subscription is selected (or "Select all").

3.  **Check Resource Group**:
    *   When you created the app in VS Code, it likely created a "Resource Group" (often named `app-name-rg` or similar).
    *   Go to **Resource groups** in the left menu and look for a new group. Your App Service will be inside it.

4.  **Wait a moment**:
    *   Resource creation can sometimes take 1-2 minutes to show up in the Portal lists, even if VS Code says it's done. Refresh the page.
