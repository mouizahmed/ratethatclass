import { toastUtils } from '@/lib/toast-utils';
import { User } from 'firebase/auth';
import { auth } from '@/firebase/firebase';

export function checkUserActionAllowed({
  userLoggedIn,
  currentUser,
  banned,
  banReason,
  isAdmin,
  isOwner,
}: {
  userLoggedIn: boolean;
  currentUser: User | null;
  banned: boolean;
  banReason?: string;
  isAdmin?: boolean;
  isOwner?: boolean;
}): boolean {
  if (!userLoggedIn) {
    toastUtils.auth.notLoggedIn();
    return false;
  } else if (currentUser?.emailVerified === false) {
    toastUtils.auth.notVerified();
    return false;
  } else if (banned) {
    toastUtils.auth.banned(banReason);
    auth.signOut();
    return false;
  } else if (isAdmin || isOwner) {
    toastUtils.auth.adminOrOwner();
    return false;
  }
  return true;
}
