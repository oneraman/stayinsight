import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessagesSquare, User, Send, Database, AlertCircle } from "lucide-react";
import { getCustomers } from "@/lib/supabase";
import { generateSecureDataChatResponse } from "@/lib/enhancedGemini";
import { CustomerData } from "@/utils/dataProcessing";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const DataChat = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch customer data on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);
        console.log("📊 Fetching customer data for chat...");
        
        if (!currentUser) {
          setDataError("Please log in to access data chat");
          return;
        }

        const customers = await getCustomers(currentUser.id, 1000); // Get up to 1000 customers for current user
        
        if (!customers || customers.length === 0) {
          setDataError("No customer data available. Please upload customer data first.");
          return;
        }

        // Transform Supabase data to match our CustomerData interface
        const customerData: CustomerData[] = customers.map((customer: any) => ({
          id: customer.id,
          customerId: customer.customer_id,
          email: customer.email,
          name: customer.name,
          lastPurchaseDate: customer.last_purchase_date ? new Date(customer.last_purchase_date) : undefined,
          purchaseCount: customer.purchase_count,
          totalSpent: customer.total_spent,
          avgOrderValue: customer.avg_order_value,
          riskScore: customer.risk_score,
          segment: customer.segment as 'low-risk' | 'medium-risk' | 'high-risk',
          age: customer.age,
          gender: customer.gender,
          tenure: customer.tenure,
          usageFrequency: customer.usage_frequency,
          supportCalls: customer.support_calls,
          paymentDelay: customer.payment_delay,
          subscriptionType: customer.subscription_type,
          createdAt: customer.created_at ? new Date(customer.created_at) : undefined,
          updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined
        }));
        
        setCustomerData(customerData);
        console.log("✅ Customer data loaded for chat:", customerData.length, "customers");
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          type: 'ai',
          content: `Welcome to Data Chat! I have access to ${customerData.length} customer records. You can ask me questions about your customer data, such as:

• "How many high-risk customers do we have?"
• "What's the average order value for customers over 30?"
• "Show me customers who haven't purchased in the last 90 days"
• "What are the top 3 segments by revenue?"
• "Which customers have the highest support call volume?"

What would you like to know about your customers?`,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error("❌ Error fetching customer data:", error);
        setDataError(error instanceof Error ? error.message : "Failed to load customer data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchCustomerData();
  }, [currentUser]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || customerData.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("🤖 Generating AI response for:", userMessage.content);
      const aiResponse = await generateSecureDataChatResponse(userMessage.content, customerData);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("❌ Error generating AI response:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I encountered an error while processing your question. Please try rephrasing your question or try again later.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Focus back on input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading customer data for chat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessagesSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Data Chat</h1>
          </div>
          <p className="text-muted-foreground">
            Ask questions about your customer data and get AI-powered insights
          </p>
        </div>

        {dataError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {dataError}
            </AlertDescription>
          </Alert>
        )}

        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Chat with Your Data
              {customerData.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({customerData.length} customers loaded)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessagesSquare className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-2 opacity-70 ${
                          message.type === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessagesSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Analyzing your data...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    customerData.length > 0
                      ? "Ask a question about your customer data..."
                      : "Please upload customer data first..."
                  }
                  disabled={isLoading || customerData.length === 0}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || customerData.length === 0}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {customerData.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Press Enter to send • Try asking about customer segments, revenue, or churn risk
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DataChat;