import { PrismaClient } from "@prisma/client/extension";

export class PrismaShards {
  constructor(
    private shard1: PrismaClient,
    private shard2: PrismaClient,
    private shard3: PrismaClient,
    private shard4: PrismaClient
  ) {}

  async getShard(shard: number): Promise<PrismaClient> {
    switch (shard) {
      case 1:
        return this.shard1;
      case 2:
        return this.shard2;
      case 3:
        return this.shard3;
      case 4:
        return this.shard4;
      default:
        throw new Error("Invalid shard");
    }
  }
}
