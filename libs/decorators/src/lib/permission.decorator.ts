import { PERMISSION } from "@ecosystem/constants";
import { Reflector } from "@nestjs/core";

export const Permissions = Reflector.createDecorator<PERMISSION[]>();