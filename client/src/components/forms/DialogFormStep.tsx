import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DialogDescription, DialogTitle } from '../ui/dialog';
import { DialogFormStepProps } from '@/types/components';

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
