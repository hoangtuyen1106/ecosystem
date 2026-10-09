import { TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UsersController {
    // @MessagePattern(TCP_REQUEST_MESSAGE.USER.CREATE)
    // async create(@RequestParams) {

    // }
}
