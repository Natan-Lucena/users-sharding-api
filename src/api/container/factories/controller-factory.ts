import { CreateUserController } from "../../application/use-cases/create-user/create-user-controller";
import { SignInUserController } from "../../application/use-cases/sign-in-user/sign-in-user-controller";
import { UseCaseFactory } from "./use-case-factory";

export class ControllerFactory {
  static createUserController(): CreateUserController {
    return new CreateUserController(UseCaseFactory.createUserUseCase());
  }
  static signInUserController() {
    return new SignInUserController(UseCaseFactory.signInUserUseCase());
  }
}
