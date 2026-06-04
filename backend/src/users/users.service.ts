import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async createByAdmin(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.create({ ...dto, password: hashed });
  }

  async findAll(filter: FilterUsersDto = {}): Promise<any[]> {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = filter;
    const where: any = {};
    if (name) where.name = ILike(`%${name}%`);
    if (email) where.email = ILike(`%${email}%`);
    if (address) where.address = ILike(`%${address}%`);
    if (role) where.role = role;

    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';

    const users = await this.userRepo.find({
      where,
      order: { [orderField]: sortOrder },
      relations: { store: true },
    });

    return users.map(u => {
      const { password, ...safe } = u as any;
      return safe;
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id }, relations: { store: true } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
    return { message: 'Password updated successfully' };
  }

  async getDashboardStats() {
    const totalUsers = await this.userRepo.count();
    const totalAdmins = await this.userRepo.count({ where: { role: UserRole.ADMIN } });
    const totalNormal = await this.userRepo.count({ where: { role: UserRole.USER } });
    const totalStoreOwners = await this.userRepo.count({ where: { role: UserRole.STORE_OWNER } });
    return { totalUsers, totalAdmins, totalNormal, totalStoreOwners };
  }
}
