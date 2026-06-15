import { Approval, ApprovalStatus, ApprovalType, UserRole } from '../types';
import { auditService } from './auditService';

const APPROVAL_ROUTES: Record<ApprovalType, { role: UserRole; order: number }[]> = {
  discount: [
    { role: 'sales_manager', order: 1 },
    { role: 'finance', order: 2 },
    { role: 'compliance', order: 3 },
  ],
  contract: [
    { role: 'sales_manager', order: 1 },
    { role: 'compliance', order: 2 },
    { role: 'finance', order: 3 },
    { role: 'director', order: 4 },
  ],
  promo_material: [
    { role: 'marketing', order: 1 },
    { role: 'compliance', order: 2 },
    { role: 'medical_affairs', order: 3 },
  ],
  event: [
    { role: 'marketing', order: 1 },
    { role: 'compliance', order: 2 },
    { role: 'finance', order: 3 },
  ],
  budget: [
    { role: 'sales_manager', order: 1 },
    { role: 'finance', order: 2 },
    { role: 'director', order: 3 },
  ],
  non_standard: [
    { role: 'sales_manager', order: 1 },
    { role: 'compliance', order: 2 },
    { role: 'director', order: 3 },
  ],
  medical_response: [
    { role: 'medical_affairs', order: 1 },
    { role: 'compliance', order: 2 },
  ],
  gift_expense: [
    { role: 'compliance', order: 1 },
    { role: 'finance', order: 2 },
  ],
  kol_activity: [
    { role: 'medical_affairs', order: 1 },
    { role: 'compliance', order: 2 },
    { role: 'finance', order: 3 },
  ],
};

const ROLE_LIMITS: Partial<Record<UserRole, number>> = {
  medical_rep: 5000,
  sales_manager: 50000,
  marketing: 100000,
};

class ApprovalService {
  private approvals: Approval[] = [];

  create(params: {
    type: ApprovalType;
    title: string;
    description: string;
    requesterId: string;
    requesterName: string;
    amount?: number;
    mode: 'sequential' | 'parallel';
    deadline?: string;
  }): Approval {
    const route = APPROVAL_ROUTES[params.type];
    const approval: Approval = {
      id: `apr-${Date.now()}`,
      ...params,
      status: 'pending',
      steps: route.map((r) => ({
        id: `step-${r.order}`,
        order: r.order,
        approverRole: r.role,
        status: 'pending',
        deadline: params.deadline,
      })),
      createdAt: new Date().toISOString(),
      comments: [],
      history: [{
        id: `hist-${Date.now()}`,
        action: 'created',
        userId: params.requesterId,
        userName: params.requesterName,
        timestamp: new Date().toISOString(),
        details: 'Заявка создана',
      }],
    };
    this.approvals.unshift(approval);
    return approval;
  }

  async decide(
    approvalId: string,
    stepId: string,
    decision: 'approved' | 'rejected' | 'returned',
    userId: string,
    userName: string,
    comment?: string,
  ): Promise<Approval | null> {
    const approval = this.approvals.find((a) => a.id === approvalId);
    if (!approval) return null;

    const step = approval.steps.find((s) => s.id === stepId);
    if (!step) return null;

    step.status = decision;
    step.approverId = userId;
    step.approverName = userName;
    step.comment = comment;
    step.decidedAt = new Date().toISOString();

    approval.history.push({
      id: `hist-${Date.now()}`,
      action: decision,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      details: comment,
    });

    if (decision === 'rejected' || decision === 'returned') {
      approval.status = decision;
    } else if (approval.mode === 'parallel') {
      const allApproved = approval.steps.every((s) => s.status === 'approved');
      approval.status = allApproved ? 'approved' : 'in_review';
    } else {
      const pending = approval.steps.find((s) => s.status === 'pending');
      approval.status = pending ? 'in_review' : 'approved';
    }

    await auditService.log({
      entityType: 'approval',
      entityId: approvalId,
      action: decision === 'approved' ? 'approve' : 'reject',
      userId,
      userName,
      reason: comment,
      newValue: decision,
    });

    return approval;
  }

  addComment(approvalId: string, userId: string, userName: string, text: string) {
    const approval = this.approvals.find((a) => a.id === approvalId);
    if (!approval) return;
    approval.comments.push({
      id: `cmt-${Date.now()}`,
      userId,
      userName,
      text,
      createdAt: new Date().toISOString(),
    });
  }

  checkLimit(role: UserRole, amount: number): boolean {
    const limit = ROLE_LIMITS[role];
    return limit ? amount <= limit : true;
  }

  getAll(): Approval[] {
    return [...this.approvals];
  }

  getPending(): Approval[] {
    return this.approvals.filter((a) => ['pending', 'in_review'].includes(a.status));
  }

  seed(data: Approval[]) {
    this.approvals = data;
  }
}

export const approvalService = new ApprovalService();
