export function encodeCourseId(courseId: string): string {
  const normalized = courseId.trim().toLowerCase();

  // Replace special characters with URL-safe versions
  return normalized
    .replace(/\//g, '-') // Replace / with -
    .replace(/[^a-z0-9\-_]/g, '_'); // Replace other special chars with _
}

export function decodeCourseId(encodedCourseId: string): string {
  return encodedCourseId
    .replace(/(?<=\w)-(?=\w)/g, '/') // Restore / from - only between word characters
    .replace(/_/g, ' '); // Replace remaining _ with spaces
}

export function createDepartmentSlug(departmentName: string): string {
  return (
    departmentName
      .toLowerCase()
      // Remove just the parentheses but keep the text inside
      .replace(/[()]/g, ' ')
      // Replace special characters and spaces with dashes
      .replace(/[^a-z0-9]+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '')
      // Replace multiple dashes with single dash
      .replace(/-+/g, '-')
  );
}
