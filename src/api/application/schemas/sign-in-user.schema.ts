import { z } from "zod";
import { validationErrors } from "../../shared/core/validation-erros";

export const signInUserSchema = z.object({
  email: z
    .string({ invalid_type_error: validationErrors.string("email") })
    .email(),
  password: z.string({
    invalid_type_error: validationErrors.string("password"),
  }),
});
