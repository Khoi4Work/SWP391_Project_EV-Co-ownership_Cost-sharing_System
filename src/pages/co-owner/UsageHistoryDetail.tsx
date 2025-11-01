import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUsageHistoryDetail, UsageHistoryDetail } from "@/api/usageHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function UsageHistoryDetailPage() {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<UsageHistoryDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!scheduleId) return;
        setLoading(true);
        fetchUsageHistoryDetail(Number(scheduleId))
            .then(setDetail)
            .catch(() => toast({ title: "Lỗi", description: "Không tải được chi tiết lịch sử", variant: "destructive" }))
            .finally(() => setLoading(false));
    }, [scheduleId]);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Chi tiết lịch sử sử dụng</h2>
                <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
            </div>

            <Card>
                <CardContent className="space-y-4 p-4">
                    {loading ? (
                        <div className="text-sm text-muted-foreground">Đang tải...</div>
                    ) : !detail ? (
                        <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Ngày</div>
                                    <div className="font-medium">{detail.date}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Xe</div>
                                    <div className="font-medium">{detail.vehicleName}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Người dùng</div>
                                    <div className="font-medium">{detail.userName}</div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Check-in</h3>
                                        <Badge variant={detail.checkInTime ? "default" : "secondary"}>
                                            {detail.checkInTime ? "Đã check-in" : "Chưa check-in"}
                                        </Badge>
                                    </div>
                                    <InfoRow label="Thời gian" value={detail.checkInTime ? new Date(detail.checkInTime).toLocaleString() : "-"} />
                                    <InfoRow label="Tình trạng" value={detail.checkInCondition || "-"} />
                                    <InfoRow label="Ghi chú" value={detail.checkInNotes || "-"} />
                                    {detail.checkInImages && detail.checkInImages.length > 0 && (
                                        <ImageGrid images={detail.checkInImages} />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Check-out</h3>
                                        <Badge variant={detail.checkOutTime ? "default" : "secondary"}>
                                            {detail.checkOutTime ? "Đã check-out" : "Chưa check-out"}
                                        </Badge>
                                    </div>
                                    <InfoRow label="Thời gian" value={detail.checkOutTime ? new Date(detail.checkOutTime).toLocaleString() : "-"} />
                                    <InfoRow label="Tình trạng" value={detail.checkOutCondition || "-"} />
                                    <InfoRow label="Ghi chú" value={detail.checkOutNotes || "-"} />
                                    {detail.checkOutImages && detail.checkOutImages.length > 0 && (
                                        <ImageGrid images={detail.checkOutImages} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-3 text-sm">
            <div className="text-muted-foreground">{label}</div>
            <div className="col-span-2">{value}</div>
        </div>
    );
}

function ImageGrid({ images }: { images: string[] }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {images.map((src, idx) => (
                <img key={idx} src={src} alt={`img-${idx}`} className="w-full h-24 object-cover rounded" />
            ))}
        </div>
    );
}


