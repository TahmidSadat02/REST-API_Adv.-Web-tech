import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/guard/jwt.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { MenuModule } from './menu/menu.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // 1. This loads your .env file
    ConfigModule.forRoot({ 
      isGlobal: true 
    }),

    // 2. This connects to PostgreSQL using the values from the .env file
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        entities: [User],
        synchronize: true, // Keep this true for development only
      }),
    }),
    UserModule,
    AuthModule,
    MenuModule,
    MailModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // This applies your JWT Bouncer to the whole app
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // This applies your Role Bouncer to the whole app
    }
  ],
})
export class AppModule {}