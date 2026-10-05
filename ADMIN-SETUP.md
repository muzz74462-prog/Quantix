# Quantix admin panel: setup (do in this order)

1. Supabase -> SQL Editor: paste the whole file supabase/migrations/001_admin_ledger.sql and press Run.
   (This file is NOT part of the website code. It only runs in Supabase.)
2. Netlify -> Site settings -> Environment variables: add USER_SESSION_SECRET with the SAME value that is
   now at the bottom of apps/web/.env.local. You can delete ADMIN_PASSWORD (no longer used).
3. In a terminal inside apps/web run:   node scripts/create-admin.mjs
   (enter your email, role super_admin, and a 12+ character password)
4. npm install   (from this folder, only needed if node_modules is missing)
5. npm run dev  -> open http://localhost:3000/admin/login   (then deploy to Netlify)
