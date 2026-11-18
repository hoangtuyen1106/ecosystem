import { PERMISSION } from "@ecosystem/constants";

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: PERMISSION[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: PERMISSION[];
}