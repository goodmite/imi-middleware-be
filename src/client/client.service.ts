import { HttpService, Injectable, Request } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, filter, finalize, map, repeat, repeatWhen, scan, skipWhile, take, takeWhile, tap } from 'rxjs/operators';
import * as https from 'https';

@Injectable()
export class ClientService {

  agent = new https.Agent({ rejectUnauthorized: true });

  constructor(private readonly httpService: HttpService) {
    // httpService.get('', {httpAgent: agent});
  }

  /**
   * https://docs.nestjs.com/techniques/http-module
   * makeReq:
   */
  makeReq(req: Request, headers, body, query): Observable<any> {
    const method = req.method.toLowerCase();
    const proxy_url = headers.proxy_url;
    return this.httpService[method](proxy_url, body, { validateStatus: status => true, headers: { 'Content-Type': 'application/json' } })
      .pipe(map((x: any) => {
          return {
            ...(x.data),
            __proxy_url: proxy_url,
          };
        }),
        catchError((err) => {
          throw {
            makeReqError: err,
            proxy_url,
            method,
          };
        }),
      );
  }

  poll(req: Request, headers, body, query, pollConfig: { maxPollCount: number, pollDelay: number, pollSuccessCondition }) {
    const pollSuccessCb = this.pollSuccessCb(pollConfig.pollSuccessCondition);
    let count = 0;
    return this.makeReq(req, headers, body, query)
      .pipe(
        catchError((err) => {
          throw {
            errorMessage: `Tried connecting to destination url ${err.proxy_url} via method ${err.method.toUpperCase()}
          but got error: ${err.makeReqError.message} and code: ${err.makeReqError.code}`,
          };
        }),
        delay(pollConfig.pollDelay || 1000),
        repeat(pollConfig.maxPollCount),
        skipWhile((val: any) => {
          try {
            ++count;
            return pollSuccessCb(val);
          } catch (e) {
            throw ({
              errorMessage: `${e.errorMessage} PollCondition should be valid Javascript.
              If you are passing PollCondition in query, it should be url encoded.
            Reference: https://www.w3schools.com/jsref/jsref_encodeuri.asp
            Example:
              condition(JS) : body.random % 10 === 0
              condition(JS + url encoded): body%5B0%5D.random%2510%20===%200`,
            });
          }
        }),
        take(1),
        map((value) => {
          return { value, attemptCount: count };
        }),
      );
  }

  pollSuccessCb(pollCondition: string): (body: any) => boolean {
    return (body: any) => {
      try {
        // tslint:disable-next-line:no-eval
        return !eval(pollCondition) as boolean;
      } catch (e) {
        throw { errorMessage: `pollCondition: ${pollCondition}.` };
      }
    };
  };

}
