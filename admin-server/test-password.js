import bcrypt from 'bcrypt';

const password = 'admin123';
const hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.VpO/iG';

bcrypt.compare(password, hash).then(result => {
  console.log('Password match:', result);
  
  // Generate new hash for comparison
  bcrypt.hash(password, 12).then(newHash => {
    console.log('New hash:', newHash);
  });
});