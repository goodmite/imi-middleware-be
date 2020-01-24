import { Test, TestingModule } from '@nestjs/testing';
import { ImiServiceController } from './imi-service.controller';

describe('ImiService Controller', () => {
  let controller: ImiServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImiServiceController],
    }).compile();

    controller = module.get<ImiServiceController>(ImiServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
