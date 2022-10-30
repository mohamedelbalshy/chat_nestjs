import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(bearerToken) as any;
      return new Promise((resolve, reject) => {
        return this.userService
          .findOne({ id: decoded.id, email: decoded.email })
          .then((user) => {
            if (user) {
              context.switchToHttp().getRequest().user = user;
              resolve(user);
            } else {
              reject(false);
            }
          });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
