import { Course, Review, Evaluation, Grade, Workload, Textbook } from '../types';

export class InputValidator {
  private static isValidText(text: string): boolean {
    // Only allow letters, numbers, and spaces
    return /^[a-zA-Z0-9\s]*$/.test(text);
  }

  private static validateTextInput(value: string | undefined, fieldName: string) {
    if (!value?.trim()) {
      throw new Error(`${fieldName} is required`);
    }
    if (!this.isValidText(value)) {
      throw new Error(`${fieldName} can only contain letters, numbers, and spaces`);
    }
  }

  static validateUniversityRequest(name: string) {
    this.validateTextInput(name, 'University name');
  }

  static validateCourseData(courseData: Course) {
    if (!courseData) {
      throw new Error('Course data is required');
    }

    this.validateTextInput(courseData.course_tag, 'Course tag');
    this.validateTextInput(courseData.course_name, 'Course name');
    this.validateTextInput(courseData.department_name, 'Department name');
  }

  static validateReviewData(reviewData: Review) {
    if (!reviewData) {
      throw new Error('Review data is required');
    }

    if (!reviewData.grade || !Object.values(Grade).includes(reviewData.grade)) {
      throw new Error('Valid grade is required');
    }

    if (!reviewData.delivery_method) {
      throw new Error('Delivery method is required');
    }

    if (!reviewData.workload || !Object.values(Workload).includes(reviewData.workload)) {
      throw new Error('Valid workload is required');
    }

    if (!reviewData.textbook_use || !Object.values(Textbook).includes(reviewData.textbook_use)) {
      throw new Error('Valid textbook use is required');
    }

    if (!reviewData.evaluation_methods || !Array.isArray(reviewData.evaluation_methods)) {
      throw new Error('Evaluation methods must be an array');
    }

    reviewData.evaluation_methods.forEach((method) => {
      if (!Object.values(Evaluation).includes(method)) {
        throw new Error(`Invalid evaluation method: ${method}`);
      }
    });

    if (typeof reviewData.overall_score !== 'number' || reviewData.overall_score < 1 || reviewData.overall_score > 5) {
      throw new Error('Overall score must be a number between 1 and 5');
    }

    if (typeof reviewData.easy_score !== 'number' || reviewData.easy_score < 1 || reviewData.easy_score > 5) {
      throw new Error('Easy score must be a number between 1 and 5');
    }

    if (
      typeof reviewData.interest_score !== 'number' ||
      reviewData.interest_score < 1 ||
      reviewData.interest_score > 5
    ) {
      throw new Error('Interest score must be a number between 1 and 5');
    }

    if (typeof reviewData.useful_score !== 'number' || reviewData.useful_score < 1 || reviewData.useful_score > 5) {
      throw new Error('Useful score must be a number between 1 and 5');
    }

    this.validateTextInput(reviewData.term_taken, 'Term taken');

    if (!reviewData.year_taken || reviewData.year_taken < 1900 || reviewData.year_taken > new Date().getFullYear()) {
      throw new Error('Valid year taken is required');
    }

    this.validateTextInput(reviewData.course_comments, 'Course comments');
    this.validateTextInput(reviewData.professor_comments, 'Professor comments');
    this.validateTextInput(reviewData.advice_comments, 'Advice comments');
    this.validateTextInput(reviewData.professor_name, 'Professor name');
  }

  static validateCourseAndReview(courseData: Course, reviewData: Review) {
    this.validateCourseData(courseData);
    this.validateReviewData(reviewData);
  }
}
