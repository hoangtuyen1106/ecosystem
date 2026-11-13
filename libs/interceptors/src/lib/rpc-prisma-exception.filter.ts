import { HTTP_MESSAGE, MetadataKeys } from '@ecosystem/constants';
import {
  Catch,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

interface PrismaKnownError {
  code: string;
  message: string;
  meta?: { target?: string[]; cause?: string; modelName?: string; field_name?: string };
}

interface RpcErrorPayload {
  statusCode: number;
  code: string;
  message: string;
}

const PRISMA_ERRORS: Record<string, Omit<RpcErrorPayload, 'code'>> = {
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    message: 'Bản ghi với giá trị này đã tồn tại trong hệ thống.',
  },
  P2003: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Lỗi ràng buộc khóa ngoại (foreign key constraint failed).',
  },
  P2025: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Không tìm thấy bản ghi yêu cầu.',
  },
};

const HTTP_CODE_BY_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: HTTP_MESSAGE.BAD_REQUEST,
  [HttpStatus.NOT_FOUND]: HTTP_MESSAGE.NOT_FOUND,
  [HttpStatus.CONFLICT]: HTTP_MESSAGE.FAILED,
};

/**
 * Exception filter cho microservice (TCP/gRPC). Không truy cập `response`
 * của HTTP; lỗi Prisma được chuyển thành object nằm trong `err` của packet
 * để client (bff) nhận được qua `catchError`.
 *
 * Đăng ký ở service sở hữu Prisma (auth, jobs) dưới dạng `APP_FILTER`.
 */
@Catch()
export class RpcPrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcPrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const pattern = host.switchToRpc().getContext<string>();
    const error = this.toErrorPayload(exception as PrismaKnownError);

    this.logger.error({
      pattern,
      statusCode: error.statusCode,
      message: error.message,
      error: exception,
    });

    return throwError(() => error);
  }

  private toErrorPayload(exception: PrismaKnownError): RpcErrorPayload {
    const mapped = exception?.code ? PRISMA_ERRORS[exception.code] : undefined;

    if (!mapped) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: HTTP_MESSAGE.INTERNAL_SERVER_ERROR,
        message: 'Lỗi cơ sở dữ liệu không xác định.',
      };
    }

    return {
      statusCode: mapped.statusCode,
      code: HTTP_CODE_BY_STATUS[mapped.statusCode] ?? HTTP_MESSAGE.FAILED,
      message: exception.code === 'P2025'
        ? (exception.meta?.cause as string) || mapped.message
        : mapped.message,
    };
  }
}
