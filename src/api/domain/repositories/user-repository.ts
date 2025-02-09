import { Uuid } from "../../shared/core/uuid";
import { User } from "../entities/user";

interface ISearchUser {
  email?: string;
  taxId?: string;
  name?: string;
}

export interface IUserRepository {
  save(user: User): Promise<void>;
  search(search: ISearchUser): Promise<User | null>;
  getById(id: Uuid): Promise<User | null>;
}
