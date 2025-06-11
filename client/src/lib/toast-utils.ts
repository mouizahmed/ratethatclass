import { toast } from '@/hooks/use-toast';

export const toastUtils = {
  // Success toasts
  success: (message: string, description?: string) => {
    toast({
      title: 'Success!',
      description: description || message,
    });
  },

  // Error toasts
  error: (message: string, description?: string) => {
    toast({
      variant: 'destructive',
      title: 'Something went wrong',
      description: description || message,
    });
  },

  // Authentication related toasts
  auth: {
    notLoggedIn: () => {
      toast({
        title: 'Authentication required',
        description: 'Please log in to perform this action.',
      });
    },

    notVerified: () => {
      toast({
        title: 'Email verification required',
        description: 'Please verify your email to perform this action.',
      });
    },

    banned: (banReason?: string) => {
      toast({
        variant: 'destructive',
        title: 'Account banned',
        description: banReason
          ? `You are banned: ${banReason}. You will be logged out automatically.`
          : 'You are banned from performing this action. You will be logged out automatically.',
      });
    },

    adminOrOwner: () => {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Admins and owners cannot perform regular user actions.',
      });
    },
  },

  // Loading/fetch error toasts
  loadError: (resource: string) => {
    toast({
      variant: 'destructive',
      title: 'Loading failed',
      description: `Failed to load ${resource}. Please try again.`,
    });
  },

  // CRUD operation toasts
  crud: {
    created: (resource: string) => {
      toast({
        title: 'Success!',
        description: `${resource} has been created successfully.`,
      });
    },

    updated: (resource: string) => {
      toast({
        title: 'Success!',
        description: `${resource} has been updated successfully.`,
      });
    },

    deleted: (resource: string) => {
      toast({
        title: 'Success!',
        description: `${resource} has been deleted successfully.`,
      });
    },

    createError: (resource: string, error?: string) => {
      toast({
        variant: 'destructive',
        title: 'Creation failed',
        description: error || `Failed to create ${resource}. Please try again.`,
      });
    },

    updateError: (resource: string, error?: string) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error || `Failed to update ${resource}. Please try again.`,
      });
    },

    deleteError: (resource: string, error?: string) => {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error || `Failed to delete ${resource}. Please try again.`,
      });
    },
  },

  // Network/API error toasts
  networkError: () => {
    toast({
      variant: 'destructive',
      title: 'Network error',
      description: 'Please check your connection and try again.',
    });
  },

  // Custom toast with consistent styling
  custom: (title: string, description: string, variant?: 'default' | 'destructive') => {
    toast({
      title,
      description,
      variant: variant || 'default',
    });
  },
};
