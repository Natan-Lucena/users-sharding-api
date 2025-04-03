import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { user } from "../../../../generated/user";
import { UseCaseFactory } from "../../container/factories/use-case-factory";
import { Uuid } from "../../shared/core/uuid";
import { GrpcStatusCode } from "../consts";

export class UserServiceImplementation extends user.UnimplementedUserServiceService {
  async GetUser(
    call: ServerUnaryCall<user.GetUserRequest, user.GetUserResponse>,
    callback: sendUnaryData<user.GetUserResponse>
  ) {
    try {
      if (Uuid.isValid(call.request.user_id) === false) {
        return callback(
          {
            code: GrpcStatusCode.INVALID_ARGUMENT,
            message: "INVALID_ID",
          } as any,
          null
        );
      }
      const repository = UseCaseFactory.getUserRepository();
      const userData = await repository.getById(new Uuid(call.request.user_id));

      if (!userData) {
        return callback(
          {
            code: GrpcStatusCode.NOT_FOUND,
            message: "USER_NOT_FOUND",
          } as any,
          null
        );
      }

      const response = new user.GetUserResponse({
        user: new user.User({
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          tax_id: userData.taxId,
          profile_picture_url: userData.profilePictureUrl,
          created_at: userData.createdAt.toISOString(),
        }),
      });

      callback(null, response);
    } catch (error) {
      console.error("Error finding user", error);
      callback(
        {
          code: GrpcStatusCode.INTERNAL,
          message: "INTERNAL_SERVER_ERROR",
        } as any,
        null
      );
    }
  }
}
