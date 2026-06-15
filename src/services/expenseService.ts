import { Expense, ExpenseType } from '../types';
import { auditService } from './auditService';

const EXPENSE_LIMITS: Record<ExpenseType, number> = {
  gift: 3000,
  meal: 5000,
  travel: 15000,
  event_sponsorship: 50000,
  education: 30000,
  consulting: 100000,
  sample: 10000,
};

class ExpenseService {
  private expenses: Expense[] = [];

  create(params: Omit<Expense, 'id' | 'status' | 'limitExceeded' | 'conflictOfInterestChecked'>): Expense {
    const limit = EXPENSE_LIMITS[params.type];
    const limitExceeded = params.amount > limit;

    const expense: Expense = {
      ...params,
      id: `exp-${Date.now()}`,
      status: limitExceeded ? 'pending_approval' : 'draft',
      limitExceeded,
      conflictOfInterestChecked: false,
    };

    this.expenses.unshift(expense);
    return expense;
  }

  async checkConflictOfInterest(expenseId: string): Promise<'clear' | 'flagged' | 'blocked'> {
    const expense = this.expenses.find((e) => e.id === expenseId);
    if (!expense) return 'blocked';

    // Симуляция проверки конфликта интересов
    const flagged = expense.amount > 10000;
    const result: 'clear' | 'flagged' | 'blocked' = flagged ? 'flagged' : 'clear';
    expense.conflictOfInterestChecked = true;
    expense.conflictOfInterestResult = result;
    return result;
  }

  isBlocked(expenseId: string): boolean {
    const expense = this.expenses.find((e) => e.id === expenseId);
    return expense?.limitExceeded === true || expense?.conflictOfInterestResult === 'blocked';
  }

  getTransferOfValueReport(period?: { from: string; to: string }): Expense[] {
    let result = this.expenses.filter((e) => e.status === 'approved' || e.status === 'reported');
    if (period) {
      result = result.filter((e) => e.date >= period.from && e.date <= period.to);
    }
    return result;
  }

  getAll(): Expense[] {
    return [...this.expenses];
  }

  getTotalByHcp(hcpId: string): number {
    return this.expenses
      .filter((e) => e.hcpId === hcpId && ['approved', 'reported'].includes(e.status))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  seed(data: Expense[]) {
    this.expenses = data;
  }
}

export const expenseService = new ExpenseService();
