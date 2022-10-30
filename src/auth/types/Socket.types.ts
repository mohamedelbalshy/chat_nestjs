import { Socket } from 'socket.io';

export interface CustomSocket extends Socket {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    mobile: string;
  };
}
