import { Get, Controller } from '@nestjs/common';
import { RequireLogin, RequirePermission } from './decorator/custom.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Get('aaa')
  getHello(): string {
    return 'aaa';
  }
}
