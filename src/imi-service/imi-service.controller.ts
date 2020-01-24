import { Controller, Get, HttpService } from '@nestjs/common';

// tslint:disable-next-line:no-var-requires
const { linkPreview } = require(`link-preview-node`);

@Controller('imi-service/v1')
export class ImiServiceController {

  constructor(private readonly httpService: HttpService) {
  }

  @Get('heartbeat1')
  getHello() {
    return new Promise((resolve, reject) => {
      linkPreview(`https://www.google.com/`)
        .then(resp => {
          resolve(resp);
          /* { image: 'https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png',
              title: 'npm | build amazing things',
              description: '',
              link: 'http://npmjs.com' } */
          // Note that '' is used when value of any detail of the link is not available
        }).catch(catchErr => {
        console.log(catchErr);
        reject(catchErr);
      });
    });
  }
}
