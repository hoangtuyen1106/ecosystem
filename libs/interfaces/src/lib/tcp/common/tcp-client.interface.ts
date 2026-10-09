import { Observable } from 'rxjs';
import { ResponseType } from './response.interface';

export interface TcpClient {
  send<TResult = any, TInput = any>(pattern: any, data?: TInput): Observable<ResponseType<TResult>>;
  emit<TResult = any, TInput = any>(pattern: any, data?: TInput): Observable<ResponseType<TResult>>;
}
