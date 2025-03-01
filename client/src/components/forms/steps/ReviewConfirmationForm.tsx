'use client';
import React from 'react';
import { ReviewCard } from '../../display/ReviewCard';
import { useFormContext } from 'react-hook-form';
import { Review, Vote } from '@/types/review';
import { getCurrentSQLDate } from '@/lib/utils';

export default function ReviewConfirmationForm() {
  const form = useFormContext();
  const formValues = form.getValues();

  const review: Review = {
    professor_name: formValues.reviewMetadataStep.professorName,
    grade: formValues.reviewMetadataStep.grade,
    delivery_method: formValues.reviewMetadataStep.deliveryMethod,
    workload: formValues.reviewMetadataStep.workload,
    textbook_use: formValues.reviewMetadataStep.textbookUse,
    evaluation_methods: Object.keys(formValues.reviewMetadataStep.evaluationMethods),
    overall_score: formValues.reviewRatingsStep.overallScore,
    easy_score: formValues.reviewRatingsStep.easyScore,
    interest_score: formValues.reviewRatingsStep.interestScore,
    useful_score: formValues.reviewRatingsStep.usefulScore,
    term_taken: formValues.reviewMetadataStep.termTaken,
    year_taken: formValues.reviewMetadataStep.yearTaken,
    course_comments: formValues.reviewCommentsStep.courseComments,
    professor_comments: formValues.reviewCommentsStep.professorComments,
    advice_comments: formValues.reviewCommentsStep.adviceComments,
    date_uploaded: getCurrentSQLDate(),
    vote: Vote.up,
  };
  return (
    <div className="">
      <div className="grid gap-4 py-4">
        <ReviewCard review={review} preview={true} />
      </div>
    </div>
  );
}
