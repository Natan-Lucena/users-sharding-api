import Redis from "ioredis";
import { UserRepositoryImpl } from "../../infrastructure/repositories/user-repository-impl";
import { PrismaShards } from "../../infrastructure/database/prisma";
import { RedisClient } from "../../infrastructure/database/redis";
import { PrismaClient } from "@prisma/client";
import { CreateUserUseCase } from "../../application/use-cases/create-user/create-user";
import { UpdateUserProfilePictureUseCase } from "../../application/use-cases/update-user-profile-picture/update-user-profile-picture";

const redis = new Redis(process.env.REDIS_URL as string);
const redisClient = new RedisClient(redis);
const prismaShards = new PrismaShards(
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_SHARD1 } },
  }),
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_SHARD2 } },
  }),
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_SHARD3 } },
  }),
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_SHARD4 } },
  })
);

const userRepository = new UserRepositoryImpl(redisClient, prismaShards);

export class UseCaseFactory {
  static createUserUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(userRepository);
  }
  static updateUserProfilePictureUseCase(): UpdateUserProfilePictureUseCase {
    return new UpdateUserProfilePictureUseCase(userRepository);
  }

  static getUserRepository() {
    return userRepository;
  }
}
