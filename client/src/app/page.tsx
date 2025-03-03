'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Search from '@/components/common/Search';
import { getUniversities } from '@/requests/getRequests';
import { University } from '@/types/university';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { useAlert } from '@/contexts/alertContext';

export default function Home() {
  const [universityList, setUniversityList] = useState<University[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { addAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const universities = await getUniversities();
        setUniversityList(universities);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        addAlert('destructive', (error as Error).message, 3000);
      }
    };

    fetchData();
  }, [addAlert]);

  const chunk = (list: University[]) => {
    const chunks: University[][] = [];
    let size = 3;
    if (window.innerWidth > 788) size = 6;
    for (let i = 0; i < list.length; i += size) {
      chunks.push(list.slice(i, i + size));
    }
    return chunks;
  };

  const filterSearch = useCallback(
    (university: University) => {
      if (searchValue.length === 0) return true;
      return university.university_name.toLowerCase().includes(searchValue.toLowerCase());
    },
    [searchValue]
  );

  const filteredUniversities = React.useMemo(() => universityList.filter(filterSearch), [universityList, filterSearch]);

  const chunkedUniversities = React.useMemo(() => chunk(filteredUniversities), [filteredUniversities]);

  return (
    <div className="flex flex-col items-center gap-10 p-8 sm:p-20">
      <div className="flex flex-col items-center gap-3">
        <h1 className="scroll-m-20 text-2xl lg:text-3xl font-bold tracking-tight lg:text-5xl">
          Course selection made easy
        </h1>
        <p className="leading-7">Write anonymous reviews about your classes and help others make informed decisions.</p>
      </div>
      <div className="w-full max-w-3xl">
        <Search
          data={universityList}
          valueKey="university_name"
          labelKey="university_name"
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          placeholder="Search universities..."
          emptyMessage="No universities found."
        />
        <div className="flex justify-center">
          <p className="leading-7 text-sm">
            Don&apos;t see your school?{' '}
            <Link href="/university-requests" className="ml-auto inline-block text-sm underline-offset-4 underline">
              Click Here
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        {loading ? (
          <Spinner size="medium" />
        ) : chunkedUniversities.length !== 0 ? (
          <Carousel
            className="w-full max-w-3xl h-[500px]"
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
          >
            <CarouselContent>
              {chunkedUniversities.map((chunk, pageIndex) => (
                <CarouselItem key={pageIndex}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chunk.map((item, index) => (
                      <Link key={index} href={`/${item.university_name.replaceAll(' ', '_').toLowerCase()}`}>
                        <Card className="w-50 h-50 pb-5 hover:bg-zinc-100 cursor-pointer hover:shadow-xl hover:border-zinc-300">
                          <CardContent className="flex items-center justify-center p-4">
                            <Image
                              src={item.university_logo}
                              alt={item.university_name}
                              width={150}
                              height={150}
                              className="w-36 h-36 object-contain"
                            />
                          </CardContent>
                          <CardFooter className="flex flex-col justify-between items-center text-center h-[70px] p-1">
                            {item.university_name}
                            <p className="scroll-m-20 text-md font-semibold tracking-tight">
                              {item.review_num} reviews
                            </p>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="m-5 lg:m-0" />
            <CarouselNext className="m-5 lg:m-0" />
          </Carousel>
        ) : (
          <div className="flex justify-center">
            <p className="leading-7 [&:not(:first-child)]:mt-6">No universities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
