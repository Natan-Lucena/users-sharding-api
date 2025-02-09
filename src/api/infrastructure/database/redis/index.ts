import Redis from "ioredis";

export class RedisClient {
  constructor(private redis: Redis) {}

  async saveCache(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async getCache(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async setIndex(name: string, uuid: string, shard: number) {
    await this.redis.set(
      `user:${name.toLowerCase()}`,
      JSON.stringify({ uuid, shard })
    );
  }

  async getIndex(name: string) {
    const data = await this.redis.get(`user:${name.toLowerCase()}`);
    return data ? JSON.parse(data) : null;
  }
}
