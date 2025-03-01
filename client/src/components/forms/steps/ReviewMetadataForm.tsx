'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import {
  deliveryOptions,
  evaluationOptions,
  gradeOptions,
  termOptions,
  textbookOptions,
  workloadOptions,
  yearOptions,
} from '@/lib/constants';
import { Dropdown } from '../../common/Dropdown';
import { MultipleSelector } from '../../ui/multipleselector';

export function ReviewMetadataForm({ professorOptions }: { professorOptions?: Record<string, string> }) {
  const form = useFormContext();

  return (
    <div className="grid gap-4 py-4">
      <FormField
        control={form.control}
        name="reviewMetadataStep.professorName"
        render={({ field: { value, onChange } }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Professor Name</FormLabel>
            {form.getValues().courseStep ? (
              <Input id="name" {...form.register('reviewMetadataStep.professorName')} />
            ) : form.watch('reviewMetadataStep.newProfessor') ? (
              <Input id="name" {...form.register('reviewMetadataStep.professorName')} />
            ) : (
              <Dropdown
                data={professorOptions ?? {}}
                placeholder="Select Professor"
                value={value}
                setValue={onChange}
                initialValue={''}
                returnType="value"
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {!form.getValues().courseStep && (
        <FormField
          control={form.control}
          name="reviewMetadataStep.newProfessor"
          render={({ field: { value, onChange } }) => (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                onChange(!value);
                form.setValue('reviewMetadataStep.professorName', '');
              }}
              className="mt-[-10px] inline-block text-sm underline-offset-4 hover:underline"
            >
              {value ? `Return to List` : `Add Professor`}
            </a>
          )}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="reviewMetadataStep.termTaken"
          render={({ field: { onChange, value } }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Term</FormLabel>
              <Dropdown
                data={termOptions}
                placeholder={'Select Term'}
                value={value}
                setValue={onChange}
                initialValue={''}
                returnType="key"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reviewMetadataStep.yearTaken"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Year</FormLabel>
              <Dropdown
                data={yearOptions}
                placeholder={'Select Year'}
                value={value}
                setValue={onChange}
                initialValue={''}
                returnType="key"
              />

              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="reviewMetadataStep.deliveryMethod"
        render={({ field: { value, onChange } }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Delivery Method</FormLabel>
            <Dropdown
              data={deliveryOptions}
              placeholder={'Select Delivery Method'}
              value={value}
              setValue={onChange}
              initialValue={''}
              returnType="key"
            />

            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="reviewMetadataStep.grade"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Grade</FormLabel>
              <Dropdown
                data={gradeOptions}
                placeholder={'Select a Grade'}
                value={value}
                setValue={onChange}
                initialValue={''}
                returnType="key"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reviewMetadataStep.textbookUse"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Textbook Use</FormLabel>
              <Dropdown
                data={textbookOptions}
                placeholder={'Select an Option'}
                value={value}
                setValue={onChange}
                initialValue={''}
                returnType="key"
              />

              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="reviewMetadataStep.evaluationMethods"
        render={({ field: { value, onChange } }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Evaluation Methods</FormLabel>
            <MultipleSelector
              data={evaluationOptions}
              placeholder="Select Evaluation Methods"
              itemType="Evaluation Method"
              value={value || {}}
              setValue={onChange}
            />

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reviewMetadataStep.workload"
        render={({ field: { value, onChange } }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Workload</FormLabel>
            <Dropdown
              data={workloadOptions}
              placeholder={'Select workload'}
              value={value}
              setValue={onChange}
              initialValue={''}
              returnType="key"
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
