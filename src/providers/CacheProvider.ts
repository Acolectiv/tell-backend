import { Store } from "memkvstore";

export default class CacheProvider<K, V> {
    private static instance: any;
    private globalTtl: number = undefined;
    private store: Store<K, V> = null;

    constructor(ttl?: number) {
        this.globalTtl = ttl;

        this.store = new Store<K, V>();
    }

    public static getInstance(ttl: number): CacheProvider<any, any> {
        if(!CacheProvider.instance) {
            CacheProvider.instance = new CacheProvider(ttl);
        }

        return CacheProvider.instance;
    }

    public setGlobalTtl(ttl: number): number {
        this.globalTtl = ttl;
        return this.globalTtl;
    }

    public async set(key: K, value: V, ttl?: number): Promise<boolean> {
        await this.store.set(key, value, ttl ? ttl : undefined);
        return true;
    }

    public async get(key: K): Promise<{ value: V, version: number } | undefined> {
        let res = await this.store.get(key);
        return res;
    }

    public async has(key: K): Promise<boolean> {
        let res = await this.store.has(key);
        return res;
    }

    public async delete(key: K): Promise<{ status: boolean, keyDeleted: K }> {
        let res = await this.store.delete(key);
        return res;
    }
}