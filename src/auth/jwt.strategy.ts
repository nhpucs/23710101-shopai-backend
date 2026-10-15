import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Đọc đúng định dạng Header "Authorization: Bearer <token>" mà axiosClient đang tự gắn
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Token hết hạn phải bị từ chối, không được du di
      // getOrThrow thay get — thiếu JWT_SECRET thì báo lỗi ngay lúc bật server
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Passport TỰ ĐỘNG gọi hàm này SAU KHI chữ ký hợp lệ và Token chưa hết hạn.
  // Giá trị return được gắn vào `request.user` cho mọi Controller phía sau Guard.
  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
