const BLOOM_SIZE = 1024;
const HASH_COUNT = 3;

function hash1(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % BLOOM_SIZE;
}

function hash2(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % BLOOM_SIZE;
}

function hash3(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 6) + (hash << 16) - hash);
    }
    return Math.abs(hash) % BLOOM_SIZE;
}

function getHashes(item: string): number[] {
    return [hash1(item), hash2(item), hash3(item)];
}

export class BloomFilter {
    private bits: Uint8Array;
    private storageKey: string;

    constructor(storageKey: string = "bloom-seen-posts") {
        this.storageKey = storageKey;
        this.bits = new Uint8Array(Math.ceil(BLOOM_SIZE / 8));
        this.load();
    }

    private load(): void {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const arr = JSON.parse(stored);
                this.bits = new Uint8Array(arr);
            } catch {
                this.bits = new Uint8Array(Math.ceil(BLOOM_SIZE / 8));
            }
        }
    }

    private save(): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.bits)));
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

    add(item: string): void {
        const hashes = getHashes(item);
        for (const h of hashes) {
            this.setBit(h);
        }
        this.save();
    }

    mightContain(item: string): boolean {
        const hashes = getHashes(item);
        return hashes.every((h) => this.getBit(h));
    }

    clear(): void {
        this.bits = new Uint8Array(Math.ceil(BLOOM_SIZE / 8));
        this.save();
    }
}

let instance: BloomFilter | null = null;

export function getSeenPostsFilter(): BloomFilter {
    if (!instance) {
        instance = new BloomFilter("bloom-seen-posts");
    }
    return instance;
}
