export function encodeCourseId(courseId: string): string {
  const normalized = courseId.trim().toLowerCase();

  return normalized.replace(/[^a-z0-9_]/g, '_');
}

export function decodeCourseId(encodedCourseId: string): string {
  return encodedCourseId.replace(/_/g, ' ');
}

export function createDepartmentSlug(departmentName: string): string {
  return (
    departmentName
      .toLowerCase()
      // Remove text in parentheses
      .replace(/\([^)]*\)/g, '')
      // Replace special characters and spaces with dashes
      .replace(/[^a-z0-9]+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '')
      // Replace multiple dashes with single dash
      .replace(/-+/g, '-')
  );
}
