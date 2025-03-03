import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import React from 'react';
import { Textarea } from '../../ui/textarea';

export function ReviewCommentsForm() {
  const form = useFormContext();

  return (
    <div className="grid gap-4 py-4">
      <div>
        <FormField
          control={form.control}
          name="reviewCommentsStep.courseComments"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Course Comments*</FormLabel>
              <Textarea id={field.name} {...form.register(field.name)} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={form.control}
          name="reviewCommentsStep.professorComments"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Professor Comments</FormLabel>
              <Textarea id={field.name} {...form.register(field.name)} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={form.control}
          name="reviewCommentsStep.adviceComments"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Advice</FormLabel>
              <Textarea id={field.name} {...form.register(field.name)} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
