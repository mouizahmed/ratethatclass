import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import React, { useState } from 'react';
import { Dropdown } from '../../common/Dropdown';
import { Course } from '@/types/university';

export function CourseForm({
  departmentList,
  courseList,
}: {
  departmentList: Record<string, string>;
  courseList: Course[];
}) {
  const form = useFormContext();

  console.log(courseList);

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
              <Input
                id="courseTag"
                {...form.register('courseStep.courseTag', {
                  validate: (value) =>
                    !courseList.find((course) => course.course_tag === value) || 'This course tag already exists',
                })}
              />
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
              {form.watch('courseStep.newDepartment') ? (
                <Input id="name" {...form.register('courseStep.departmentName')} />
              ) : (
                <Dropdown
                  data={departmentList}
                  placeholder={'Select Department'}
                  value={form.watch('courseStep.departmentName')}
                  setValue={(val) => form.setValue('courseStep.departmentName', val)}
                  initialValue={''}
                  returnType="value"
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="courseStep.newDepartment"
          render={({ field: { value, onChange } }) => (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                onChange(!value);
                form.setValue('courseStep.departmentName', '');
              }}
              className="mt-[-10px] inline-block text-sm underline-offset-4 hover:underline"
            >
              {value ? `Return to List` : `Add Department`}
            </a>
          )}
        />
      </div>
    </div>
  );
}
