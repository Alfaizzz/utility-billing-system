import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  customerId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'super_secret_utility_billing_jwt_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, status: UserStatus.ACTIVE },
      relations: { customer: true },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'User is inactive or no longer exists',
        errorCode: 'UNAUTHORIZED',
      });
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customer?.id,
    };
  }
}
