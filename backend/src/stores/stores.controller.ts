import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { FilterStoresDto } from './dto/filter-stores.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  @Get()
  findAll(@Query() filter: FilterStoresDto, @CurrentUser() user: any) {
    const userId = user.role === UserRole.USER ? user.id : undefined;
    return this.storesService.findAll(filter, userId);
  }

  // Must be before :id route
  @Get('my-store')
  @Roles(UserRole.STORE_OWNER)
  getMyStore(@CurrentUser() user: any) {
    return this.storesService.getOwnerStore(user.id);
  }

  @Get('owners')
  @Roles(UserRole.ADMIN)
  getAvailableOwners() {
    return this.storesService.getAvailableOwners();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.getStoreWithStats(id);
  }
}
