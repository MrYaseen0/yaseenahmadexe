// Read password only from piped stdin. Never pass it as a CLI argument.
import crypto from 'node:crypto';
let password=''; for await (const chunk of process.stdin) password+=chunk;
password=password.replace(/\r?\n$/, ''); if (!password) throw new Error('Password required on stdin');
const salt=crypto.randomBytes(16).toString('hex');
console.log(`scrypt$${salt}$${crypto.scryptSync(password,salt,64).toString('hex')}`);
