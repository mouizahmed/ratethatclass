import React from 'react';
import { Report, CourseReportDetails } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Building2, Trash2, X, AlertCircle } from 'lucide-react';

interface CourseReportCardProps {
  report: Report;
  onDeleteCourse?: () => void;
  onRemoveDepartmentAndCourse?: () => void;
  onDismiss?: () => void;
}

export function CourseReportCard({
  report,
  onDeleteCourse,
  onRemoveDepartmentAndCourse,
  onDismiss,
}: CourseReportCardProps) {
  // Ensure we're dealing with a course report
  if (report.entity_type !== 'course') {
    return null;
  }

  const courseDetails = report.entity_details as CourseReportDetails;

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

        <div className="space-y-2">
          <h4 className="font-medium">Course Details:</h4>
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="destructive" size="sm" onClick={onDeleteCourse}>
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Course
        </Button>
        <Button variant="destructive" size="sm" onClick={onRemoveDepartmentAndCourse}>
          <AlertCircle className="mr-2 h-4 w-4" />
          Remove Department
        </Button>
        <Button variant="secondary" size="sm" onClick={onDismiss}>
          <X className="mr-2 h-4 w-4" />
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
