export interface RuleViolation {
  id: string;
  userId: string;
  groupId: string;
  ruleCode: string; // e.g., "2.3", "2.4", "4.1"
  violationType: 'schedule' | 'payment' | 'vehicle_damage' | 'serious' | 'conflict';
  description: string;
  penaltyAmount?: number;
  penaltyType: 'warning' | 'fine' | 'suspension' | 'expulsion';
  status: 'pending' | 'confirmed' | 'appealed' | 'resolved';
  evidenceUrls?: string[];
  createdAt: string;
  resolvedAt?: string;
  appealReason?: string;
}

export interface MemberOwnership {
  userId: string;
  groupId: string;
  ownershipPercentage: number;
  joinedAt: string;
  status: 'active' | 'suspended' | 'removed';
  identityVerified: boolean;
  licenseVerified: boolean;
}

export interface VehicleSchedule {
  id: string;
  groupId: string;
  vehicleId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  priority: number; // calculated based on ownership %
  conflictResolution?: 'ownership' | 'usage_history' | 'first_come';
  actualReturnTime?: string;
  isEmergency: boolean;
  emergencyEvidence?: string[];
  staffApproved?: boolean;
}

export interface PaymentDebt {
  id: string;
  userId: string;
  groupId: string;
  amount: number;
  type: 'maintenance' | 'insurance' | 'damage' | 'fine';
  dueDate: string;
  overdueDays: number;
  status: 'pending' | 'overdue' | 'paid';
  description: string;
}

export interface GroupDecision {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: 'ownership_change' | 'member_addition' | 'major_expense' | 'rule_change' | 'service_request';
  initiatedBy: string;
  requiredApprovalPercentage: number;
  currentApprovalPercentage: number;
  votes: GroupVote[];
  status: 'pending' | 'approved' | 'rejected' | 'emergency_bypassed';
  deadline: string;
  emergencyBypass?: {
    reason: string;
    evidence: string[];
    staffApproved: boolean;
    bypassedBy: string;
    bypassedAt: string;
  };
}

export interface GroupVote {
  userId: string;
  decision: 'approve' | 'reject' | 'abstain';
  ownershipPercentage: number;
  votedAt: string;
  comment?: string;
}

export interface UsageHistory {
  userId: string;
  groupId: string;
  totalHours: number;
  totalDays: number;
  violationCount: number;
  consecutiveDaysUsed: number;
  lastUsageDate: string;
}

export interface RuleEngine {
  checkScheduleViolation: (schedule: VehicleSchedule, history: UsageHistory) => RuleViolation | null;
  checkPaymentViolation: (debt: PaymentDebt) => RuleViolation | null;
  checkOwnershipRequirements: (membership: MemberOwnership) => RuleViolation | null;
  calculateSchedulePriority: (userId: string, groupId: string, ownership: MemberOwnership, history: UsageHistory) => number;
  validateGroupDecision: (decision: GroupDecision, memberships: MemberOwnership[]) => boolean;
  processEmergencyBypass: (decision: GroupDecision, evidence: string[]) => boolean;
}