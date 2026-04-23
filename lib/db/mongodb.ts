import { MongoClient, Db } from 'mongodb';
import { ensureIndexes } from './indexes';

const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000
};

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let _clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
    if (_clientPromise) return _clientPromise;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Please add your MONGODB_URI to .env.local');
    }

    if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
            const client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect().then(async (client) => {
                await ensureIndexes();
                return client;
            });
        }
        _clientPromise = global._mongoClientPromise;
    } else {
        const client = new MongoClient(uri, options);
        _clientPromise = client.connect().then(async (client) => {
            await ensureIndexes();
            return client;
        });
    }

    return _clientPromise;
}

export async function getDatabase(): Promise<Db> {
    const client = await getClientPromise();
    return client.db('medicare_ai');
}

export default getClientPromise;
