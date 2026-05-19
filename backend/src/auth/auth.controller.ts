import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guard/jwt.guard';
import { Request } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { User, UserRole } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return { message: 'This is a protected route', user: req.user };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() body: any) {
    return this.authService.changePassword(req.user.sub, body);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin-dashboard')
  getAdminDashboard(@Request() req) {
    return {
      message: 'Welcome to the VIP lounge. Admin access granted.',
      user: req.user,
    };
  }
}
