import { User } from '../models';

const BLOOM_SIZE = 10000;
const HASH_COUNT = 3;

class UsernameBloomFilter {
    private bits: Uint8Array;
    private initialized: boolean = false;

    constructor() {
        this.bits = new Uint8Array(Math.ceil(BLOOM_SIZE / 8));
    }

    private hash1(str: string): number {
        let hash = 0;
        const normalized = str.toLowerCase();
        for (let i = 0; i < normalized.length; i++) {
            hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
        }
        return Math.abs(hash) % BLOOM_SIZE;
    }

    private hash2(str: string): number {
        let hash = 5381;
        const normalized = str.toLowerCase();
        for (let i = 0; i < normalized.length; i++) {
            hash = ((hash << 5) + hash + normalized.charCodeAt(i)) | 0;
        }
        return Math.abs(hash) % BLOOM_SIZE;
    }

    private hash3(str: string): number {
        let hash = 0;
        const normalized = str.toLowerCase();
        for (let i = 0; i < normalized.length; i++) {
            hash = normalized.charCodeAt(i) + ((hash << 6) + (hash << 16) - hash);
        }
        return Math.abs(hash) % BLOOM_SIZE;
    }

    private getHashes(item: string): number[] {
        return [this.hash1(item), this.hash2(item), this.hash3(item)];
    }

    private setBit(index: number): void {
        const byteIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        this.bits[byteIndex] |= (1 << bitIndex);
    }

    private getBit(index: number): boolean {
        const byteIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        return (this.bits[byteIndex] & (1 << bitIndex)) !== 0;
    }

    add(username: string): void {
        const hashes = this.getHashes(username);
        for (const h of hashes) {
            this.setBit(h);
        }
    }

    mightExist(username: string): boolean {
        const hashes = this.getHashes(username);
        return hashes.every((h) => this.getBit(h));
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            const users = await User.find({ isDeleted: false }).select('username').lean();
            for (const user of users) {
                this.add(user.username);
            }
            this.initialized = true;
            console.log(`Username Bloom filter initialized with ${users.length} usernames`);
        } catch (error) {
            console.error('Failed to initialize username Bloom filter:', error);
        }
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}

export const usernameBloomFilter = new UsernameBloomFilter();
