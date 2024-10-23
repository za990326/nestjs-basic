import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @ApiProperty()
  username: string;

  @IsNotEmpty({
    message: '昵称不能为空',
  })
  @ApiProperty()
  nick_name: string; // 保持与模型一致

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码不能少于 6 位',
  })
  @ApiProperty({
    minLength: 6,
  })
  password: string;

  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  @ApiProperty()
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  @ApiProperty()
  captcha: string;

  @IsOptional() // 可选字段
  head_pic?: string; // 头像，您可以决定是否为其指定默认值

  @IsOptional() // 可选字段
  phone_number?: string; // 手机号，您可以决定是否为其指定默认值

  @IsOptional() // 可选字段
  is_frozen?: boolean; // 是否被冻结，您的逻辑可以默认设置为 false
  @IsOptional() // 可选字段
  is_admin?: boolean; // 是否是管理员，您的逻辑可以默认设置为 false
}
