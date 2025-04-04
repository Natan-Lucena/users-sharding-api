import { Request, Response } from "express";
import { BaseController } from "../../../shared/infra/http/base-controller";
import { signInUserSchema } from "../../schemas/sign-in-user.schema";
import { formatValidationErrors } from "../../../shared/core/validation-erros";
import { SignInUserUseCase } from "./sign-in-user";

export class SignInUserController extends BaseController {
  constructor(private useCase: SignInUserUseCase) {
    super();
  }
  async executeImpl(req: Request, res: Response): Promise<Response | void> {
    const validation = await signInUserSchema.safeParseAsync(req.body);
    if (!validation.success) {
      const errors = formatValidationErrors(validation.error);
      return this.clientError(res, undefined, errors);
    }

    const payload = validation.data;

    const result = await this.useCase.execute(payload);
    if (!result.ok) {
      if (result.error === "USER_NOT_FOUND") {
        return this.clientError(res, result.error);
      }
      if (result.error === "INVALID_PASSWORD") {
        return this.clientError(res, result.error);
      }
      throw new Error(result.error);
    }

    return this.ok(res, { token: result.value.token });
  }
}
