import { MetadataKeys } from "@ecosystem/constants";
import { parseToken } from "./string.util";
import { AuthResult } from "@ecosystem/interfaces";

export const getAccessToken = (req: any, keepBearer = false): string => {
    const token = req.headers?.['authorization'];

    return keepBearer ? token : parseToken(token);
}

export function setUserData(req: any, userData?: AuthResult): void {
  req[MetadataKeys.USER_DATA] = userData;
}
