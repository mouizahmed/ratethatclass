import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import React, { useState } from 'react';
import { Dropdown } from '../../common/Dropdown';

export function CourseForm({ departmentList }: { departmentList: Record<string, string> }) {
  const form = useFormContext();

  const [newDepartment, setNewDepartment] = useState<boolean>(false);

  return (
    <div className="grid gap-4 py-4">
      <div>
        <FormField
          control={form.control}
          name="courseStep.courseName"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Name</FormLabel>
              <Input id="name" {...form.register('courseStep.courseName')} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={form.control}
          name="courseStep.courseTag"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Course Tag</FormLabel>
              <Input id="name" {...form.register('courseStep.courseTag')} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={form.control}
          name="courseStep.departmentName"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Department Name</FormLabel>
              {newDepartment ? (
                <Input id="name" {...form.register('courseStep.departmentName')} />
              ) : (
                <>
                  <Dropdown
                    data={departmentList}
                    placeholder={'Select Department'}
                    value={value}
                    setValue={onChange}
                    initialValue={''}
                    returnType="value"
                  />
                </>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <a
          href="#"
          onClick={() => {
            setNewDepartment((prev) => !prev);
          }}
          className="mt-[-10px] inline-block text-sm underline-offset-4 hover:underline"
        >
          {newDepartment ? `Return to List` : `Add Department`}
        </a>
      </div>
    </div>
  );
}
