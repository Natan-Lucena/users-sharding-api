import { IUserRepository } from "../../../domain/repositories/user-repository";
import { Uuid } from "../../../shared/core/uuid";
import { failure, Result, success } from "../../../shared/core/result";

interface IUpdateUserProfilePicture {
  userId: string;
  profilePicture: string;
}

export class UpdateUserProfilePictureUseCase {
  constructor(private repository: IUserRepository) {}

  async execute(
    data: IUpdateUserProfilePicture
  ): Promise<Result<void, "USER_NOT_FOUND">> {
    const user = await this.repository.getById(new Uuid(data.userId));
    if (!user) {
      return failure("USER_NOT_FOUND");
    }
    user.updateUserProfilePicture(data.profilePicture);

    return success(await this.repository.update(user));
  }
}
