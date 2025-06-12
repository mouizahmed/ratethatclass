import admin, { ServiceAccount } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: 'https://course-reviews-58532-default-rtdb.firebaseio.com',
});
const auth = getAuth(app);

// export const setOwnerClaim = async () => {
//   const email = 'mouizahmed1@gmail.com';
//   console.log(`Attempting to set owner claim for ${email}...`);
//   try {
//     const user = await auth.getUserByEmail(email);
//     await auth.setCustomUserClaims(user.uid, { owner: true });
//     console.log(`Successfully set owner claim for ${email}`);
//   } catch (error) {
//     console.log(`Error setting custom claim for ${email}:`, error);
//     if ((error as any).code === 'auth/user-not-found') {
//       console.log('User does not exist. Please create the user in Firebase Authentication first.');
//     }
//   }
// };

export { app, auth };
