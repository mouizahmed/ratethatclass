'use client';

import React, { useState, useEffect } from 'react';
import { University } from '@/types/university';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';

interface UniversityCarouselProps {
  universities: University[];
}

export default function UniversityCarousel({ universities }: UniversityCarouselProps) {
  const [itemsPerPage, setItemsPerPage] = useState(3); // Default to mobile size

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth > 788 ? 6 : 3);
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chunk = (list: University[]) => {
    const chunks: University[][] = [];
    for (let i = 0; i < list.length; i += itemsPerPage) {
      chunks.push(list.slice(i, i + itemsPerPage));
    }
    return chunks;
  };

  const chunkedUniversities = React.useMemo(() => chunk(universities), [universities, itemsPerPage]);

  // Server-side rendering view (for SEO)
  const seoList = (
    <div className="hidden">
      {universities.map((university, index) => (
        <Link key={index} href={`/${university.university_name.replaceAll(' ', '_').toLowerCase()}`}>
          <div>
            <img src={university.university_logo} alt={university.university_name} />
            <div>{university.university_name}</div>
            <div>{university.review_num} reviews</div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Hidden SEO-friendly content */}
      {seoList}
      
      {/* Visual carousel */}
      <div className="w-full max-w-3xl">
        <Carousel
          className="w-full"
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
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
                          <p className="scroll-m-20 text-md font-semibold tracking-tight">{item.review_num} reviews</p>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center mt-4">
            <CarouselPrevious className="static mx-2 transform-none" />
            <CarouselNext className="static mx-2 transform-none" />
          </div>
        </Carousel>
      </div>
    </>
  );
}
