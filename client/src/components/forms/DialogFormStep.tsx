import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DialogDescription, DialogTitle } from '../ui/dialog';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DialogFormStepProps {
  title: string;
  description: string;
  StepContent: React.ComponentType<{ stepData: any }>;
}

const DialogFormStep: React.FC<DialogFormStepProps> = ({ title, description, StepContent }) => {
  const { getValues } = useFormContext();

  return (
    <div>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <StepContent stepData={getValues()} />
    </div>
  );
};

export default DialogFormStep;
