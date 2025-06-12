import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async deleteReviewAndResolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      if (!reportId) {
        res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
        return;
      }

      await this.adminService.deleteReviewAndResolveReport(reportId);
      res.status(200).json({
        success: true,
        message: 'Review deleted and report resolved successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      console.log(error);
      if (error.message === 'Review not found' || error.message === 'Report not found') {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
    }
  }

  async deleteProfessorAndResolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      if (!reportId) {
        res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
        return;
      }

      await this.adminService.deleteProfessorAndResolveReport(reportId);
      res.status(200).json({
        success: true,
        message: 'Professor deleted and report resolved successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      console.log(error);
      if (
        error.message === 'Review not found' ||
        error.message === 'Professor not found' ||
        error.message === 'Report not found'
      ) {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
    }
  }

  async deleteDepartmentAndResolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      if (!reportId) {
        res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
        return;
      }

      await this.adminService.deleteDepartmentAndResolveReport(reportId);
      res.status(200).json({
        success: true,
        message: 'Department deleted and report resolved successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      console.log(error);
      if (
        error.message === 'Review not found' ||
        error.message === 'Department not found' ||
        error.message === 'Report not found' ||
        error.message === 'Course not found' ||
        error.message === 'Invalid entity type for department removal'
      ) {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
    }
  }

  async deleteCourseAndResolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      if (!reportId) {
        res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
        return;
      }

      await this.adminService.deleteCourseAndResolveReport(reportId);
      res.status(200).json({
        success: true,
        message: 'Course deleted and report resolved successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      console.log(error);
      if (
        error.message === 'Review not found' ||
        error.message === 'Course not found' ||
        error.message === 'Report not found' ||
        error.message === 'Invalid entity type for course removal'
      ) {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
    }
  }

  async banUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { ban_reason } = req.body;
      const adminId = req.user?.uid;

      if (!userId || !ban_reason || !adminId) {
        res.status(400).json({
          success: false,
          message: 'Missing user_id, ban_reason, or admin_id',
          data: {},
          meta: {},
        });
        return;
      }

      await this.adminService.banUser(userId, ban_reason, adminId);
      res.status(200).json({
        success: true,
        message: 'User banned successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        data: {},
        meta: {},
      });
    }
  }

  async getBannedUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, total, totalPages } = await this.adminService.getBannedUsers(page, limit);
      res.status(200).json({
        success: true,
        message: 'Banned users fetched successfully',
        data: users,
        meta: {
          total_items: total,
          total_pages: totalPages,
          current_page: page,
          items_per_page: limit,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        data: {},
        meta: {},
      });
    }
  }

  async dismissReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      if (!reportId) {
        res.status(400).json({
          success: false,
          message: 'Missing report_id',
          data: {},
          meta: {},
        });
        return;
      }

      await this.adminService.dismissReport(reportId);
      res.status(200).json({
        success: true,
        message: 'Report dismissed successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        data: {},
        meta: {},
      });
    }
  }

  async unbanUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'Missing user_id',
          data: {},
          meta: {},
        });
        return;
      }

      await this.adminService.unbanUser(userId);
      res.status(200).json({
        success: true,
        message: 'User unbanned successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      console.log(error);
      if (error.message === 'No active ban found for this user') {
        res.status(404).json({
          success: false,
          message: error.message,
          data: {},
          meta: {},
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        data: {},
        meta: {},
      });
    }
  }
}
