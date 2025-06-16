import { pool } from '../db/db';
import { auth } from '../firebase/firebase';

// Fill this array with your users and their desired account types
const updates: { email: string; account_type: string }[] = [
  { email: '20ssz1@queensu.ca', account_type: 'student' },
  { email: 'cervina.liu@mail.utoronto.ca', account_type: 'student' },
  { email: 'atif.butt@torontomu.ca', account_type: 'student' },
  { email: 'chloe.gongminiere@mail.utoronto.ca', account_type: 'student' },
  { email: 'sabohdan@uwaterloo.ca', account_type: 'student' },
  { email: 'sabohdanow@uwaterloo.ca', account_type: 'student' },
  { email: 'mouiza@my.yorku.ca', account_type: 'student' },
  { email: 'wendy1.tran@torontomu.ca', account_type: 'student' },
  { email: 'daania@my.yorku.ca', account_type: 'student' },
  // ... add all users here
];

async function updateAccountTypes() {
  for (const { email, account_type } of updates) {
    try {
      // 1. Get user from Firebase
      const userRecord = await auth.getUserByEmail(email);

      // 2. Set custom claim in Firebase
      await auth.setCustomUserClaims(userRecord.uid, { account_type });

      // 3. Update in local database
      await pool.query(`UPDATE users SET account_type = $1 WHERE email = $2`, [account_type, email]);

      console.log(`Updated ${email} to account_type: ${account_type}`);
    } catch (err: any) {
      console.error(`Failed to update ${email}:`, err.message);
    }
  }
  process.exit(0);
}

updateAccountTypes();
