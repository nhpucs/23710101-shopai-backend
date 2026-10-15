import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt') tự dùng đúng JwtStrategy ở trên (tên mặc định của Strategy là 'jwt')
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
