import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './local.strategy';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [LocalStrategy, GoogleStrategy],
})
export class AuthModule {}
