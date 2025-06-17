import React from 'react';
import { Report, CourseReportDetails } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Trash2, X, AlertCircle } from 'lucide-react';

interface CourseReportCardProps {
  report: Report;
  onRemoveCourse?: () => void;
  onRemoveDepartment?: () => void;
  onDismiss?: () => void;
}

export function CourseReportCard({ report, onRemoveCourse, onRemoveDepartment, onDismiss }: CourseReportCardProps) {
  // Ensure we're dealing with a course report
  if (report.entity_type !== 'course') {
    return null;
  }

  const courseDetails = report.entity_details as CourseReportDetails | null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Report by {report.user_id}</CardTitle>
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

        <div className="space-y-2">
          <h4 className="font-medium">Course Details:</h4>
          {courseDetails ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Course:</p>
                <p className="text-muted-foreground">
                  {courseDetails.course_name} ({courseDetails.course_tag})
                </p>
              </div>
              <div>
                <p className="font-medium">Department:</p>
                <p className="text-muted-foreground">
                  {courseDetails.department_name} (ID: {courseDetails.department_id})
                </p>
              </div>
              <div>
                <p className="font-medium">University:</p>
                <p className="text-muted-foreground">{courseDetails.university_name}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {report.status === 'resolved' ? (
                <p>This course has been removed from the system.</p>
              ) : (
                <p>Course details are not available.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {report.status === 'pending' && (
          <>
            <Button variant="destructive" size="sm" onClick={onRemoveCourse}>
              <Trash2 className="mr-2 h-4 w-4" />
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
