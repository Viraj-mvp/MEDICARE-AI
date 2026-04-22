import { getDatabase } from './mongodb';

export async function ensureIndexes() {
    try {
        const db = await getDatabase();
        
        // Hospitals indexes
        const hospitalsCollection = db.collection('hospitals');
        await hospitalsCollection.createIndex({ location: "2dsphere" });
        await hospitalsCollection.createIndex({ specialties: 1 });
        await hospitalsCollection.createIndex({ name: "text", city: "text", nameSearch: "text", citySearch: "text" });
        await hospitalsCollection.createIndex({ city: 1 });
        await hospitalsCollection.createIndex({ type: 1 });
        
        // Predictions indexes
        const predictionsCollection = db.collection('predictions');
        await predictionsCollection.createIndex({ userId: 1, createdAt: -1 });

        // Emergency Requests indexes
        const emergencyCollection = db.collection('emergency_requests');
        await emergencyCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
        
        // Users indexes
        const usersCollection = db.collection('users');
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        
        console.log('[MongoDB] Verified indexes successfully');
    } catch (error) {
        console.error('[MongoDB] Failed to ensure indexes:', error);
    }
}
