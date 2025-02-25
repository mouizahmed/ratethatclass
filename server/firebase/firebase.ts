import admin, { ServiceAccount } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

const config = dotenv.config().parsed;

const serviceAccount = {
  type: config?.TYPE,
  project_id: config?.PROJECT_ID,
  private_key_id: config?.PRIVATE_KEY_ID,
  private_key: config?.PRIVATE_KEY,
  client_email: config?.CLIENT_EMAIL,
  client_id: config?.CLIENT_ID,
  auth_uri: config?.AUTH_URI,
  token_uri: config?.TOKEN_URI,
  auth_provider_x509_cert_url: config?.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: config?.CLIENT_X509_CERT_URL,
  universe_domain: config?.UNIVERSE_DOMAIN,
};

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: 'https://course-reviews-58532-default-rtdb.firebaseio.com',
});
const auth = getAuth(app);

export { app, auth };
