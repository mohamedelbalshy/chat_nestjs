import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, Prisma } from '@prisma/client';
import { hash, compare, genSalt } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  public async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { email, password } = createUserDto;
    const userExists = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (userExists)
      throw new ConflictException(`User with email: ${email} already exists `);

    const hashedPassword = await this.hashPassword(password);
    const user = await this.prismaService.user.create({
      data: { ...createUserDto, password: hashedPassword },
    });
    delete user.password;
    return user;
  }

  public async findAll(whereInput: Prisma.UserFindManyArgs) {
    const users = await this.prismaService.user.findMany(whereInput);
    return users;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prismaService.user.findFirst({ where: { email } });
    if (!user)
      throw new NotFoundException(`User with email: ${email} not found!`);
    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) throw new BadRequestException(`Wrong Credentials!`);
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    delete user.password;
    return { accessToken, ...user };
  }

  async findOne(whereInput: Prisma.UserWhereInput) {
    const user = await this.prismaService.user.findFirst({
      where: whereInput,
      select: {
        email: true,
        firstName: true,
        id: true,
        lastName: true,
        mobile: true,
      },
    });
    if (!user) throw new NotFoundException(`User not found!`);
    return user;
  }

  update(whereInput: Prisma.UserWhereInput, updateUserDto: UpdateUserDto) {
    return `This action updates a # user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await compare(password, hashedPassword);

    return isMatch;
  }
}
