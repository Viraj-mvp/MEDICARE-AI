import { MongoClient, Db } from 'mongodb';
import { ensureIndexes } from './indexes';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect().then(async (client) => {
            // Initialize indexes on first connection
            await ensureIndexes();
            return client;
        });
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect().then(async (client) => {
        // Initialize indexes on first connection
        await ensureIndexes();
        return client;
    });
}

export async function getDatabase(): Promise<Db> {
    const client = await clientPromise;
    return client.db('medicare_ai');
}

export default clientPromise;
