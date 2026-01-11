/**
 * MongoDB Service - Direct MongoDB Atlas Data API
 * Uses MongoDB Atlas Data API (REST) - no backend needed
 */

import {
  MONGODB_DATABASE,
  MONGODB_DATA_API_KEY,
  MONGODB_DATA_API_URL,
  MONGODB_CLUSTER_NAME,
} from '../config/env';

/**
 * Insert document into MongoDB collection using Atlas Data API
 */
export const insertDocument = async <T = any>(
  collection: string,
  document: T
): Promise<void> => {
  try {
    // If Data API is not configured, fail silently
    if (!MONGODB_DATA_API_KEY || !MONGODB_DATA_API_URL) {
      console.warn('⚠️ MongoDB Data API not configured. Skipping database insert.');
      return;
    }

    const response = await fetch(`${MONGODB_DATA_API_URL}/action/insertOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_DATA_API_KEY,
      },
      body: JSON.stringify({
        dataSource: MONGODB_CLUSTER_NAME,
        database: MONGODB_DATABASE,
        collection,
        document: {
          ...document,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}, ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (result.insertedId) {
      console.log(`✅ Document inserted into ${collection}`);
    } else {
      console.warn(`⚠️ Insert may have failed for ${collection}`);
    }
  } catch (error) {
    console.error(`❌ Error inserting into ${collection}:`, error);
    // Fail silently to not break app
  }
};

/**
 * Initialize MongoDB connection (no-op for Data API approach)
 */
export const connectToMongoDB = async (): Promise<void> => {
  if (MONGODB_DATA_API_KEY && MONGODB_DATA_API_URL) {
    console.log('✅ MongoDB service initialized (Data API mode)');
  } else {
    console.warn('⚠️ MongoDB Data API not configured. Database operations will be skipped.');
  }
};

/**
 * Close MongoDB connection (no-op for Data API approach)
 */
export const closeMongoDBConnection = async (): Promise<void> => {
  // No connection to close
};
