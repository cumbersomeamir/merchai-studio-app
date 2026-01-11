# MongoDB Atlas Data API Setup

Follow these steps to enable MongoDB Atlas Data API for direct access from your React Native app:

## Step 1: Enable App Services in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your project
3. Click **"App Services"** in the left sidebar
4. If you don't have an App Services app yet, click **"Create a New App"**
5. Choose **"Build your own App"**
6. Name it (e.g., "MerchAI Studio")
7. Select your cluster (the one with `merchai-studio.illhymj.mongodb.net`)
8. Click **"Create App"**

## Step 2: Configure Data API

1. In your App Services app, go to **"Data API"** in the left sidebar
2. Click **"Enable Data API"** if not already enabled
3. Note the **Data API URL** - it will look like:
   ```
   https://data.mongodb-api.com/app/xxxxx-xxxxx/endpoint/data/v1
   ```

## Step 3: Create API Key

1. In App Services, go to **"Authentication"** → **"API Keys"**
2. Click **"Create API Key"**
3. Name it (e.g., "MerchAI Mobile App")
4. Copy the **API Key** (you'll only see it once!)
5. Set permissions:
   - **Read and Write** to your database
   - Or create a custom role with insert permissions

## Step 4: Update Your App Config

1. Open `src/config/env.ts`
2. Add your Data API credentials:
   ```typescript
   export const MONGODB_DATA_API_KEY = 'your-api-key-here';
   export const MONGODB_DATA_API_URL = 'https://data.mongodb-api.com/app/xxxxx-xxxxx/endpoint/data/v1';
   export const MONGODB_CLUSTER_NAME = 'Cluster0'; // Or your cluster name
   ```

## Step 5: Configure Database Access

1. In App Services, go to **"Data Access"** → **"Rules"**
2. Create a rule for your database:
   - **Database**: `merchai-studio`
   - **Collection**: `*` (all collections)
   - **Read**: Allow
   - **Write**: Allow
   - Or use a template like "Users can read and write all data"

## Step 6: Test

After updating the config, restart your app. The MongoDB operations should now work directly from the mobile app without any backend!

## Troubleshooting

- **403 Forbidden**: Check API key permissions and Data Access rules
- **404 Not Found**: Verify the Data API URL is correct
- **401 Unauthorized**: Check that the API key is correct

## Collections Created Automatically

The following collections will be created automatically when data is inserted:
- `logins`
- `onboarding`
- `mockup_generations`
- `mockup_edits`
- `mockup_exports`

