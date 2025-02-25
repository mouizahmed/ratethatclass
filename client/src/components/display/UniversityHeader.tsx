'use client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { University } from '@/types/university';
import Image from 'next/image';

export function UniversityHeader({ university }: { university: University }) {
  return (
    <div className="w-full max-w-3xl">
      <Card>
        <CardHeader className="flex items-center">
          <Image src={university.university_logo} width={100} height={100} alt={university?.university_name} />
          <CardTitle>{university?.university_name}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
