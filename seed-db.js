import { db } from './server/db.ts';
import { users, drivers } from './shared/schema.ts';

const sampleUsers = [
  { email: 'bampoesean@gmail.com', phone: '+27123456789', name: 'Demo User', userType: 'user' },
  { email: 'driver1@towapp.com', phone: '+27123456700', name: 'John Smith', userType: 'driver' },
  { email: 'driver2@towapp.com', phone: '+27123456701', name: 'Mike Johnson', userType: 'driver' },
  { email: 'driver3@towapp.com', phone: '+27123456702', name: 'Sarah Wilson', userType: 'driver' }
];

const sampleDrivers = [
  { companyName: 'QuickTow Services', vehicleType: 'Flatbed Truck', licensePlate: 'GT-1234-GP', currentLatitude: -26.1956, currentLongitude: 28.0342 },
  { companyName: 'FastTow Co.', vehicleType: 'Tow Truck', licensePlate: 'TT-5678-GP', currentLatitude: -26.2100, currentLongitude: 28.0500 },
  { companyName: 'RapidTow Solutions', vehicleType: 'Heavy Duty Truck', licensePlate: 'HD-9012-GP', currentLatitude: -26.1800, currentLongitude: 28.0200 }
];

try {
  // Insert users
  for (let i = 0; i < sampleUsers.length; i++) {
    const user = sampleUsers[i];
    const [insertedUser] = await db.insert(users).values(user).returning();
    console.log(`Created user: ${user.email}`);
    
    // If it's a driver, create driver record
    if (user.userType === 'driver' && i > 0) {
      const driverData = {
        userId: insertedUser.id,
        ...sampleDrivers[i - 1],
        isAvailable: true,
        rating: 4.8,
        totalJobs: 127
      };
      
      await db.insert(drivers).values(driverData);
      console.log(`Created driver: ${user.name}`);
    }
  }
  
  console.log('Database seeded successfully!');
} catch (error) {
  console.error('Error seeding database:', error);
}