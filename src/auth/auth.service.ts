import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
  ) {}
  public async register(createUserDto: CreateUserDto): Promise<Partial<User>> {
    return this.userService.create(createUserDto);
  }

  async login(loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  async findOne(whereInput: Prisma.UserWhereInput) {
    const user = await this.prismaService.user.findFirst({ where: whereInput });
    if (!user) throw new NotFoundException(`User not found!`);
    return user;
  }
}
