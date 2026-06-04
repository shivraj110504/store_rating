import { Controller, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @Roles(UserRole.USER)
  create(@CurrentUser() user: any, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(user.id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.USER)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateRatingDto) {
    return this.ratingsService.update(user.id, id, dto);
  }
}
