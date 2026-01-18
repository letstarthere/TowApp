# Deploy TowApp Backend to Render (Free)

## Step 1: Prepare for Deployment

1. Make sure your code is on GitHub
2. Create a `.gitignore` if you don't have one:
   ```
   node_modules/
   .env
   local.db
   dist/
   uploads/
   ```

## Step 2: Deploy to Render

1. Go to https://render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your TowTech repository
5. Configure:
   - Name: `towapp-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: `Free`

6. Add Environment Variables:
   - Click "Environment" tab
   - Add: `NODE_ENV=production`
   - Add: `SESSION_SECRET=your-secret-key-here`

7. Click "Create Web Service"

## Step 3: Get Your URL

After deployment (5-10 minutes), you'll get a URL like:
`https://towapp-backend.onrender.com`

## Step 4: Update Your App

Update the API base URL in your app to use the Render URL instead of localhost.

## Note:
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to paid ($7/month) for always-on service
