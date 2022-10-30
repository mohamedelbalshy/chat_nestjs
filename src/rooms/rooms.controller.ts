import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createRoomDto: CreateRoomDto, @User() user: any) {
    return this.roomsService.create(user.id, createRoomDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.roomsService.findAll({});
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne({ id: +id });
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinRoom(@Param('id') id: string, @User() user: any) {
    return this.roomsService.joinRoom(user.id, +id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @User() user: any,
  ) {
    return this.roomsService.update(
      { id: +id, createdById: user.id },
      updateRoomDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @User() user: any) {
    return this.roomsService.remove({ id: +id, createdById: user.id });
  }
}
