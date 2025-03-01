import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider, FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DialogFormStep from './DialogFormStep';
import { z, ZodObject } from 'zod';
import { useAuth } from '@/contexts/authContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';

export interface StepProps<T extends ZodObject<any>> {
  title: string;
  description: string;
  content: React.ComponentType<{ stepData: any }>;
  fields?: (keyof z.infer<T>)[];
}

export interface SteppedFormDialogProps<T extends ZodObject<any>> {
  triggerButton: React.ReactNode;
  steps: StepProps<T>[]; // Fixed type
  onSubmit: (data: any) => void;
  schema: T;
}

export function DialogForm<T extends ZodObject<any>>({
  triggerButton,
  steps,
  onSubmit,
  schema,
}: SteppedFormDialogProps<T>) {
  const { toast } = useToast();
  const { userLoggedIn, currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const handleNext = async () => {
    const isValid = await methods.trigger(steps[currentStep].fields as any, {
      shouldFocus: true,
    });
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        try {
          await methods.handleSubmit(onSubmit)();
          setOpen(false);
          setCurrentStep(0);
          methods.reset();
        } catch (error) {
          toast({
            title: `Uh oh! There was an error submitting your request.`,
            description: (error as Error).message,
          });
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleDialog = (open: boolean) => {
    if (open === true) {
      if (userLoggedIn === false) {
        toast({
          title: `Uh oh! You're not logged in!`,
          description: 'Please log in to perform this action.',
          action: (
            <Link href="/login">
              <ToastAction altText="Try again">Sign In</ToastAction>
            </Link>
          ),
        });
        return;
      } else if (currentUser?.emailVerified === false) {
        toast({
          title: `Uh oh! You're not verified!`,
          description: 'Please verify your email to perform this action.',
          action: (
            <Link href="/profile">
              <ToastAction altText="Try again">Profile</ToastAction>
            </Link>
          ),
        });
        return;
      }
    }

    setCurrentStep(0);
    methods.reset();
    setOpen((prev) => !prev);
  };

  return (
    <Dialog open={open} onOpenChange={toggleDialog}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-2xl w-full">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DialogFormStep
              key={currentStep}
              title={steps[currentStep].title}
              description={steps[currentStep].description}
              StepContent={steps[currentStep].content}
            />
          </form>
        </FormProvider>
        <DialogFooter>
          <div className="flex items-center justify-end gap-4">
            <DialogDescription>
              Step {currentStep + 1} of {steps.length}
            </DialogDescription>
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button onClick={handleNext}>{currentStep === steps.length - 1 ? 'Submit' : 'Next'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
