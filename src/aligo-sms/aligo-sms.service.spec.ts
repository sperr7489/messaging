import { Test, TestingModule } from '@nestjs/testing';
import { AligoSmsService } from './aligo-sms.service';

describe('AligoSmsService', () => {
  let service: AligoSmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AligoSmsService],
    }).compile();

    service = module.get<AligoSmsService>(AligoSmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
