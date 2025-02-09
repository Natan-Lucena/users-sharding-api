import { Uuid } from "../../shared/core/uuid";
import { User } from "../entities/user";

export interface ISearchUser {
  email?: string;
  taxId?: string;
  name?: string;
}

export interface IUserRepository {
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  search(search: ISearchUser): Promise<User | null>;
  getById(id: Uuid): Promise<User | null>;
}
