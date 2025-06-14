import { pool } from '../db/db';
import { auth } from '../firebase/firebase';

const email = process.env.OWNER_EMAIL || 'owner@ratethatclass.com';
const password = process.env.OWNER_PASSWORD || 'ownerpassword';

async function createOwner() {
  let userRecord;
  try {
    // 1. Try to create user in Firebase Auth
    userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    });
    console.log('Firebase user created.');
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      // If already exists, fetch the user
      userRecord = await auth.getUserByEmail(email);
      console.log('Firebase user already exists, fetched user.');
    } else {
      console.error('Error creating/fetching Firebase user:', err);
      process.exit(1);
    }
  }

  // 2. Set owner custom claim
  await auth.setCustomUserClaims(userRecord.uid, { owner: true });

  // 3. Upsert into users table
  try {
    // Try to update first
    const updateRes = await pool.query(`UPDATE users SET user_id = $1, account_type = $2 WHERE email = $3`, [
      userRecord.uid,
      'owner',
      email,
    ]);
    if (updateRes.rowCount === 0) {
      // If no row was updated, insert new
      await pool.query(
        `INSERT INTO users (user_id, email, account_type, registration_date)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [userRecord.uid, email, 'owner']
      );
      console.log('Inserted owner into users table.');
    } else {
      console.log('Updated owner in users table.');
    }
    console.log(`Owner account ready: ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating/inserting owner in users table:', err);
    process.exit(1);
  }
}

createOwner();
