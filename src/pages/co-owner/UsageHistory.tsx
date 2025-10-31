import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUsageHistoryList, UsageHistoryListItem } from "@/api/usageHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function UsageHistory() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState<UsageHistoryListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const userIdStr = localStorage.getItem("userId");
        if (!groupId || !userIdStr) return;
        const userId = Number(userIdStr);
        const gId = Number(groupId);
        setLoading(true);
        fetchUsageHistoryList(userId, gId)
            .then(setItems)
            .catch(() => toast({ title: "Lỗi", description: "Không tải được lịch sử sử dụng", variant: "destructive" }))
            .finally(() => setLoading(false));
    }, [groupId]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((it) =>
            it.vehicleName?.toLowerCase().includes(q) ||
            it.userName?.toLowerCase().includes(q) ||
            it.date?.toLowerCase().includes(q) ||
            it.timeRange?.toLowerCase().includes(q)
        );
    }, [items, query]);

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">Lịch sử sử dụng</h2>
                <div className="flex items-center gap-2">
                    <Input placeholder="Tìm theo xe, người dùng, ngày..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="grid grid-cols-12 px-4 py-3 text-sm font-medium text-muted-foreground border-b">
                        <div className="col-span-2">Ngày</div>
                        <div className="col-span-3">Xe</div>
                        <div className="col-span-2">Người dùng</div>
                        <div className="col-span-2">Khung giờ</div>
                        <div className="col-span-3 text-right">Trạng thái</div>
                    </div>
                    {loading ? (
                        <div className="p-4 text-sm text-muted-foreground">Đang tải...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">Không có dữ liệu</div>
                    ) : (
                        <div className="divide-y">
                            {filtered.map((it) => (
                                <button
                                    key={it.scheduleId}
                                    onClick={() => navigate(`/co-owner/usage-history/${it.scheduleId}`)}
                                    className="grid grid-cols-12 w-full text-left px-4 py-3 hover:bg-muted/50"
                                >
                                    <div className="col-span-2">{it.date}</div>
                                    <div className="col-span-3">{it.vehicleName}</div>
                                    <div className="col-span-2">{it.userName}</div>
                                    <div className="col-span-2">{it.timeRange}</div>
                                    <div className="col-span-3 flex items-center justify-end gap-2">
                                        <Badge variant={it.hasCheckIn ? "default" : "secondary"}>{it.hasCheckIn ? "Đã check-in" : "Chưa check-in"}</Badge>
                                        <Badge variant={it.hasCheckOut ? "default" : "secondary"}>{it.hasCheckOut ? "Đã check-out" : "Chưa check-out"}</Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


