'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { BreadcrumbInfo } from '@/types';
import React from 'react';

export function BreadCrumb({ links }: { links: BreadcrumbInfo[] }) {
  return (
    <div className="w-full max-w-3xl">
      <Breadcrumb>
        <BreadcrumbList>
          {links.map((item: BreadcrumbInfo, index: number) => (
            <React.Fragment key={item.label}>
              <BreadcrumbItem>
                <BreadcrumbLink href={item.link ?? ''}>{item.label}</BreadcrumbLink>
              </BreadcrumbItem>
              {index < links.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
