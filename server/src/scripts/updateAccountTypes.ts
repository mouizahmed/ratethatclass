import { pool } from '../db/db';
import { auth } from '../firebase/firebase';

// Fill this array with your users and their desired account types
const updates: { email: string; account_type: string }[] = [
  { email: 'email@email.com', account_type: 'student' },
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
      console.log(`Failed to update ${email}:`, err.message);
    }
  }
  process.exit(0);
}

updateAccountTypes();
