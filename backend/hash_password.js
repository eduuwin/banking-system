import bcrypt from 'bcrypt';

const password = '34762414';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
