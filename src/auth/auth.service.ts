import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  static AuthProviderUrls = [
    'https://dev.imibot.ai/api/v1/user/login/',
    'https://staging.imibot.ai/api/v1/user/login/',
    'https://imibot.ai/api/v1/user/login/',
  ];
  static tokenExpiry = 30 * 24 * 3600 * 1000; // 30days
}
