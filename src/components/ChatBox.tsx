import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "co-owner" | "staff" | "admin";
}

export default function ChatBox({ isOpen, onClose, userType }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là trợ lý AI của EcoShare. Tôi có thể giúp bạn gì hôm nay?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const getAIResponse = (userMessage: string) => {
    // Simple AI responses based on user type and message content
    const responses: { [key: string]: string[] } = {
      "co-owner": [
        "Tôi có thể giúp bạn về quy trình đăng ký xe, thông tin hợp đồng, và các câu hỏi về đồng sở hữu xe điện.",
        "Để đăng ký xe mới, bạn vui lòng truy cập mục 'Đăng ký xe mới' trong bảng điều khiển.",
        "Bạn có thể xem tất cả hợp đồng đã ký trong mục 'Hợp đồng' và tải xuống khi cần thiết."
      ],
      "staff": [
        "Tôi có thể hỗ trợ bạn về quy trình duyệt đơn, quản lý nhóm, và các thống kê hoạt động.",
        "Để duyệt đơn đăng ký, bạn có thể truy cập mục 'Quản lý đơn đăng ký' và xem xét từng trường hợp.",
        "Thống kê hoạt động được cập nhật real-time trong bảng điều khiển của bạn."
      ],
      "admin": [
        "Tôi có thể giúp bạn về quản lý hệ thống, phân tích báo cáo, và quản lý showroom.",
        "Để tạo tài khoản nhân viên mới, truy cập mục 'Quản lý nhân viên' và chọn 'Thêm nhân viên'.",
        "Báo cáo và phân tích chi tiết có thể được xem trong mục 'Analytics' với các biểu đồ trực quan."
      ]
    };

    const userResponses = responses[userType] || responses["co-owner"];
    
    // Simple keyword matching for more relevant responses
    if (userMessage.toLowerCase().includes("đăng ký")) {
      return userResponses[1];
    } else if (userMessage.toLowerCase().includes("hợp đồng")) {
      return userResponses[2];
    } else {
      return userResponses[0];
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md h-[600px] flex flex-col shadow-glow border-0">
        <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Trợ lý AI EcoShare</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}