import { PERMISSION } from "@ecosystem/constants";
import { LoginResponseDto } from "../../gateway/auth";
import { IUser } from "../../common";

export type LoginTcpResponse = LoginResponseDto;

/** Claims chuẩn của JWT (payload đã decode) — tự định nghĩa để lib hợp đồng không phụ thuộc `jsonwebtoken` */
export interface JwtClaims {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: unknown;
}

export class AuthMetaData {
    userId: string | undefined;
    user: IUser | undefined;
    permissions: PERMISSION[] | undefined;
    jwt: JwtClaims | undefined;

    constructor(payload?: Partial<AuthMetaData>) {
        Object.assign(this, payload)
    }
}

export class AuthResponse {
    valid = false;
    metadata = new AuthMetaData();

    constructor(payload?: Partial<AuthResponse>){
        Object.assign(this, payload)
    }
}

export class AuthResult {
  valid: boolean;
  metadata?: AuthMetaData;
}