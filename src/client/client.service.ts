import { HttpService, Injectable, Request } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, filter, finalize, map, repeat, repeatWhen, scan, skipWhile, take, takeWhile, tap } from 'rxjs/operators';

/**
 * Our own polling operator!
 */
// const poll = <T>(comparar: (a: T, b: T) => boolean, initVal: any, delayMs: number, maxCount?: number) => (source: Observable<T>) => {
//   const id = new Date();
//   console.log('Start new polling, id: ', id);
//
//   return source.pipe(
//     // repeat after delay
//     repeatWhen(notifications => {
//       return notifications.pipe(
//         delay(delayMs),
//         takeWhile(count => maxCount === undefined || count < maxCount),
//       );
//     }),
//
//     // combine current and previous results, use initValue as seed
//     scan((acc, x: T) => ({ curr: x, prev: acc.curr }), { curr: initVal, prev: undefined }),
//
//     // demo only
//     tap(x => console.log(x)),
//
//     // filter result using comparar
//     filter(acc => !comparar(acc.prev, acc.curr)),
//
//     // return the last result (only curr property of scan accumulator acc)
//     map(acc => acc.curr),
//
//     finalize(() => console.log('Stop polling, id: ', id)),
//   );
// };

@Injectable()
export class ClientService {

  constructor(private readonly httpService: HttpService) {
  }

  /**
   * https://docs.nestjs.com/techniques/http-module
   * makeReq:
   */
  makeReq(req: Request, headers, body, query): Observable<any> {
    const method = req.method.toLowerCase();
    const proxyToUrl = query.proxyToUrl || body.proxyToUrl || 'https://csrng.net/csrng/csrng.php?min=26max=100';
    console.log(proxyToUrl);
    return this.httpService[method](proxyToUrl, body, { headers })
      .pipe(map((x: any) => {
          return {
            ...(x.data),
            __proxyToUrl: proxyToUrl,
          };
        }),
        catchError((err) => {
          throw {
            makeReqError: err,
            proxyToUrl,
            method,
          };
        }),
      );
  }

  poll(req: Request, headers, body, query, pollConfig: { maxPollCount: number, pollDelay: number, pollSuccessCondition }) {
    const pollSuccessCb = this.pollSuccessCb(pollConfig.pollSuccessCondition);
    return this.makeReq(req, headers, body, query)
      .pipe(
        catchError((err) => {
          throw {
            errorMessage: `Tried connecting to destination url ${err.proxyToUrl} via method ${err.method.toUpperCase()}
          but got error: ${err.makeReqError.message} and code: ${err.makeReqError.code}`,
          };
        }),
        delay(1000),
        repeat(pollConfig.maxPollCount),
        skipWhile((val: any) => {
          try {
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
        tap(x => console.log('hi')),
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
