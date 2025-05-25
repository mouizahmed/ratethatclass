export type UserError = {
  message: string;
};

export type SQLDate = `${number}-${number}-${number}`;

export const sortingType = ['Reviews', 'Course Name', 'Overall', 'Easiness', 'Interest', 'Usefulness'] as const;

export type SortingType = (typeof sortingType)[number];
