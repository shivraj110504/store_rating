import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(@InjectRepository(Rating) private ratingRepo: Repository<Rating>) {}

  async create(userId: string, dto: CreateRatingDto): Promise<Rating> {
    const existing = await this.ratingRepo.findOne({
      where: { user: { id: userId }, store: { id: dto.storeId } },
    });
    if (existing) throw new ConflictException('You have already rated this store');

    const rating = this.ratingRepo.create({
      value: dto.value,
      user: { id: userId } as any,
      store: { id: dto.storeId } as any,
    });
    return this.ratingRepo.save(rating);
  }

  async update(userId: string, ratingId: string, dto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingRepo.findOne({
      where: { id: ratingId, user: { id: userId } },
    });
    if (!rating) throw new NotFoundException('Rating not found');
    rating.value = dto.value;
    return this.ratingRepo.save(rating);
  }

  async getTotalCount(): Promise<number> {
    return this.ratingRepo.count();
  }
}
