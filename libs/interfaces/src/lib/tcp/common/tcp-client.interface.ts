import { Observable } from 'rxjs';
import { ResponseType } from './response.interface';

export interface TcpClient {
  // TInput mặc định `any`: client `@Client()`/`ClientProxy` không generic nên payload không được kiểm tra
  send<TResult = any, TInput = any>(pattern: any, data?: TInput): Observable<ResponseType<TResult>>;
  emit<TResult = any, TInput = any>(pattern: any, data?: TInput): Observable<ResponseType<TResult>>;
}
