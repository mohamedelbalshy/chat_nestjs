import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(userId: number, createRoomDto: CreateRoomDto) {
    const room = await this.prismaService.room.create({
      data: {
        ...createRoomDto,
        createdById: userId,
      },
    });
    return room;
  }

  async findAll(whereInput: Prisma.RoomWhereInput) {
    return this.prismaService.room.findMany({ where: whereInput });
  }

  async findOne(whereInput: Prisma.RoomWhereInput) {
    const room = await this.prismaService.room.findFirst({ where: whereInput });
    if (!room) throw new NotFoundException(`Room not found!`);
    return room;
  }

  async update(
    whereInput: Prisma.RoomWhereInput,
    updateRoomDto: UpdateRoomDto,
  ) {
    const room = await this.findOne(whereInput);
    const updatedRoom = await this.prismaService.room.update({
      where: { id: room.id },
      data: updateRoomDto,
    });

    if (!updatedRoom) throw new NotFoundException(`Room not found!`);

    return updateRoomDto;
  }

  remove(whereInput: Prisma.RoomWhereInput) {
    return this.prismaService.room.deleteMany({ where: whereInput });
  }

  async joinRoom(userId: number, roomId: number): Promise<void> {
    const isJoined = await this.prismaService.usersInRooms.findFirst({
      where: { userId, roomId },
    });
    if (isJoined) throw new BadRequestException(`you already joined this room`);
    await this.prismaService.usersInRooms.create({
      data: { userId, roomId, assignedAt: new Date() },
    });
  }
}
