import { z } from "zod";
import { validationErrors } from "../../shared/core/validation-erros";

export const registerUserSchema = z.object({
  email: z
    .string({ invalid_type_error: validationErrors.string("email") })
    .email(),
  password: z.string({
    invalid_type_error: validationErrors.string("password"),
  }),
  name: z.string({ invalid_type_error: validationErrors.string("name") }),
  taxId: z
    .string({ invalid_type_error: validationErrors.string("taxId") })
    .regex(new RegExp("^[0-9]+$"))
    .min(11)
    .max(14),
  role: z.enum(["ADMIN", "USER"], {
    invalid_type_error: validationErrors.enum(["ADMIN", "USER"]),
  }),
});
