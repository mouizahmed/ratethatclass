/**
 * Safely encodes a course ID for use in URLs
 * @param courseId The course ID to encode
 * @returns The encoded course ID safe for use in URLs
 */
export function encodeCourseId(courseId: string): string {
  // First, normalize the string by trimming and converting to lowercase
  const normalized = courseId.trim().toLowerCase();

  // Replace spaces and special characters with underscores
  // This regex matches any character that is not alphanumeric or underscore
  return normalized.replace(/[^a-z0-9_]/g, '_');
}

/**
 * Safely decodes a course ID from a URL
 * @param encodedCourseId The encoded course ID from the URL
 * @returns The decoded course ID
 */
export function decodeCourseId(encodedCourseId: string): string {
  // Replace underscores with spaces
  return encodedCourseId.replace(/_/g, ' ');
}
