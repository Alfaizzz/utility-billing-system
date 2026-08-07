import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response already matches standard wrapper format, leave intact
        if (res && res.success !== undefined && res.message !== undefined) {
          return res;
        }

        return {
          success: true,
          message: res?.message || 'Request executed successfully',
          data: res?.data !== undefined ? res.data : res,
          ...(res?.meta && { meta: res.meta }),
        };
      }),
    );
  }
}
