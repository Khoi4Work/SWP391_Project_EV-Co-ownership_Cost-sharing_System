import { useState, useEffect } from 'react';
import { RuleEngine } from '@/lib/ruleEngine';
import { 
  RuleViolation, 
  VehicleSchedule, 
  UsageHistory, 
  PaymentDebt, 
  MemberOwnership,
  GroupDecision 
} from '@/types/rules';
import { toast } from 'sonner';

export const useRuleEngine = (groupId: string, userId: string) => {
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Check for rule violations
  const checkRules = async (
    schedule?: VehicleSchedule,
    history?: UsageHistory,
    debt?: PaymentDebt,
    membership?: MemberOwnership
  ) => {
    setIsChecking(true);
    const newViolations: RuleViolation[] = [];

    try {
      // Check ownership requirements
      if (membership) {
        const ownershipViolation = RuleEngine.checkOwnershipRequirements(membership);
        if (ownershipViolation) newViolations.push(ownershipViolation);
      }

      // Check schedule violations
      if (schedule && history) {
        const scheduleViolation = RuleEngine.checkScheduleViolation(schedule, history);
        if (scheduleViolation) newViolations.push(scheduleViolation);
      }

      // Check payment violations
      if (debt) {
        const paymentViolation = RuleEngine.checkPaymentViolation(debt);
        if (paymentViolation) newViolations.push(paymentViolation);
      }

      // Process violations
      newViolations.forEach(violation => {
        RuleEngine.processViolation(violation);
        setViolations(prev => [...prev, violation]);
      });

    } catch (error) {
      console.error('Error checking rules:', error);
      toast.error('Lỗi kiểm tra quy định');
    } finally {
      setIsChecking(false);
    }
  };

  // Calculate priority for scheduling
  const calculatePriority = (ownership: MemberOwnership, history: UsageHistory): number => {
    return RuleEngine.calculateSchedulePriority(ownership, history);
  };

  // Validate group decision
  const validateDecision = (decision: GroupDecision, memberships: MemberOwnership[]): boolean => {
    return RuleEngine.validateGroupDecision(decision, memberships);
  };

  // Process emergency bypass
  const processEmergencyBypass = (decision: GroupDecision, evidence: string[]): boolean => {
    return RuleEngine.processEmergencyBypass(decision, evidence);
  };

  // Check if user can make a booking
  const canMakeBooking = (debt?: PaymentDebt, membership?: MemberOwnership): boolean => {
    if (debt && debt.overdueDays > 15) {
      toast.error('Tài khoản bị khóa do thanh toán chậm trễ quá 15 ngày');
      return false;
    }

    if (membership && (!membership.identityVerified || !membership.licenseVerified)) {
      toast.error('Vui lòng hoàn thành xác minh danh tính và giấy phép lái xe');
      return false;
    }

    return true;
  };

  // Resolve violation (for staff/admin)
  const resolveViolation = (violationId: string, resolution: 'confirmed' | 'dismissed') => {
    setViolations(prev => 
      prev.map(v => 
        v.id === violationId 
          ? { ...v, status: resolution === 'confirmed' ? 'resolved' : 'dismissed' as any, resolvedAt: new Date().toISOString() }
          : v
      )
    );
    
    toast.success(`Vi phạm đã được ${resolution === 'confirmed' ? 'xác nhận' : 'hủy bỏ'}`);
  };

  return {
    violations,
    isChecking,
    checkRules,
    calculatePriority,
    validateDecision,
    processEmergencyBypass,
    canMakeBooking,
    resolveViolation
  };
};