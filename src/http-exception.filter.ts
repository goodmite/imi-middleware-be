import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    let warning;
    const contentType = request.headers['content-type'] || request.headers['Content-Type'];
    if (contentType !== 'application/json') {
      warning = `Your content typing is ${contentType}, check if it should be application/json`;
    }
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: (exception as any).message,
        response: (exception as any).response,
        warning,
      });
  }
}
