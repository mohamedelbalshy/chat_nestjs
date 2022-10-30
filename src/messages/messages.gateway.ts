import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/auth/guards/ws.guard';
import { PrismaService } from 'src/prisma.service';
import { CustomSocket } from 'src/auth/types/Socket.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsGuard)
export class MessagesGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly messagesService: MessagesService,
    private readonly prismaService: PrismaService,
  ) {}

  @SubscribeMessage('createMessage')
  create(@MessageBody() createMessageDto: CreateMessageDto) {
    console.log(createMessageDto);
    return this.messagesService.create(createMessageDto);
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('findOneMessage')
  findOne(@MessageBody() id: number) {
    return this.messagesService.findOne(id);
  }

  @SubscribeMessage('updateMessage')
  update(@MessageBody() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messagesService.remove(id);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() data: any,
    @ConnectedSocket()
    socket: CustomSocket,
  ) {
    console.log(1);
    const { roomId } = data;
    socket.join(data.roomId);

    const isJoined = await this.prismaService.usersInRooms.findFirst({
      where: { userId: socket.user.id, roomId: +roomId },
    });
    if (isJoined) return isJoined;

    console.log('room joined');
    return this.prismaService.usersInRooms.create({
      data: { userId: socket.user.id, roomId: +roomId, assignedAt: new Date() },
    });
  }
}
