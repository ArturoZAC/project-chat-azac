import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  static success<T>(data: T, message: string = 'OK') {
    return { data, message };
  }

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      // map((data) => ({
      //   success: true,
      //   data: data?.data ?? data,
      //   message: data?.message ?? 'OK',
      // })),

      map((response) => {
        if (response && 'data' in response && 'message' in response) {
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        }
        return {
          success: true,
          data: response,
          message: 'OK',
        };
      }),
    );
  }
}
