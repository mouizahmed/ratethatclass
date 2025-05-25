// Next.js Page Props
export interface UniversityPageProps {
  params: Promise<{
    universityTag: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface CoursePageProps {
  params: Promise<{
    universityTag: string;
    courseID: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface DepartmentPageProps {
  params: Promise<{
    universityTag: string;
    departmentName: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
