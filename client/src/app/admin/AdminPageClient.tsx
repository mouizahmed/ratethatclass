'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/Spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Report, ReportStatus, ReviewReportDetails } from '@/types/report';
import { ReviewReportCard } from '@/components/display/ReviewReportCard';
import { CourseReportCard } from '@/components/display/CourseReportCard';
import { getReports, getBannedUsers, getAdmins } from '@/requests/getAuthenticatedRequests';
import { banUser, createAdmin } from '@/requests/postRequests';
import { dismissReport } from '@/requests/patchRequests';
import {
  deleteReviewReport,
  deleteCourseReport,
  deleteDepartmentReport,
  deleteProfessorReport,
  deleteAdmin,
} from '@/requests/deleteRequests';
import { toastUtils } from '@/lib/toast-utils';
import { BannedUserCard } from '@/components/display/BannedUserCard';
import { unbanUser } from '@/requests/patchRequests';
import { BannedUser } from '@/types/bannedUser';
import { AdminUser } from '@/types/admin';
import { AdminCardList } from '@/components/display/AdminCardList';
import { AdminCreateDialog } from '@/components/display/AdminCreateDialog';
import { AdminDeleteDialog } from '@/components/display/AdminDeleteDialog';
import { BanUserDialog } from '@/components/dialogs/BanUserDialog';

