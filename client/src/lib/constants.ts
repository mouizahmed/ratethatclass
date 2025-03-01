export const termOptions: Record<string, string> = {
  Fall: 'Fall',
  Winter: 'Winter',
  Spring: 'Spring',
  Summer: 'Summer',
  Year: 'Year',
};
export const deliveryOptions: Record<string, string> = {
  'In-Person': 'In-Person',
  Online: 'Online',
  Hybrid: 'Hybrid',
};

export const currentYear = new Date().getFullYear();

export const yearOptions: Record<string, string> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i;
    return [`${year}`, `${year}`];
  })
);

export const gradeOptions: Record<string, string> = {
  'A+': 'A+',
  A: 'A',
  'A-': 'A-',
  'B+': 'B+',
  B: 'B',
  'C+': 'C+',
  C: 'C',
  'C-': 'C-',
  'D+': 'D+',
  D: 'D',
  'D-': 'D-',
  F: 'F',
  'Drop/Withrawal': 'Drop/Withrawal',
  Incomplete: 'Incomplete',
  'Not sure yet': 'Not sure yet',
  'Rather not say': 'Rather not say',
  'Audit/No Grade': 'Audit/No Grade',
  Pass: 'Pass',
  Fail: 'Fail',
};

export const textbookOptions: Record<string, string> = {
  Yes: 'Yes',
  No: 'No',
  Optional: 'Optional',
};

export const workloadOptions: Record<string, string> = {
  'Very Light': 'Very Light',
  Light: 'Light',
  Moderate: 'Moderate',
  Heavy: 'Heavy',
  'Very Heavy': 'Very Heavy',
};

export const courseSortingOptions: Record<string, string> = {
  review_num: 'Review Count',
  overall_score: 'Overall',
  easy_score: 'Easiness',
  useful_score: 'Usefulness',
};

export const sortingOptions: Record<string, string> = {
  votes: 'Votes',
  overall_score: 'Overall',
  easy_score: 'Easiness',
  useful_score: 'Usefulness',
};

export const evaluationOptions: Record<string, string> = {
  'Attendance Heavy': 'Attendance Heavy',
  'Participation Heavy': 'Participation Heavy',
  'Assignment Heavy': 'Assignment Heavy',
  'Quiz Heavy': 'Quiz Heavy',
  'Essay Heavy': 'Essay Heavy',
  'Project Heavy': 'Project Heavy',
  'Exam Heavy': 'Exam Heavy',
};
