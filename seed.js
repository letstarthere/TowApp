import Database from 'better-sqlite3';

const db = new Database('./local.db');

// Create sample users
const users = [
  { email: 'bampoesean@gmail.com', phone: '+27123456789', name: 'Demo User', userType: 'user' },
  { email: 'driver1@towapp.com', phone: '+27123456700', name: 'John Smith', userType: 'driver' },
  { email: 'driver2@towapp.com', phone: '+27123456701', name: 'Mike Johnson', userType: 'driver' },
  { email: 'driver3@towapp.com', phone: '+27123456702', name: 'Sarah Wilson', userType: 'driver' }
];

// Insert users
const insertUser = db.prepare(`
  INSERT INTO users (email, phone, name, user_type, created_at, updated_at) 
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertDriver = db.prepare(`
  INSERT INTO drivers (user_id, company_name, vehicle_type, license_plate, is_available, current_latitude, current_longitude, rating, total_jobs, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = Date.now();

users.forEach((user, index) => {
  const result = insertUser.run(user.email, user.phone, user.name, user.userType, now, now);
  
  if (user.userType === 'driver') {
    const companies = ['QuickTow Services', 'FastTow Co.', 'RapidTow Solutions'];
    const vehicles = ['Flatbed Truck', 'Tow Truck', 'Heavy Duty Truck'];
    const plates = ['GT-1234-GP', 'TT-5678-GP', 'HD-9012-GP'];
    const locations = [
      [-26.1956, 28.0342],
      [-26.2100, 28.0500],
      [-26.1800, 28.0200]
    ];
    
    const driverIndex = index - 1;
    insertDriver.run(
      result.lastInsertRowid,
      companies[driverIndex],
      vehicles[driverIndex],
      plates[driverIndex],
      1, // available
      locations[driverIndex][0],
      locations[driverIndex][1],
      4.8,
      127,
      now,
      now
    );
  }
});

console.log('Database seeded successfully!');
db.close();