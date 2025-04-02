import { Uuid } from "../../shared/core/uuid";

type roleType = "ADMIN" | "USER";
interface ICreateUser {
  id?: Uuid;
  createdAt?: Date;
  profilePictureUrl?: string;
  email: string;
  name: string;
  role: roleType;
  password: string;
  taxId: string;
}

export class User {
  constructor(
    readonly id: Uuid,
    private _email: string,
    private _name: string,
    private _password: string,
    private _taxId: string,
    readonly createdAt: Date,
    readonly role: roleType,
    private _profilePictureUrl?: string
  ) {}

  get name(): string {
    return this._name;
  }

  get taxId(): string {
    return this._taxId;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get profilePictureUrl(): string | undefined {
    return this._profilePictureUrl;
  }

  static create(props: ICreateUser): User {
    return new User(
      props.id || Uuid.random(),
      props.email,
      props.name,
      props.password,
      props.taxId,
      props.createdAt || new Date(),
      props.role,
      props.profilePictureUrl
    );
  }

  updateUserProfilePicture(profilePictureUrl: string): void {
    this._profilePictureUrl = profilePictureUrl;
  }
}
