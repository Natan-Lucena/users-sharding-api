import { User } from "../../domain/entities/user";
import { IUserRepository } from "../../domain/repositories/user-repository";
import { failure, Result, success } from "../../shared/core/result";
import { hash } from "bcrypt";

interface ICreateUser {
  email: string;
  name: string;
  password: string;
  taxId: string;
}

export class CreateUserUseCase {
  constructor(private repository: IUserRepository) {}

  async execute(
    data: ICreateUser
  ): Promise<Result<User, "USER_ALREADY_EXISTS">> {
    const userAlreadyExists = await this.repository.search({
      email: data.email,
      taxId: data.taxId,
    });

    if (userAlreadyExists) {
      return failure("USER_ALREADY_EXISTS");
    }

    const hashedPassword = await hash(data.password, 10);
    const user = User.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      taxId: data.taxId,
    });
    const result = await this.repository.create(user);
    return success(result);
  }
}
