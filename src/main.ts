import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './interceptor/format-response.interceptor';
import { InvokeRecordInterceptor } from './interceptor/invoke-record.interceptor';
import { UnloginFilter } from './filter/unlogin.filter';
import { CustomExceptionFilter } from './filter/custom-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: '*' });
  // 配置静态资源
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });
  app.useGlobalPipes(new ValidationPipe());
  // 格式化响应拦截器
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  // 接口调用记录拦截器
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  const configService = app.get(ConfigService);
  // app.useGlobalGuards(new LoginGuard());

  // 全局异常过滤器
  app.useGlobalFilters(new UnloginFilter());
  app.useGlobalFilters(new CustomExceptionFilter());

  // 配置winston日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 配置swagger, 生成api文档
  const config = new DocumentBuilder()
    .setTitle('XXXX系统')
    .setDescription('api 接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description: '基于jwt的认证',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(configService.get('nest_server_port'));
}
bootstrap();
