import { Rating } from '@/types/review';

export const checkColor = (color: number) => {
  if (color == 0) {
    return 'bg-gray-600';
  } else if (color <= 2) {
    return 'bg-red-600';
  } else if (color > 2 && color < 4) {
    return 'bg-yellow-600';
  } else {
    return 'bg-green-600';
  }
};

export const ratingItem = (rating: Rating, decimals: number) => {
  return (
    <div className="flex items-center gap-2 p-1">
      <div
        className={`${checkColor(
          rating.value
        )} flex items-center justify-center w-8 h-8 rounded-lg leading-7 font-semibold text-white`}
      >
        {Number(rating.value).toFixed(decimals)}
      </div>
      {rating.label}
    </div>
  );
};
