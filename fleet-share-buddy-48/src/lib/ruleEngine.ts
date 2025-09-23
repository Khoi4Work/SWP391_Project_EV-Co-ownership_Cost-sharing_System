import { 
  RuleViolation, 
  VehicleSchedule, 
  UsageHistory, 
  PaymentDebt, 
  MemberOwnership, 
  GroupDecision 
} from '@/types/rules';
import { toast } from 'sonner';

export class RuleEngine {
  // Rule 1: Ownership & Member Management
  static checkOwnershipRequirements(membership: MemberOwnership): RuleViolation | null {
    // Rule 1.1: Identity and license verification
    if (!membership.identityVerified || !membership.licenseVerified) {
      return {
        id: `violation-${Date.now()}`,
        userId: membership.userId,
        groupId: membership.groupId,
        ruleCode: "1.1",
        violationType: 'serious',
        description: "Chưa hoàn thành xác minh CCCD/CMND hoặc Giấy phép lái xe",
        penaltyType: 'suspension',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }

    // Rule 4.1: Minimum ownership percentage
    if (membership.ownershipPercentage < 15) {
      return {
        id: `violation-${Date.now()}`,
        userId: membership.userId,
        groupId: membership.groupId,
        ruleCode: "4.1",
        violationType: 'serious',
        description: "Tỷ lệ sở hữu dưới mức tối thiểu 15%",
        penaltyType: 'expulsion',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }

    return null;
  }

  // Rule 2: Scheduling & Vehicle Usage
  static checkScheduleViolation(schedule: VehicleSchedule, history: UsageHistory): RuleViolation | null {
    const now = new Date();
    const endTime = new Date(schedule.endTime);
    const actualReturn = schedule.actualReturnTime ? new Date(schedule.actualReturnTime) : null;

    // Rule 2.3: Maximum consecutive days (14 normal, 7 during peak season)
    const isPeakSeason = this.isPeakSeason(now);
    const maxDays = isPeakSeason ? 7 : 14;
    
    if (history.consecutiveDaysUsed > maxDays) {
      return {
        id: `violation-${Date.now()}`,
        userId: schedule.userId,
        groupId: schedule.groupId,
        ruleCode: "2.3",
        violationType: 'schedule',
        description: `Sử dụng xe quá ${maxDays} ngày liên tục`,
        penaltyAmount: 200000,
        penaltyType: 'fine',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }

    // Rule 2.4: Late return violation
    if (actualReturn && actualReturn > endTime) {
      const isFirstViolation = history.violationCount === 0;
      return {
        id: `violation-${Date.now()}`,
        userId: schedule.userId,
        groupId: schedule.groupId,
        ruleCode: "2.4",
        violationType: 'schedule',
        description: "Trả xe muộn hơn thời gian đã đặt",
        penaltyAmount: isFirstViolation ? 0 : 200000,
        penaltyType: isFirstViolation ? 'warning' : 'fine',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }

    return null;
  }

  // Rule 3: Payment Violations
  static checkPaymentViolation(debt: PaymentDebt): RuleViolation | null {
    // Rule 3.4: Payment overdue > 15 days
    if (debt.overdueDays > 15) {
      return {
        id: `violation-${Date.now()}`,
        userId: debt.userId,
        groupId: debt.groupId,
        ruleCode: "3.4",
        violationType: 'payment',
        description: `Thanh toán chậm trễ ${debt.overdueDays} ngày`,
        penaltyAmount: debt.overdueDays * 50000,
        penaltyType: 'suspension',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }

    return null;
  }

  // Rule 2.2: Calculate schedule priority
  static calculateSchedulePriority(
    ownership: MemberOwnership, 
    history: UsageHistory
  ): number {
    let priority = 0;
    
    // Ownership percentage (highest weight)
    priority += ownership.ownershipPercentage * 10;
    
    // Usage history (less usage = higher priority)
    const maxUsage = 720; // 30 days * 24 hours
    const usageRatio = history.totalHours / maxUsage;
    priority += (1 - usageRatio) * 50;
    
    // Early registration bonus
    const daysSinceJoined = (Date.now() - new Date(ownership.joinedAt).getTime()) / (1000 * 60 * 60 * 24);
    priority += Math.min(daysSinceJoined / 30, 1) * 20;
    
    return Math.round(priority);
  }

  // Rule 4.2: Validate group decision
  static validateGroupDecision(decision: GroupDecision, memberships: MemberOwnership[]): boolean {
    const totalOwnership = memberships
      .filter(m => m.status === 'active')
      .reduce((sum, m) => sum + m.ownershipPercentage, 0);
    
    const approvalPercentage = (decision.currentApprovalPercentage / totalOwnership) * 100;
    
    return approvalPercentage >= decision.requiredApprovalPercentage;
  }

  // Rule 4.5: Process emergency bypass
  static processEmergencyBypass(decision: GroupDecision, evidence: string[]): boolean {
    if (!decision.emergencyBypass) return false;
    
    // Require evidence for emergency bypass
    if (evidence.length === 0) {
      toast.error("Trường hợp khẩn cấp cần cung cấp bằng chứng chứng minh");
      return false;
    }

    // Staff approval required
    if (!decision.emergencyBypass.staffApproved) {
      toast.warning("Đang chờ staff xác nhận tính khẩn cấp");
      return false;
    }

    return true;
  }

  // Helper: Check if current time is peak season
  private static isPeakSeason(date: Date): boolean {
    const month = date.getMonth() + 1;
    // Peak seasons: Tet (Jan-Feb), Summer holidays (Jun-Aug), National holidays
    return [1, 2, 6, 7, 8].includes(month);
  }

  // Rule 2.5: Check schedule conflict frequency
  static checkScheduleConflictViolation(userId: string, conflictCount: number): RuleViolation | null {
    if (conflictCount > 5) {
      return {
        id: `violation-${Date.now()}`,
        userId,
        groupId: '', // Will be set by caller
        ruleCode: "2.5",
        violationType: 'conflict',
        description: "Đặt lịch xung đột quá 5 lần trong tháng",
        penaltyType: 'suspension',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  }

  // Process rule violations and apply penalties
  static processViolation(violation: RuleViolation): void {
    switch (violation.penaltyType) {
      case 'warning':
        toast.warning(`Cảnh cáo vi phạm quy định ${violation.ruleCode}: ${violation.description}`);
        break;
      case 'fine':
        toast.error(`Phạt ${violation.penaltyAmount?.toLocaleString('vi-VN')} VNĐ - Vi phạm quy định ${violation.ruleCode}: ${violation.description}`);
        break;
      case 'suspension':
        toast.error(`Tạm khóa quyền sử dụng - Vi phạm quy định ${violation.ruleCode}: ${violation.description}`);
        break;
      case 'expulsion':
        toast.error(`Loại khỏi nhóm - Vi phạm quy định ${violation.ruleCode}: ${violation.description}`);
        break;
    }
  }
}