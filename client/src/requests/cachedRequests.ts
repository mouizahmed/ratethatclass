import { cache } from 'react';
import { getCourseByCourseTag, getDepartmentsByUniversityId, getUniversity } from '@/requests/getRequests';

// Server pages call these from both generateMetadata and the page itself; cache() dedupes them per request
export const getUniversityCached = cache(getUniversity);
export const getDepartmentsCached = cache((universityId: string) => getDepartmentsByUniversityId(universityId));
export const getCourseByCourseTagCached = cache(getCourseByCourseTag);
