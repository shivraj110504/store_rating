import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { FilterStoresDto } from './dto/filter-stores.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storeRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A store with this email already exists');

    const store = this.storeRepo.create({
      name: dto.name,
      email: dto.email,
      address: dto.address,
    });

    if (dto.ownerId) {
      const owner = await this.usersService.findById(dto.ownerId);
      // Check if this owner already has a store
      const existingStore = await this.storeRepo.findOne({
        where: { owner: { id: dto.ownerId } },
      });
      if (existingStore) {
        throw new ConflictException('This store owner is already assigned to another store');
      }
      store.owner = owner;
    }

    return this.storeRepo.save(store);
  }

  async findAll(filter: FilterStoresDto = {}, userId?: string): Promise<any[]> {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = filter;

    const qb = this.storeRepo
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .leftJoinAndSelect('store.ratings', 'ratings')
      .leftJoinAndSelect('ratings.user', 'ratingUser');

    if (name) qb.andWhere('store.name ILIKE :name', { name: `%${name}%` });
    if (address) qb.andWhere('store.address ILIKE :address', { address: `%${address}%` });

    const validFields = ['name', 'email', 'address', 'createdAt'];
    const orderField = validFields.includes(sortBy) ? `store.${sortBy}` : 'store.name';
    qb.orderBy(orderField, sortOrder as 'ASC' | 'DESC');

    const stores = await qb.getMany();

    return stores.map((store) => {
      const avgRating =
        store.ratings.length > 0
          ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
          : 0;

      const userRating = userId
        ? store.ratings.find((r) => r.user?.id === userId)
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: store.ratings.length,
        userRating: userRating ? { id: userRating.id, value: userRating.value } : null,
        owner: store.owner
          ? { id: store.owner.id, name: store.owner.name, email: store.owner.email }
          : null,
      };
    });
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: { owner: true, ratings: { user: true } },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async getStoreWithStats(storeId: string) {
    const store = await this.findById(storeId);
    const avgRating =
      store.ratings.length > 0
        ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
        : 0;

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating: Math.round(avgRating * 10) / 10,
      raters: store.ratings.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        rating: r.value,
        ratedAt: r.updatedAt,
      })),
    };
  }

  async getTotalCount(): Promise<number> {
    return this.storeRepo.count();
  }

  async getOwnerStore(ownerId: string) {
    const store = await this.storeRepo.findOne({
      where: { owner: { id: ownerId } },
      relations: { ratings: { user: true } },
    });

    if (!store) return null; // Return null instead of throwing - handled in controller

    const avgRating =
      store.ratings.length > 0
        ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
        : 0;

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: store.ratings.length,
      raters: store.ratings.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        rating: r.value,
        ratedAt: r.updatedAt,
      })),
    };
  }

  // Get store owners who don't have a store yet
  async getAvailableOwners() {
    const allOwners = await this.usersService.findAll({ role: UserRole.STORE_OWNER });
    const storesWithOwners = await this.storeRepo.find({ relations: { owner: true } });
    const assignedOwnerIds = storesWithOwners
      .filter(s => s.owner)
      .map(s => s.owner.id);

    return allOwners.filter((o: any) => !assignedOwnerIds.includes(o.id));
  }
}
