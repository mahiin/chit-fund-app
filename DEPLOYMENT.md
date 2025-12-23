# Deployment Guide

This guide covers deploying your Chit Fund Management App to production.

## 🚀 Recommended: Vercel (Easiest for Next.js)

Vercel is the best choice for Next.js apps - it's made by the creators of Next.js and offers seamless deployment.

### Prerequisites

1. **MongoDB Atlas Account** (Free tier available)
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster (M0 - Free tier)
   - Get your connection string

2. **GitHub Account** (for version control)

### Step 1: Set Up MongoDB Atlas

1. **Create a Cluster**
   - Go to MongoDB Atlas dashboard
   - Click "Create" → Choose "M0 Free" tier
   - Select a cloud provider and region (closest to your users)
   - Click "Create Cluster"

2. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for Vercel
   - Or add Vercel's IP ranges if you want to restrict

4. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `chitfund`)

   Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chitfund?retryWrites=true&w=majority`

### Step 2: Prepare Your Code

1. **Create `.env.local` file** (for local testing)
   ```bash
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```

2. **Test locally**
   ```bash
   npm install
   npm run build
   npm start
   ```

3. **Commit to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

### Step 3: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git remote add origin https://github.com/yourusername/chit-fund-app.git
     git branch -M main
     git push -u origin main
     ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `./` (default)
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default)
   - **Environment Variables**:
     - Add `MONGODB_URI` with your MongoDB Atlas connection string
   - Click "Deploy"

3. **Wait for Deployment**
   - Vercel will build and deploy automatically
   - You'll get a URL like `your-app.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variable when asked: `MONGODB_URI`

4. **Set Production Environment Variable**
   ```bash
   vercel env add MONGODB_URI
   ```
   - Select "Production"
   - Paste your MongoDB connection string

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Step 4: Configure Custom Domain (Optional)

1. Go to your project on Vercel dashboard
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

---

## 🌐 Alternative: Netlify

Netlify is another great option for Next.js apps.

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
   - **Environment Variables**:
     - Add `MONGODB_URI`

3. **Configure Next.js for Netlify**
   - Create `netlify.toml` in root:
     ```toml
     [build]
       command = "npm run build"
       publish = ".next"
     
     [[plugins]]
       package = "@netlify/plugin-nextjs"
     ```

---

## 🚂 Alternative: Railway

Railway is excellent for full-stack apps with databases.

### Steps:

1. **Push to GitHub**

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variable: `MONGODB_URI`
   - Railway will auto-detect Next.js and deploy

---

## ☁️ Alternative: Render

Render offers free tier hosting.

### Steps:

1. **Push to GitHub**

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New" → "Web Service"
   - Connect your repository
   - Settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Add environment variable: `MONGODB_URI`
   - Click "Create Web Service"

---

## 🔧 Post-Deployment Checklist

- [ ] Test all features on production URL
- [ ] Verify MongoDB connection is working
- [ ] Test file uploads (CSV)
- [ ] Test lottery draw functionality
- [ ] Check mobile responsiveness
- [ ] Set up custom domain (if needed)
- [ ] Configure SSL/HTTPS (usually automatic)
- [ ] Set up monitoring/analytics (optional)

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Always use environment variables for secrets
   - Rotate MongoDB passwords regularly

2. **MongoDB Security**
   - Use strong passwords
   - Restrict IP access if possible
   - Enable MongoDB Atlas monitoring

3. **API Routes**
   - Consider adding rate limiting
   - Add input validation
   - Consider authentication for admin routes

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Free)
- Built into Vercel dashboard
- Shows page views, performance metrics

### MongoDB Atlas Monitoring
- Free tier includes basic monitoring
- Track database performance
- Set up alerts

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in deployment platform
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Environment Variables Not Working
- Double-check variable names (case-sensitive)
- Redeploy after adding environment variables
- Check deployment platform's environment variable settings

---

## 💰 Cost Estimates

### Free Tier Options:
- **Vercel**: Free (100GB bandwidth/month)
- **MongoDB Atlas**: Free (512MB storage)
- **Netlify**: Free (100GB bandwidth/month)
- **Railway**: $5/month (after free trial)
- **Render**: Free (with limitations)

### Paid Options (if you need more):
- **Vercel Pro**: $20/month (unlimited bandwidth)
- **MongoDB Atlas M10**: $9/month (10GB storage)
- **Custom Domain**: $10-15/year

---

## 🎯 Recommended Setup for Production

1. **Hosting**: Vercel (free tier is sufficient)
2. **Database**: MongoDB Atlas M0 (free) or M10 ($9/month)
3. **Domain**: Namecheap/GoDaddy ($10-15/year)
4. **Monitoring**: Vercel Analytics (free) + MongoDB Atlas monitoring (free)

**Total Cost**: $0-25/month depending on usage

---

## 📝 Quick Deploy Commands

```bash
# 1. Test build locally
npm run build

# 2. Initialize git (if not done)
git init
git add .
git commit -m "Ready for deployment"

# 3. Push to GitHub
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main

# 4. Deploy to Vercel (via CLI)
npm i -g vercel
vercel login
vercel --prod
```

---

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

