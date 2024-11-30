import { Test, TestingModule } from '@nestjs/testing';
import { MonitorInventarioGateway } from './monitor-inventario.gateway';

describe('MonitorInventarioGateway', () => {
  let gateway: MonitorInventarioGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitorInventarioGateway],
    }).compile();

    gateway = module.get<MonitorInventarioGateway>(MonitorInventarioGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
