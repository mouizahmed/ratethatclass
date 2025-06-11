import React from 'react';
import { Report, ReviewReportDetails } from '@/types/report';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertCircle, Ban, Trash2, X } from 'lucide-react';

interface ReviewReportCardProps {
  report: Report;
  onRemoveReview?: () => void;
  onBanUser?: () => void;
  onRemoveCourse?: () => void;
  onRemoveDepartment?: () => void;
  onRemoveProfessor?: () => void;
  onDismiss?: () => void;
}

export function ReviewReportCard({
  report,
  onRemoveReview,
  onBanUser,
  onRemoveCourse,
  onRemoveDepartment,
  onRemoveProfessor,
  onDismiss,
}: ReviewReportCardProps) {
  if (report.entity_type !== 'review') {
    return null;
  }

  const reviewDetails = report.entity_details as ReviewReportDetails | null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Report by {report.display_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Reported on {new Date(report.report_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">Report ID: {report.report_id}</p>
            <p className="text-sm text-muted-foreground">Entity ID: {report.entity_id}</p>
          </div>
          <StatusBadge status={report.status} className="ml-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Report Reason:</h4>
          <p className="text-sm text-muted-foreground">{report.report_reason}</p>
        </div>

        {reviewDetails ? (
          <>
            <div className="space-y-2">
              <h4 className="font-medium">Review Details:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Course:</p>
                  <p className="text-muted-foreground">
                    {reviewDetails.course_name} ({reviewDetails.course_tag})
                  </p>
                </div>
                <div>
                  <p className="font-medium">Professor:</p>
                  <p className="text-muted-foreground">
                    {reviewDetails.professor_name} (ID: {reviewDetails.professor_id})
                  </p>
                </div>
                <div>
                  <p className="font-medium">Department:</p>
                  <p className="text-muted-foreground">{reviewDetails.department_name}</p>
                </div>
                <div>
                  <p className="font-medium">University:</p>
                  <p className="text-muted-foreground">{reviewDetails.university_name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Review Content:</h4>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Course Comments:</p>
                <p className="text-muted-foreground">{reviewDetails.course_comments}</p>
                <p className="font-medium">Professor Comments:</p>
                <p className="text-muted-foreground">{reviewDetails.professor_comments}</p>
                <p className="font-medium">Advice Comments:</p>
                <p className="text-muted-foreground">{reviewDetails.advice_comments}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Reviewer Information:</h4>
              <div className="text-sm">
                <p>Name: {reviewDetails.reviewer_display_name}</p>
                <p>Email: {reviewDetails.reviewer_email}</p>
                <p>ID: {reviewDetails.reviewer_id}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            {report.status === 'resolved' ? (
              <p>This review has been removed from the system.</p>
            ) : (
              <p>Review details are not available.</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {report.status === 'pending' && (
          <>
            <Button variant="destructive" size="sm" onClick={onRemoveReview}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Review
            </Button>
            <Button variant="destructive" size="sm" onClick={onBanUser}>
              <Ban className="mr-2 h-4 w-4" />
              Ban User
            </Button>
            <Button variant="destructive" size="sm" onClick={onRemoveProfessor}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Remove Professor
            </Button>
            <Button variant="destructive" size="sm" onClick={onRemoveCourse}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Remove Course
            </Button>
            <Button variant="destructive" size="sm" onClick={onRemoveDepartment}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Remove Department
            </Button>
            <Button variant="secondary" size="sm" onClick={onDismiss}>
              <X className="mr-2 h-4 w-4" />
              Dismiss
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
