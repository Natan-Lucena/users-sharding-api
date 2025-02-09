import { User } from "../../domain/entities/user";
import { User as PrismaUser } from "@prisma/client";
import {
  ISearchUser,
  IUserRepository,
} from "../../domain/repositories/user-repository";
import { Uuid } from "../../shared/core/uuid";
import { PrismaShards } from "../database/prisma";
import { RedisClient } from "../database/redis";

export class UserRepositoryImpl implements IUserRepository {
  constructor(
    private redisClient: RedisClient,
    private prismaShards: PrismaShards
  ) {}
  async update(user: User): Promise<void> {
    const userShard = this.generateShard(user.id);
    const prisma = await this.prismaShards.getShard(userShard);

    const userUpdated = await prisma.user.update({
      where: { id: user.id.toString() },
      data: {
        email: user.email,
        name: user.name,
        taxId: user.taxId,
      },
    });
    await this.redisClient.saveCache(user.taxId, userUpdated);
    await this.redisClient.saveCache(user.email, userUpdated);
    await this.redisClient.saveCache(user.id.toString(), userUpdated);
  }

  async create(user: User): Promise<User> {
    const userShard = this.generateShard(user.id);

    const prisma = await this.prismaShards.getShard(userShard);

    const result = await prisma.user.create({
      data: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        taxId: user.taxId,
      },
    });
    await this.redisClient.saveCache(result.taxId, result);
    await this.redisClient.saveCache(result.email, result);
    await this.redisClient.saveCache(result.id.toString(), result);
    await this.redisClient.setIndex(
      result.name,
      result.id.toString(),
      userShard
    );
    return this.mapToDomain(result);
  }
  async search(search: ISearchUser): Promise<User | null> {
    if (search.email) {
      const user = await this.redisClient.getCache(search.email);
      if (user) {
        return this.mapToDomain(JSON.parse(user));
      }
    }
    if (search.taxId) {
      const user = await this.redisClient.getCache(search.taxId);
      if (user) {
        return this.mapToDomain(JSON.parse(user));
      }
    }
    if (search.name) {
      const index = await this.redisClient.getIndex(search.name);
      if (index) {
        const { uuid, shard } = index;
        const prisma = await this.prismaShards.getShard(shard);
        const user = await prisma.user.findUnique({
          where: {
            id: uuid,
          },
        });
        if (user) {
          return this.mapToDomain(user);
        }
      }
    }
    return null;
  }
  async getById(id: Uuid): Promise<User | null> {
    const isUserInCache = await this.redisClient.getCache(id.toString());
    if (isUserInCache) {
      const user = JSON.parse(isUserInCache);
      return this.mapToDomain(user);
    }

    for (let i = 1; i <= 4; i++) {
      const prisma = await this.prismaShards.getShard(i);
      const user = await prisma.user.findUnique({
        where: {
          id: id.toString(),
        },
      });
      if (user) {
        await this.redisClient.saveCache(id.toString(), user);
        await this.redisClient.setIndex(user.name, id.toString(), i);
        return this.mapToDomain(user);
      }
    }
    return null;
  }

  private mapToDomain(user: PrismaUser) {
    return User.create({
      id: new Uuid(user.id),
      email: user.email,
      name: user.name,
      password: user.password,
      taxId: user.taxId,
      createdAt: user.createdAt,
      profilePictureUrl: user.profilePictureUrl ?? undefined,
    });
  }

  private generateShard(userId: Uuid): number {
    const hash = parseInt(userId.toString().slice(0, 8), 16);
    return (hash % 4) + 1;
  }
}
