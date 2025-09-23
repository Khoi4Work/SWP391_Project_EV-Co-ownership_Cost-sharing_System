import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RuleViolation } from '@/types/rules';
import { Shield, AlertTriangle, DollarSign, Calendar, Car, Users } from 'lucide-react';
import { toast } from 'sonner';

interface RuleViolationPanelProps {
  violations: RuleViolation[];
  onResolve: (violationId: string, resolution: 'confirmed' | 'dismissed') => void;
  canResolve?: boolean; // Staff/Admin privilege
}

export const RuleViolationPanel = ({ violations, onResolve, canResolve = false }: RuleViolationPanelProps) => {
  const [selectedViolation, setSelectedViolation] = useState<RuleViolation | null>(null);
  const [appealReason, setAppealReason] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  const getViolationIcon = (type: RuleViolation['violationType']) => {
    switch (type) {
      case 'schedule': return <Calendar className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'vehicle_damage': return <Car className="h-4 w-4" />;
      case 'serious': return <Shield className="h-4 w-4" />;
      case 'conflict': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getViolationColor = (type: RuleViolation['violationType']) => {
    switch (type) {
      case 'schedule': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'payment': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'vehicle_damage': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'serious': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'conflict': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPenaltyText = (violation: RuleViolation) => {
    switch (violation.penaltyType) {
      case 'warning': return 'Cảnh cáo';
      case 'fine': return `Phạt ${violation.penaltyAmount?.toLocaleString('vi-VN')} VNĐ`;
      case 'suspension': return 'Tạm khóa quyền sử dụng';
      case 'expulsion': return 'Loại khỏi nhóm';
    }
  };

  const handleAppeal = (violation: RuleViolation) => {
    if (!appealReason.trim()) {
      toast.error('Vui lòng nhập lý do khiếu nại');
      return;
    }

    // In real implementation, this would call an API
    toast.success('Khiếu nại đã được gửi, chờ staff xem xét');
    setAppealReason('');
    setEvidenceFiles([]);
    setSelectedViolation(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles(Array.from(e.target.files));
    }
  };

  if (violations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Không có vi phạm nào được ghi nhận</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vi phạm quy định ({violations.length})</h3>
      
      {violations.map((violation) => (
        <Card key={violation.id} className="border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${getViolationColor(violation.violationType)}`}>
                  {getViolationIcon(violation.violationType)}
                </div>
                <div>
                  <CardTitle className="text-base">Vi phạm quy định {violation.ruleCode}</CardTitle>
                  <p className="text-sm text-muted-foreground">{violation.description}</p>
                </div>
              </div>
              <Badge variant={violation.status === 'pending' ? 'destructive' : 'secondary'}>
                {violation.status === 'pending' ? 'Đang xử lý' : 
                 violation.status === 'confirmed' ? 'Đã xác nhận' : 
                 violation.status === 'appealed' ? 'Đang khiếu nại' : 'Đã giải quyết'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mức phạt:</span>
              <span className="text-sm text-destructive font-medium">{getPenaltyText(violation)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Thời gian:</span>
              <span className="text-sm">{new Date(violation.createdAt).toLocaleString('vi-VN')}</span>
            </div>

            <div className="flex gap-2 pt-2">
              {violation.status === 'pending' && (
                <Dialog open={selectedViolation?.id === violation.id} onOpenChange={(open) => setSelectedViolation(open ? violation : null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Khiếu nại
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Khiếu nại vi phạm quy định {violation.ruleCode}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="appeal-reason">Lý do khiếu nại</Label>
                        <Textarea
                          id="appeal-reason"
                          placeholder="Vui lòng mô tả lý do khiếu nại và bằng chứng..."
                          value={appealReason}
                          onChange={(e) => setAppealReason(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="evidence">Bằng chứng (tùy chọn)</Label>
                        <Input
                          id="evidence"
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="mt-1"
                        />
                        {evidenceFiles.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Đã chọn {evidenceFiles.length} file
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={() => handleAppeal(violation)}>
                          Gửi khiếu nại
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedViolation(null)}>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {canResolve && violation.status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onResolve(violation.id, 'confirmed')}
                  >
                    Xác nhận vi phạm
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onResolve(violation.id, 'dismissed')}
                  >
                    Hủy bỏ
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};