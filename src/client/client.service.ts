import { HttpService, Injectable, Request } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { delay, filter, finalize, map, repeat, repeatWhen, scan, skipWhile, take, takeWhile, tap } from 'rxjs/operators';

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
      }));
  }

  poll(req: Request, headers, body, query, pollConfig: { pollCount: number, pollDelay: number, pollSuccessCb: (val: any) => boolean }) {
    return this.makeReq(req, headers, body, query)
    // return of()
      .pipe(
        delay(1000),
        repeat(1000),
        skipWhile((val: any) => {
          /*condition is NOT fulfilled*/
          // return false;
          console.log(val[0].random);
          return pollConfig.pollSuccessCb(val);
        }),
        take(1),
        tap(x => console.log('hi')),
      );
  }

}
