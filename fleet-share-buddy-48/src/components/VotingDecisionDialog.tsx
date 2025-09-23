import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { GroupDecision } from '@/types/rules';
import { Vote, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface VotingDecisionDialogProps {
  trigger: React.ReactNode;
  onSubmit: (decision: Partial<GroupDecision>) => void;
}

export const VotingDecisionDialog = ({ trigger, onSubmit }: VotingDecisionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const decision: Partial<GroupDecision> = {
      title,
      description,
      type: 'service_request',
      requiredApprovalPercentage: 70,
      status: 'pending',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    onSubmit(decision);
    
    // Reset form
    setTitle('');
    setDescription('');
    setOpen(false);
    
    toast.success('Đã tạo bỏ phiếu, chờ thành viên bỏ phiếu để gửi yêu cầu lên staff');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-blue-500" />
            Tạo bỏ phiếu yêu cầu dịch vụ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề yêu cầu</Label>
              <Input
                id="title"
                placeholder="VD: Yêu cầu bảo dưỡng xe VinFast VF8"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về dịch vụ cần thực hiện..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Voting Process Info */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Quy trình bỏ phiếu:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Cần tối thiểu 70% tổng tỷ lệ sở hữu đồng ý</li>
                    <li>• Thời hạn bỏ phiếu: 7 ngày</li>
                    <li>• Sau khi đạt đủ phiếu, yêu cầu sẽ được gửi lên staff</li>
                    <li>• Tất cả thành viên sẽ được thông báo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Lưu ý:</p>
                <p className="text-blue-700">
                  Yêu cầu dịch vụ cần được các thành viên trong nhóm bỏ phiếu thông qua trước khi gửi lên staff xử lý.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              Tạo bỏ phiếu
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