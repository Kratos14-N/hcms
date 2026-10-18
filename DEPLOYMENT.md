# HCMS Production Cloud Deployment Guide

This guide details how to deploy the **Hostel Complaint Management System (HCMS)** to the cloud and connect it to a custom **`runs-on.dev`** domain.

---

## 1. Prerequisites & Required Environment Variables

Before deploying, ensure your cloud provider has the following environment variables configured:

| Environment Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL pooled connection URL | `postgresql://user:password@host:5432/hcms?pgbouncer=true` |
| `DIRECT_URL` | PostgreSQL direct migration URL | `postgresql://user:password@host:5432/hcms` |
| `NODE_ENV` | Runtime environment | `production` |

> [!TIP]
> If using Supabase, Neon, or Railway PostgreSQL, copy the `Connection String (Pooled)` into `DATABASE_URL` and `Connection String (Direct)` into `DIRECT_URL`.

---

## 2. Option A: Deploy to Vercel (Recommended for Next.js 16)

Vercel provides native edge caching, Turbopack support, and instant zero-config deployments.

### Quick CLI Deployment:
```bash
npx vercel
```

### Git-Connected Deployment (Automatic CI/CD):
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: production cloud deployment configuration"
   git remote add origin https://github.com/<your-username>/hcms.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your `hcms` repository.
4. Under **Environment Variables**, add `DATABASE_URL` and `DIRECT_URL`.
5. Click **Deploy**. Vercel will build and assign you a live production URL (e.g., `https://hcms-hostel.vercel.app`).

---

## 3. Option B: Deploy to Render (`render.yaml`)

This project includes a pre-configured [`render.yaml`](file:///c:/Users/Birendra/Downloads/hcms%20copy/hcms%20copy/render.yaml) blueprint:

1. Push the code to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) &rarr; **Blueprints** &rarr; **New Blueprint Instance**.
3. Select your repository.
4. Render will automatically detect [`render.yaml`](file:///c:/Users/Birendra/Downloads/hcms%20copy/hcms%20copy/render.yaml), run `npm install`, generate the Prisma client, and start the app on port 3000.
5. In the Render service dashboard, add your `DATABASE_URL` and `DIRECT_URL` in **Environment**.

---

## 4. Option C: Deploy to Railway / Docker

The repository includes a multi-stage production [`Dockerfile`](file:///c:/Users/Birendra/Downloads/hcms%20copy/hcms%20copy/Dockerfile):

1. Go to [railway.app/new](https://railway.app/new).
2. Click **Deploy from GitHub repo** and select `hcms`.
3. Add a PostgreSQL database service directly in Railway with 1 click.
4. Set the environment variables and deploy.

---

## 5. Connecting Your App to `runs-on.dev` Subdomain

The **`runs-on.dev`** open-source domain registry allows you to assign a clean free subdomain (e.g. `https://hcms.runs-on.dev`) to your live deployment.

### Steps to Link `runs-on.dev`:
1. **Get your deployment's live CNAME**:
   - For Vercel: `cname.vercel-dns.com`
   - For Render: `<your-app-name>.onrender.com`
   - For Railway: `<your-app-name>.up.railway.app`
2. **Submit your subdomain request**:
   - Visit [runs-on.dev](https://runs-on.dev) or the [github.com/runs-on/runs-on.dev](https://github.com/runs-on/runs-on.dev) repository.
   - Add a JSON record for your subdomain under `domains/` (e.g. `domains/hcms.json`):
     ```json
     {
       "description": "Hostel Complaint Management System",
       "repo": "https://github.com/<your-username>/hcms",
       "owner": {
         "username": "<your-github-username>",
         "email": "<your-email>"
       },
       "record": {
         "CNAME": "cname.vercel-dns.com"
       }
     }
     ```
   - Submit the Pull Request to claim `hcms.runs-on.dev`.
3. **Add the Custom Domain in Vercel / Render**:
   - In your Vercel Project &rarr; **Settings** &rarr; **Domains** &rarr; Add `hcms.runs-on.dev`.
   - Once DNS propagates (usually 1–5 minutes), your project is live with full SSL at `https://hcms.runs-on.dev`!
