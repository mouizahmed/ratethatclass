import Script from 'next/script';
import React from 'react';
import { AdsenseProps } from '@/types/components';

const AdSense = ({ pId }: AdsenseProps) => {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default AdSense;