export default function AdminPageClient() {
  const { userLoggedIn, loading, isAdmin, isOwner, currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'course' | 'review'>('course');
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loadingBannedUsers, setLoadingBannedUsers] = useState(false);
  const [bannedUsersPage, setBannedUsersPage] = useState(1);
  const [activeMainTab, setActiveMainTab] = useState<'reports' | 'banned' | 'admins'>('reports');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [generatedAdmin, setGeneratedAdmin] = useState<{ email: string; password: string } | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreReports, setHasMoreReports] = useState(true);
  const [hasMoreBannedUsers, setHasMoreBannedUsers] = useState(true);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [userToBan, setUserToBan] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !userLoggedIn) {
      redirect('/login');
    }
    if (!loading && userLoggedIn && !isAdmin && !isOwner) {
      redirect('/');
    }
  }, [userLoggedIn, loading, isAdmin, isOwner]);

  const fetchReports = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoadingReports(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const response = await getReports(page, 10, activeTab, 'report_date', 'desc', statusFilter);
      if (append) {
        setReports((prev) => [...prev, ...response.data]);
      } else {
        setReports(response.data);
      }
      setHasMoreReports(
        response.meta.current_page !== undefined &&
          response.meta.total_pages !== undefined &&
          response.meta.current_page < response.meta.total_pages
      );
    } catch (error) {
      console.log('Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
      setIsLoadingMore(false);
    }
  };

  const fetchBannedUsers = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoadingBannedUsers(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const response = await getBannedUsers(page, 10);
      if (append) {
        setBannedUsers((prev) => [...prev, ...response.data]);
      } else {
        setBannedUsers(response.data);
      }
      setHasMoreBannedUsers(response.meta.current_page < response.meta.total_pages);
    } catch (error) {
      console.log('Error fetching banned users:', error);
      toastUtils.error('Failed to fetch banned users', (error as Error).message);
    } finally {
      setLoadingBannedUsers(false);
      setIsLoadingMore(false);
    }
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await getAdmins();
      setAdminUsers(response.data);
    } catch (error) {
      console.log('Error fetching admin users:', error);
      toastUtils.error('Failed to fetch admin users', (error as Error).message);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async () => {
    setCreatingAdmin(true);
    try {
      const res = await createAdmin();
      setGeneratedAdmin(res.data);
      setShowAdminDialog(true);
      await fetchAdmins();
    } catch (error) {
      toastUtils.error('Failed to create admin', (error as Error).message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const loadMoreReports = async () => {
    if (isLoadingMore) return;
    if (activeMainTab === 'reports' && hasMoreReports) {
      await fetchReports(currentPage + 1, true);
      setCurrentPage((prev) => prev + 1);
    } else if (activeMainTab === 'banned' && hasMoreBannedUsers) {
      await fetchBannedUsers(bannedUsersPage + 1, true);
      setBannedUsersPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (userLoggedIn) {
      if (activeMainTab === 'reports') {
        fetchReports(1);
        setCurrentPage(1);
      } else if (activeMainTab === 'banned') {
        fetchBannedUsers(1);
        setBannedUsersPage(1);
      } else if (activeMainTab === 'admins') {
        fetchAdmins();
      }
    }
  }, [userLoggedIn, activeMainTab, activeTab, statusFilter]);

  const handleRemoveProfessor = async (reportId: string) => {
    try {
      await deleteProfessorReport(reportId);
      toastUtils.success('Professor deleted successfully');
      await fetchReports();
    } catch (error) {
      console.log('Failed to delete professor:', error);
      toastUtils.error('Failed to delete professor', (error as Error).message);
    }
  };

  const handleRemoveCourse = async (reportId: string) => {
    try {
      await deleteCourseReport(reportId);
      toastUtils.success('Course deleted successfully');
      await fetchReports();
    } catch (error) {
      console.log('Failed to delete course:', error);
      toastUtils.error('Failed to delete course', (error as Error).message);
    }
  };

  const handleRemoveDepartment = async (reportId: string) => {
    try {
      await deleteDepartmentReport(reportId);
      toastUtils.success('Department deleted successfully');
      await fetchReports();
    } catch (error) {
      console.log('Failed to delete department:', error);
      toastUtils.error('Failed to delete department', (error as Error).message);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await dismissReport(reportId);
      toastUtils.success('Report dismissed successfully');
      await fetchReports();
    } catch (error) {
      console.log('Failed to dismiss report:', error);
      toastUtils.error('Failed to dismiss report', (error as Error).message);
    }
  };

  const handleRemoveReview = async (reportId: string) => {
    try {
      await deleteReviewReport(reportId);
      toastUtils.success('Review deleted successfully');
      await fetchReports();
    } catch (error) {
      console.log('Failed to delete review:', error);
      toastUtils.error('Failed to delete review', (error as Error).message);
    }
  };

  const handleBanUser = async (userId: string) => {
    setUserToBan(userId);
    setShowBanDialog(true);
  };

  const confirmBanUser = async (reason: string) => {
    if (!userToBan) return;
    try {
      await banUser(userToBan, reason);
      toastUtils.success('User banned successfully');
      await fetchReports();
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

  const handleDeleteAdmin = async (adminId: string) => {
    setDeletingAdminId(adminId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!deletingAdminId) return;
    try {
      await deleteAdmin(deletingAdminId);
      toastUtils.success('Admin deleted successfully');
      await fetchAdmins();
    } catch (error) {
      toastUtils.error('Failed to delete admin', (error as Error).message);
    } finally {
      setShowDeleteDialog(false);
      setDeletingAdminId(null);
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
          onValueChange={(value) => setActiveMainTab(value as 'reports' | 'banned' | 'admins')}
        >
          <TabsList className={`grid w-full ${isOwner ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="banned">Banned Users</TabsTrigger>
            {isOwner && <TabsTrigger value="admins">Admin Management</TabsTrigger>}
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
                          <div className="flex justify-center py-4">
                            {hasMoreReports && (
                              <Button onClick={loadMoreReports} disabled={isLoadingMore} className="w-40">
                                {isLoadingMore ? (
                                  <div className="flex items-center gap-2">
                                    <Spinner size="small" />
                                    <span>Loading...</span>
                                  </div>
                                ) : (
                                  'Load More'
                                )}
                              </Button>
                            )}
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
                          <div className="flex justify-center py-4">
                            {hasMoreReports && (
                              <Button onClick={loadMoreReports} disabled={isLoadingMore} className="w-40">
                                {isLoadingMore ? (
                                  <div className="flex items-center gap-2">
                                    <Spinner size="small" />
                                    <span>Loading...</span>
                                  </div>
                                ) : (
                                  'Load More'
                                )}
                              </Button>
                            )}
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
                      <div className="flex justify-center py-4">
                        {hasMoreBannedUsers && (
                          <Button onClick={loadMoreReports} disabled={isLoadingMore} className="w-40">
                            {isLoadingMore ? (
                              <div className="flex items-center gap-2">
                                <Spinner size="small" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-sm">No banned users to display</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isOwner && (
            <TabsContent value="admins">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Admin Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">{adminUsers.length}/5 admin accounts</span>
                    </div>
                    <Button
                      onClick={handleCreateAdmin}
                      className="w-full sm:w-auto"
                      disabled={creatingAdmin || adminUsers.length >= 5}
                    >
                      {creatingAdmin ? <Spinner size="small" /> : 'Generate New Admin Account'}
                    </Button>
                    {loadingAdmins ? (
                      <div className="flex justify-center py-4">
                        <Spinner />
                      </div>
                    ) : adminUsers.length > 0 ? (
                      <AdminCardList adminUsers={adminUsers} onDelete={handleDeleteAdmin} />
                    ) : (
                      <div className="text-muted-foreground text-sm">No admin accounts to display</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <AdminCreateDialog
                open={showAdminDialog}
                onOpenChange={setShowAdminDialog}
                generatedAdmin={generatedAdmin}
                onClose={() => setShowAdminDialog(false)}
              />
              <AdminDeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={confirmDeleteAdmin}
                onCancel={() => setShowDeleteDialog(false)}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
      <BanUserDialog
        userId={userToBan || ''}
        open={showBanDialog}
        onOpenChange={setShowBanDialog}
        onConfirm={confirmBanUser}
      />
    </div>
  );
}
