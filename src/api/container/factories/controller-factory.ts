import { CreateUserController } from "../../application/use-cases/create-user/create-user-controller";
import { UseCaseFactory } from "./use-case-factory";

export class ControllerFactory {
  static createUserController(): CreateUserController {
    return new CreateUserController(UseCaseFactory.createUserUseCase());
  }
}
