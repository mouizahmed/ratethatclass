import { AccountType } from '@/types/user';

interface AccountTypeTagProps {
  accountType: AccountType;
  className?: string;
}

export function AccountTypeTag({ accountType, className = '' }: AccountTypeTagProps) {
  const getTagColor = (type: AccountType) => {
    switch (type) {
      case 'student':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'owner':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'user':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'anonymous':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${getTagColor(accountType)} ${className}`}>
      {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
    </span>
  );
}
