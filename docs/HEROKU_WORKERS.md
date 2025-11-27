# Deploying Tresta Workers to Heroku

Since you have Heroku student credits, hosting the background workers there is a great cost-saving strategy. This guide explains how to deploy the repository to Heroku and configure it to run *only* the worker process.

## Prerequisites

1.  **Heroku Account**: You already have this.
2.  **Heroku CLI**: [Install the Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) (optional but recommended).
3.  **GitHub Repo**: Your project should be on GitHub.

## Step 1: Create the Heroku App

1.  Log in to the [Heroku Dashboard](https://dashboard.heroku.com).
2.  Click **New** -> **Create new app**.
3.  Name it something like `tresta-workers` and choose your region.
4.  Click **Create app**.

## Step 2: Connect to GitHub

1.  In the **Deploy** tab of your new app.
2.  Under **Deployment method**, select **GitHub**.
3.  Search for your repository (`tresta`) and click **Connect**.
4.  Enable **Automatic Deploys** from the `main` branch (optional, but convenient).

## Step 3: Configure Buildpack (Important for Monorepos)

Since this is a monorepo using `pnpm`, we need to tell Heroku how to handle it.

1.  Go to the **Settings** tab.
2.  Scroll to **Buildpacks**.
3.  Click **Add buildpack**.
4.  Enter `https://github.com/pnpm/action-setup` (Actually, Heroku has native support for Corepack now, but a specific buildpack is often safer for pnpm monorepos).
    *   *Better Option*: Use the standard **Node.js** buildpack.
    *   Ensure `heroku/nodejs` is in the list.

5.  **Set Environment Variable for NPM**:
    *   Go to **Config Vars** (in Settings).
    *   Add `NPM_CONFIG_PRODUCTION` = `false` (This ensures devDependencies like TypeScript are installed so we can build).

## Step 4: Create a Procfile

Heroku uses a `Procfile` to know what command to run. Since we only want the workers:

1.  Create a file named `Procfile` (no extension) in the **root** of your repository.
2.  Add the following line:
    ```text
    worker: node apps/api/dist/workers/index.js
    ```
3.  Commit and push this file to GitHub.

## Step 5: Configure Environment Variables

You need to copy the environment variables from `apps/api/.env` to Heroku Config Vars.

1.  Go to **Settings** -> **Config Vars**.
2.  Add the following (copy values from your local `.env` or Azure settings):
    *   `DATABASE_URL`
    *   `REDIS_URL` (Essential for workers!)
    *   `RESEND_API_KEY`
    *   `EMAIL_FROM`
    *   `APP_URL`
    *   `AZURE_STORAGE_ACCOUNT_NAME` (if workers handle files)
    *   `AZURE_STORAGE_ACCOUNT_KEY` (if workers handle files)

## Step 6: Deploy

1.  Go back to the **Deploy** tab.
2.  Click **Deploy Branch** (manual deploy) to test it out.
3.  Heroku will:
    *   Install dependencies (using `pnpm install` if configured, or `npm install`).
    *   Run the `build` script from your root `package.json`.
        *   *Note*: Ensure your root `package.json` has a build script that builds the API.
        *   Current root build script: `turbo build`. This is perfect.

## Step 7: Scale the Worker

By default, Heroku might try to run a `web` process. We want a `worker` process.

1.  Go to the **Resources** tab.
2.  Click the **pencil icon** next to `web` and switch it off (move slider to 0).
3.  Click the **pencil icon** next to `worker` and switch it on (move slider to 1).
4.  Click **Confirm**.

## Troubleshooting

*   **Build Fails?**
    *   If Heroku complains about `pnpm` not being found, enable Corepack by adding a `package.json` `engines` field or using the `heroku/nodejs` buildpack with `corepack enable` in a `postinstall` script.
    *   *Simpler*: Just add `pnpm` to your `package.json` `scripts`:
        ```json
        "heroku-postbuild": "npm install -g pnpm && pnpm install && pnpm build"
        ```

*   **"Module not found"?**
    *   Ensure `apps/api/dist` exists. The `turbo build` command should create it.
