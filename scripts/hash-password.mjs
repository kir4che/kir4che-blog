import { randomBytes, scryptSync } from 'node:crypto';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const password = await rl.question('請輸入密碼：', {
  hideEchoBack: true,
});

rl.close();

if (!password) {
  console.error('必須輸入密碼！');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

console.log(`scrypt$${salt.toString('base64')}$${hash.toString('base64')}`);
