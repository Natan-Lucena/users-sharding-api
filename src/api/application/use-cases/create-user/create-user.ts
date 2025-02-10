import { hash } from "bcrypt";
import { IUserRepository } from "../../../domain/repositories/user-repository";
import { UserDto } from "../../dtos/user-dto";
import { failure, Result, success } from "../../../shared/core/result";
import { User } from "../../../domain/entities/user";

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
  ): Promise<Result<UserDto, "USER_ALREADY_EXISTS">> {
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
    return success({
      id: result.id.value,
      name: result.name,
      email: result.email,
      taxId: result.taxId,
      createdAt: result.createdAt,
    });
  }
}
