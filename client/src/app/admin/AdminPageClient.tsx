'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/Spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Report, ReportStatus, ReviewReportDetails } from '@/types/report';
import { ReviewReportCard } from '@/components/display/ReviewReportCard';
import { CourseReportCard } from '@/components/display/CourseReportCard';
import { getReports } from '@/requests/getRequests';
import { banUser } from '@/requests/postRequests';
import { dismissReport } from '@/requests/patchRequests';
import {
  deleteReviewReport,
  deleteCourseReport,
  deleteDepartmentReport,
  deleteProfessorReport,
} from '@/requests/deleteRequests';
import { toastUtils } from '@/lib/toast-utils';
import { BannedUserCard } from '@/components/display/BannedUserCard';
import { getBannedUsers } from '@/requests/getRequests';
import { unbanUser } from '@/requests/patchRequests';
import { BannedUser } from '@/types/bannedUser';

export default function AdminPageClient() {
  const { userLoggedIn, loading, isAdmin, isOwner, currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'course' | 'review'>('course');
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loadingBannedUsers, setLoadingBannedUsers] = useState(false);
  const [bannedUsersPage, setBannedUsersPage] = useState(1);
  const [bannedUsersTotalPages, setBannedUsersTotalPages] = useState(1);
  const [activeMainTab, setActiveMainTab] = useState<'reports' | 'banned'>('reports');

  useEffect(() => {
    if (!loading && !userLoggedIn) {
      redirect('/login');
    }
    if (!loading && userLoggedIn && !isAdmin && !isOwner) {
      redirect('/');
    }
  }, [userLoggedIn, loading, isAdmin, isOwner]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const response = await getReports(currentPage, 10, activeTab, 'report_date', 'desc', statusFilter);
      setReports(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (error) {
      console.log('Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (userLoggedIn) {
      if (activeMainTab === 'reports') {
        fetchReports();
      } else if (activeMainTab === 'banned') {
        fetchBannedUsers();
      }
    }
  }, [userLoggedIn, activeMainTab]);

  useEffect(() => {
    if (userLoggedIn) {
      fetchReports();
    }
  }, [userLoggedIn, currentPage, activeTab, statusFilter]);

  const refreshReports = async () => {
    try {
      const response = await getReports(1, 10, activeTab, 'report_date', 'desc', statusFilter);
      setReports(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (error) {
      console.log('Error refreshing reports:', error);
      toastUtils.error('Failed to refresh reports', (error as Error).message);
    }
  };

  const fetchBannedUsers = async () => {
    setLoadingBannedUsers(true);
    try {
      const response = await getBannedUsers(bannedUsersPage, 10);
      setBannedUsers(response.data);
      setBannedUsersTotalPages(response.meta.total_pages ?? 1);
    } catch (error) {
      console.log('Error fetching banned users:', error);
      toastUtils.error('Failed to fetch banned users', (error as Error).message);
    } finally {
      setLoadingBannedUsers(false);
    }
  };

  const handleRemoveProfessor = async (reportId: string) => {
    try {
      await deleteProfessorReport(reportId);
      toastUtils.success('Professor deleted successfully');
      await refreshReports();
    } catch (error) {
      console.log('Failed to delete professor:', error);
      toastUtils.error('Failed to delete professor', (error as Error).message);
    }
  };

  const handleRemoveCourse = async (reportId: string) => {
    try {
      await deleteCourseReport(reportId);
      toastUtils.success('Course deleted successfully');
      await refreshReports();
    } catch (error) {
      console.log('Failed to delete course:', error);
      toastUtils.error('Failed to delete course', (error as Error).message);
    }
  };

  const handleRemoveDepartment = async (reportId: string) => {
    try {
      await deleteDepartmentReport(reportId);
      toastUtils.success('Department deleted successfully');
      await refreshReports();
    } catch (error) {
      console.log('Failed to delete department:', error);
      toastUtils.error('Failed to delete department', (error as Error).message);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await dismissReport(reportId);
      toastUtils.success('Report dismissed successfully');
      await refreshReports();
    } catch (error) {
      console.log('Failed to dismiss report:', error);
      toastUtils.error('Failed to dismiss report', (error as Error).message);
    }
  };

  const handleRemoveReview = async (reportId: string) => {
    try {
      await deleteReviewReport(reportId);
      toastUtils.success('Review deleted successfully');
      await refreshReports();
    } catch (error) {
      console.log('Failed to delete review:', error);
      toastUtils.error('Failed to delete review', (error as Error).message);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId);
      await refreshReports();
    } catch (error) {
      console.log('Failed to ban user:', error);
      toastUtils.error('Failed to ban user', (error as Error).message);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);
      toastUtils.success('User unbanned successfully');
      await fetchBannedUsers();
    } catch (error) {
      console.log('Failed to unban user:', error);
      toastUtils.error('Failed to unban user', (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10 p-4 sm:p-8 md:p-20">
      <div className="w-full max-w-3xl">
        <h2 className="flex items-center justify-between gap-1 scroll-m-20 border-b pb-2 text-2xl sm:text-3xl font-semibold tracking-tight first:mt-0">
          Admin Dashboard
          {currentUser && <p className="text-sm text-muted-foreground">{currentUser.email}</p>}
        </h2>

        <Tabs
          defaultValue="reports"
          className="w-full"
          onValueChange={(value) => setActiveMainTab(value as 'reports' | 'banned')}
        >
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
                              onRemoveCourse={() => handleRemoveCourse(report.report_id)}
                              onRemoveDepartment={() => handleRemoveDepartment(report.report_id)}
                              onDismiss={() => handleDismissReport(report.report_id)}
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
                              onRemoveReview={() => handleRemoveReview(report.report_id)}
                              onBanUser={
                                report.entity_type === 'review' &&
                                report.entity_details &&
                                'reviewer_id' in report.entity_details
                                  ? () => handleBanUser((report.entity_details as ReviewReportDetails).reviewer_id)
                                  : undefined
                              }
                              onRemoveCourse={() => handleRemoveCourse(report.report_id)}
                              onRemoveProfessor={() => handleRemoveProfessor(report.report_id)}
                              onRemoveDepartment={() => handleRemoveDepartment(report.report_id)}
                              onDismiss={() => handleDismissReport(report.report_id)}
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
                  {loadingBannedUsers ? (
                    <div className="flex justify-center py-4">
                      <Spinner />
                    </div>
                  ) : bannedUsers.length > 0 ? (
                    <>
                      {bannedUsers.map((user) => (
                        <BannedUserCard key={user.user_id} user={user} onUnban={() => handleUnbanUser(user.user_id)} />
                      ))}
                      <div className="flex items-center justify-between mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBannedUsersPage((prev) => Math.max(1, prev - 1))}
                          disabled={bannedUsersPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {bannedUsersPage} of {bannedUsersTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBannedUsersPage((prev) => Math.min(bannedUsersTotalPages, prev + 1))}
                          disabled={bannedUsersPage === bannedUsersTotalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-sm">No banned users to display</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
