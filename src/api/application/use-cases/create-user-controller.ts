import { Request, Response } from "express";
import { BaseController } from "../../shared/infra/http/base-controller";
import { CreateUserUseCase } from "./create-user";
import { registerUserSchema } from "../schemas/register-user.schema";
import { formatValidationErrors } from "../../shared/core/validation-erros";

export class CreateUserController extends BaseController {
  constructor(private useCase: CreateUserUseCase) {
    super();
  }

  async executeImpl(req: Request, res: Response): Promise<Response | void> {
    const validation = await registerUserSchema.safeParseAsync(req.body);
    if (!validation.success) {
      const errors = formatValidationErrors(validation.error);
      return this.clientError(res, undefined, errors);
    }

    const payload = validation.data;

    const result = await this.useCase.execute(payload);

    if (!result.ok) {
      if (result.error === "USER_ALREADY_EXISTS") {
        return this.clientError(res, result.error);
      }
      throw new Error(result.error);
    }

    return this.created(res, result.value);
  }
}
