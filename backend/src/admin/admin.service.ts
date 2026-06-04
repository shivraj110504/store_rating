import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { RatingsService } from '../ratings/ratings.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private storesService: StoresService,
    private ratingsService: RatingsService,
  ) {}

  async getDashboardStats() {
    const userStats = await this.usersService.getDashboardStats();
    const totalStores = await this.storesService.getTotalCount();
    const totalRatings = await this.ratingsService.getTotalCount();

    return {
      ...userStats,
      totalStores,
      totalRatings,
    };
  }
}
