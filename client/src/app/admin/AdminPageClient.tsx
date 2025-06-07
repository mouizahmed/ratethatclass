'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Report, ReportStatus } from '@/types/report';
import { ReviewReportCard } from '@/components/display/ReviewReportCard';
import { CourseReportCard } from '@/components/display/CourseReportCard';
import { getReports } from '@/requests/getRequests';

export default function AdminPageClient() {
  const { userLoggedIn, currentUser, loading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'course' | 'review'>('course');

  useEffect(() => {
    if (!loading && !userLoggedIn) {
      redirect('/login');
    }
  }, [userLoggedIn, loading]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        const response = await getReports(currentPage, 10, activeTab, 'report_date', 'desc', statusFilter);
        setReports(response.data);
        setTotalPages(response.meta.total_pages);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoadingReports(false);
      }
    };

    if (userLoggedIn) {
      fetchReports();
    }
  }, [userLoggedIn, currentPage, activeTab, statusFilter]);

  const handleDeleteReview = async (reportId: string) => {
    // TODO: Implement delete review
    console.log('Delete review', reportId);
  };

  const handleBanUser = async (reportId: string) => {
    // TODO: Implement ban user
    console.log('Ban user', reportId);
  };

  const handleRemoveReviewAndCourse = async (reportId: string) => {
    // TODO: Implement remove review and course
    console.log('Remove review and course', reportId);
  };

  const handleRemoveReviewAndProfessor = async (reportId: string) => {
    // TODO: Implement remove review and professor
    console.log('Remove review and professor', reportId);
  };

  const handleRemoveReviewAndCourseAndDepartment = async (reportId: string) => {
    // TODO: Implement remove review, course and department
    console.log('Remove review, course and department', reportId);
  };

  const handleDeleteCourse = async (reportId: string) => {
    // TODO: Implement delete course
    console.log('Delete course', reportId);
  };

  const handleRemoveDepartmentAndCourse = async (reportId: string) => {
    // TODO: Implement remove department and course
    console.log('Remove department and course', reportId);
  };

  const handleDismiss = async (reportId: string) => {
    // TODO: Implement dismiss report
    console.log('Dismiss report', reportId);
  };

  return (
    <div className="flex flex-col items-center gap-10 p-4 sm:p-8 md:p-20">
      <div className="w-full max-w-3xl">
        <h2 className="flex items-center justify-between gap-1 scroll-m-20 border-b pb-2 text-2xl sm:text-3xl font-semibold tracking-tight first:mt-0">
          Admin Dashboard
          {/* <p className="text-sm text-muted-foreground">Review and manage reported content</p> */}
        </h2>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="banned">Banned Users</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 space-y-4 sm:space-y-0">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs
              value={activeTab}
              className="w-full"
              onValueChange={(value) => setActiveTab(value as 'course' | 'review')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="course">Course Reports</TabsTrigger>
                <TabsTrigger value="review">Review Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="course">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Course Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <Spinner size="large" />
                        </div>
                      ) : loadingReports ? (
                        <div className="flex justify-center py-4">
                          <Spinner />
                        </div>
                      ) : reports.length > 0 ? (
                        <>
                          {reports.map((report) => (
                            <CourseReportCard
                              key={report.report_id}
                              report={report}
                              onDeleteCourse={() => handleDeleteCourse(report.report_id)}
                              onRemoveDepartmentAndCourse={() => handleRemoveDepartmentAndCourse(report.report_id)}
                              onDismiss={() => handleDismiss(report.report_id)}
                            />
                          ))}
                          <div className="flex items-center justify-between mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-2" />
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground text-sm">No {statusFilter} reports to display</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="review">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Review Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <Spinner size="large" />
                        </div>
                      ) : loadingReports ? (
                        <div className="flex justify-center py-4">
                          <Spinner />
                        </div>
                      ) : reports.length > 0 ? (
                        <>
                          {reports.map((report) => (
                            <ReviewReportCard
                              key={report.report_id}
                              report={report}
                              onDeleteReview={() => handleDeleteReview(report.report_id)}
                              onBanUser={() => handleBanUser(report.report_id)}
                              onRemoveReviewAndCourse={() => handleRemoveReviewAndCourse(report.report_id)}
                              onRemoveReviewAndProfessor={() => handleRemoveReviewAndProfessor(report.report_id)}
                              onRemoveReviewAndCourseAndDepartment={() =>
                                handleRemoveReviewAndCourseAndDepartment(report.report_id)
                              }
                              onDismiss={() => handleDismiss(report.report_id)}
                            />
                          ))}
                          <div className="flex items-center justify-between mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-2" />
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground text-sm">No {statusFilter} reports to display</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="banned">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Banned Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {/* Table of banned users will go here */}
                  <div className="text-muted-foreground text-sm">No banned users to display</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
