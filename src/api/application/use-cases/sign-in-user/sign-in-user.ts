import { IUserRepository } from "../../../domain/repositories/user-repository";
import { failure, Result, success } from "../../../shared/core/result";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  token: string;
}

export class SignInUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private jwtSecret: string
  ) {}

  async execute(
    data: IRequest
  ): Promise<Result<IResponse, "USER_NOT_FOUND" | "INVALID_PASSWORD">> {
    const user = await this.userRepository.search({ email: data.email });

    if (!user) {
      return failure("USER_NOT_FOUND");
    }
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return failure("INVALID_PASSWORD");
    }
    const token = jwt.sign({ id: user.id.value }, this.jwtSecret, {
      expiresIn: "1h",
    });

    return success({ token });
  }
}
