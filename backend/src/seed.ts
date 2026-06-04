import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './users/user.entity';
import { Store } from './stores/store.entity';
import { Rating } from './ratings/rating.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'ratehub123',
  database: process.env.DB_NAME || 'store_rating_db',
  entities: [User, Store, Rating],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to DB');

  const userRepo = AppDataSource.getRepository(User);
  const storeRepo = AppDataSource.getRepository(Store);

  // Create admin
  const adminExists = await userRepo.findOne({ where: { email: 'admin@ratehub.com' } });
  if (!adminExists) {
    const admin = userRepo.create({
      name: 'System Administrator Account',
      email: 'admin@ratehub.com',
      password: await bcrypt.hash('Admin@123', 10),
      address: '123 Admin Street, System City, State 00000',
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('✅ Admin created: admin@ratehub.com / Admin@123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Create store owner
  let owner = await userRepo.findOne({ where: { email: 'owner@ratehub.com' } });
  if (!owner) {
    owner = userRepo.create({
      name: 'Store Owner Demo Account Here',
      email: 'owner@ratehub.com',
      password: await bcrypt.hash('Owner@123', 10),
      address: '456 Owner Avenue, Commerce City, State 11111',
      role: UserRole.STORE_OWNER,
    });
    owner = await userRepo.save(owner);
    console.log('✅ Store Owner created: owner@ratehub.com / Owner@123');
  } else {
    console.log('ℹ️  Store owner already exists');
  }

  // Create a store for owner
  const storeExists = await storeRepo.findOne({ where: { email: 'demostore@ratehub.com' } });
  if (!storeExists) {
    const store = storeRepo.create({
      name: 'The Demo Flagship Store Here',
      email: 'demostore@ratehub.com',
      address: '789 Commerce Blvd, Shopping District, State 22222',
      owner,
    });
    await storeRepo.save(store);
    console.log('✅ Demo store created');
  } else {
    console.log('ℹ️  Demo store already exists');
  }

  // Create sample normal user
  const userExists = await userRepo.findOne({ where: { email: 'user@ratehub.com' } });
  if (!userExists) {
    const user = userRepo.create({
      name: 'Normal User Demo Account Here',
      email: 'user@ratehub.com',
      password: await bcrypt.hash('User@1234', 10),
      address: '321 Residential Lane, Suburb City, State 33333',
      role: UserRole.USER,
    });
    await userRepo.save(user);
    console.log('✅ Normal user created: user@ratehub.com / User@1234');
  } else {
    console.log('ℹ️  Normal user already exists');
  }

  console.log('\n🎉 Seed complete!');
  console.log('Test accounts:');
  console.log('  Admin:       admin@ratehub.com / Admin@123');
  console.log('  Store Owner: owner@ratehub.com / Owner@123');
  console.log('  Normal User: user@ratehub.com  / User@1234');
  await AppDataSource.destroy();
}

seed().catch(e => { console.error(e); process.exit(1); });
