import { Global, Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
@Global()
@Module({
  controllers: [MinioController],
  providers: [
    MinioService,
    {
      provide: 'MINIO_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = new Minio.Client({
          endPoint: configService.get('minio_endpoint'),
          port: +configService.get('minio_port'),
          useSSL: false,
          accessKey: configService.get('minio_access_key'),
          secretKey: configService.get('minio_secret_key'),
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MINIO_CLIENT'],
})
export class MinioModule {}
