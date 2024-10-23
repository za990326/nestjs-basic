import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-use.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from '../utils';
import { LoginUserVo } from './vo/login-user.vo';
import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user-info.dto';

import { UserListVo } from './vo/user-list.vo';
import { UnLoginException } from 'src/filter/unlogin.filter';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}
  private logger = new Logger();
  // 获取验证码

  async register(registerUser: RegisterUserDto) {
    const captcha = await this.redisService.get(
      `captcha_${registerUser.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (registerUser.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.users.findFirst({
      where: {
        username: registerUser.username,
      },
    });
    if (user) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.users.create({
        data: {
          username: registerUser.username,
          nick_name: registerUser.nick_name,
          password: md5(registerUser.password),
          email: registerUser.email,
          head_pic: registerUser.head_pic || '',
          phone_number: registerUser.phone_number || '',
          is_frozen: registerUser.is_frozen || false,
          is_admin: registerUser.is_admin || false,
        },
      });
      return '注册成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '注册失败';
    }
  }

  async login(loginUser: LoginUserDto, isAdmin: boolean) {
    const user = await this.prisma.users.findFirst({
      where: {
        username: loginUser.username,
        is_admin: isAdmin,
      },
      // 级联查询
      select: {
        id: true,
        username: true,
        password: true,
        nick_name: true,
        email: true,
        phone_number: true,
        head_pic: true,
        create_time: true,
        is_frozen: true,
        is_admin: true,

        user_roles: {
          select: {
            role: {
              select: {
                name: true,
                role_permissions: {
                  select: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnLoginException('用户不存在');
    }
    if (md5(loginUser.password) !== user.password) {
      throw new UnLoginException('密码错误');
    }

    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nick_name,
      email: user.email,
      phoneNumber: user.phone_number,
      headPic: user.head_pic,
      createTime: user.create_time.getTime(),
      isFrozen: user.is_frozen,
      isAdmin: user.is_admin,
      roles: user.user_roles.map((item) => item.role.name),
      permissions: user.user_roles.reduce((arr, item) => {
        item.role.role_permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }

  async findUserById(id: number, isAdmin: boolean) {
    const user = await this.prisma.users.findFirst({
      where: {
        id,
        is_admin: isAdmin,
      },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return {
      id: user.id,
      username: user.username,
      isFrozen: user.is_frozen,
      isAdmin: user.is_admin,
      roles: user.user_roles.map((item) => item.role.name),
      permissions: user.user_roles.reduce((arr, item) => {
        item.role.role_permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }

  async findUserDetailById(id: number) {
    const user = await this.prisma.users.findFirst({
      where: {
        id,
      },
    });
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.username = user.username;
    vo.nickName = user.nick_name;
    vo.email = user.email;
    vo.headPic = user.head_pic;
    vo.phoneNumber = user.phone_number;
    vo.isFrozen = user.is_frozen;
    vo.createTime = user.create_time;
    return vo;
  }

  async updatePassword(updatePasswordDto: UpdateUserPasswordDto) {
    // 验证码是否正确
    const captcha = await this.redisService.get(
      `captcha_${updatePasswordDto.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (updatePasswordDto.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.users.findFirst({
      where: {
        username: updatePasswordDto.username,
      },
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.email !== updatePasswordDto.email) {
      throw new HttpException('邮箱不匹配', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.users.update({
      where: {
        username: updatePasswordDto.username,
      },
      data: {
        password: md5(updatePasswordDto.password),
      },
    });
    return '修改成功';
  }

  async updateInfoDetail(userId: number, updateUserDto: UpdateUserDto) {
    // 验证码是否正确
    const captcha = await this.redisService.get(
      `captcha_${updateUserDto.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (updateUserDto.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.prisma.users.findFirst({
      where: {
        id: userId,
      },
    });
    if (updateUserDto.headPic) {
      foundUser.head_pic = updateUserDto.headPic;
    }
    if (updateUserDto.nickName) {
      foundUser.nick_name = updateUserDto.nickName;
    }
    try {
      await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: foundUser,
      });
      return '用户信息修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '用户信息修改失败';
    }
  }

  async freezeUserById(userId: number) {
    await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        is_frozen: true,
      },
    });
  }

  async findUsersByPage(
    pageNo: number,
    pageSize: number,
    username: string,
    nickName: string,
    email: string,
  ) {
    const where: Record<string, any> = {};
    if (username) {
      where.username = {
        contains: username,
      };
    }
    if (nickName) {
      where.nick_name = {
        contains: nickName,
      };
    }
    if (email) {
      where.email = {
        contains: email,
      };
    }
    const users = await this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        nick_name: true,
        email: true,
        phone_number: true,
        head_pic: true,
        create_time: true,
        is_frozen: true,
      },
      where,
      skip: (pageNo - 1) * pageSize,
      take: +pageSize,
    });
    const total = await this.prisma.users.count();
    const vo = new UserListVo();
    vo.users = users;
    vo.totalCount = total;
    return vo;
  }
}
