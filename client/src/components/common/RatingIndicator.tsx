'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RatingIndicatorProps {
    value: number | null;
    onChange: (value: number) => void;
}

export function RatingIndicator({ value, onChange }: RatingIndicatorProps) {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    const segments = [
        { label: 'Awful', color: 'bg-[#FFB5B5]' },
        { label: 'Bad', color: 'bg-[#FFCBA4]' },
        { label: 'Okay', color: 'bg-[#FFE5A4]' },
        { label: 'Good', color: 'bg-[#D8E5BE]' },
        { label: 'Awesome', color: 'bg-[#C2E0D3]' },
    ];

    return (
        <div className={cn('space-y-3 w-full')}>
            <div className="relative">
                <div className="flex h-8 gap-px rounded-full overflow-hidden">
                    {segments.map((segment, index) => (
                        <button
                            key={index}
                            type="button"
                            className={cn(
                                segment.color,
                                'flex-1 transition-opacity duration-200',
                                hoveredIndex === null && value === null
                                    ? 'opacity-30'
                                    : hoveredIndex !== null &&
                                      index < hoveredIndex + 1
                                    ? 'opacity-100'
                                    : value !== null && index < value
                                    ? 'opacity-100'
                                    : 'opacity-30'
                            )}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => onChange(index + 1)} // ensures a 1-based rating
                            aria-label={segment.label}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>1 - Awful</span>
                    <span>5 - Awesome</span>
                </div>
                {hoveredIndex !== null && (
                    <div
                        className="absolute left-1/2 -translate-x-1/2 -top-8 bg-popover text-popover-foreground px-2 py-1 rounded text-sm whitespace-nowrap"
                        style={{
                            transition: 'transform 0.2s ease-in-out',
                            transform: `translateX(${
                                ((hoveredIndex - 2) * 100) / 2
                            }%)`,
                        }}
                    >
                        {segments[hoveredIndex].label} - {hoveredIndex + 1}
                    </div>
                )}
            </div>
        </div>
    );
}
