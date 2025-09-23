import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroupDecision } from '@/types/rules';
import { AlertTriangle, Upload, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyDecisionDialogProps {
  trigger: React.ReactNode;
  onSubmit: (decision: Partial<GroupDecision>) => void;
}

export const EmergencyDecisionDialog = ({ trigger, onSubmit }: EmergencyDecisionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isUrgent, setIsUrgent] = useState(true);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (isUrgent && (!emergencyReason.trim() || evidenceFiles.length === 0)) {
      toast.error('Trường hợp khẩn cấp cần có lý do và bằng chứng');
      return;
    }

    const decision: Partial<GroupDecision> = {
      title,
      description,
      type: 'major_expense',
      requiredApprovalPercentage: 70,
      status: isUrgent ? 'emergency_bypassed' : 'pending',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    if (isUrgent) {
      decision.emergencyBypass = {
        reason: emergencyReason,
        evidence: evidenceFiles.map(f => f.name), // In real app, upload files first
        staffApproved: false,
        bypassedBy: 'current-user-id',
        bypassedAt: new Date().toISOString()
      };
    }

    onSubmit(decision);
    
    // Reset form
    setTitle('');
    setDescription('');
    setEmergencyReason('');
    setEvidenceFiles([]);
    setIsUrgent(false);
    setOpen(false);
    
    if (isUrgent) {
      toast.success('Quyết định khẩn cấp đã được gửi, chờ staff xác nhận');
    } else {
      toast.success('Đề xuất đã được tạo, chờ thành viên bỏ phiếu');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles(Array.from(e.target.files));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Quyết định khẩn cấp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề quyết định</Label>
              <Input
                id="title"
                placeholder="VD: Thay pin xe điện VinFast VF8"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về quyết định cần thông qua..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Emergency Decision Section */}
          <Card className="border-orange-500 bg-orange-50/50">
            <CardContent className="space-y-4 pt-6">
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 mb-1">Quy định 4.5:</p>
                    <p className="text-orange-700">
                      Trường hợp khẩn cấp có thể bỏ qua quy trình bỏ phiếu nhưng phải cung cấp bằng chứng 
                      chứng minh tính cấp thiết và được staff xác nhận.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="emergency-reason">Lý do khẩn cấp *</Label>
                <Textarea
                  id="emergency-reason"
                  placeholder="VD: Xe bị hỏng đột ngột giữa đường, cần sửa chữa ngay để không ảnh hưởng đến lịch sử dụng của thành viên khác..."
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="evidence">Bằng chứng chứng minh *</Label>
                <Input
                  id="evidence"
                  type="file"
                  multiple
                  accept="image/*,application/pdf,video/*"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
                {evidenceFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {evidenceFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Upload className="h-3 w-3" />
                        <span>{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Chấp nhận ảnh, video, PDF. Tối đa 10MB mỗi file.
                </p>
              </div>

              <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Quyết định khẩn cấp sẽ được thực hiện ngay lập tức nhưng cần được staff xác nhận. 
                  Nếu staff không chấp thuận, quyết định sẽ bị hủy bỏ.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              Tạo quyết định khẩn cấp
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};