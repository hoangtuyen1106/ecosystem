import { PERMISSION } from "@ecosystem/constants";
import { LoginResponseDto } from "../../gateway/auth";

export type LoginTcpResponse = LoginResponseDto;

export class AuthMetaData {
    userId: string | undefined;
    user: undefined;
    permisstions: PERMISSION[] | undefined;
    jwt: string | undefined;

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