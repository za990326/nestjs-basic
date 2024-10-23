import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
// 设置登录装饰器
export const RequireLogin = () => SetMetadata('require-login', true);
// 设置权限装饰器
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('require-permission', permissions);

export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // @ts-ignore
    if (!request.user) {
      return null;
    }
    // @ts-ignore
    return data ? request.user[data] : request.user;
  },
);
