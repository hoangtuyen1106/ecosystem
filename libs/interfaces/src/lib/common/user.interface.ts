export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  roles: IRole[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IRole {
  id: string;
  name: string;
}