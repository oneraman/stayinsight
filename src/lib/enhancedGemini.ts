import { supabase } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";

export type DataChatResult = { response: string; sessionId: string };

export const sendDataChatMessage = async (
  question: string,
  customerData: CustomerData[],
  options?: { sessionId?: string; title?: string }
): Promise<DataChatResult> => {
  try {
    console.log("🔒 Using secure Supabase edge function for AI response with session support");

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('data-chat', {
      body: {
        question,
        customerData,
        sessionId: options?.sessionId,
        title: options?.title,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("❌ Edge function error:", error);
      throw new Error(error.message || 'Failed to get AI response');
    }

    if (!data?.response) {
      throw new Error('No response received from AI service');
    }

    const result: DataChatResult = {
      response: data.response,
      sessionId: data.sessionId,
    };

    console.log("✅ Secure AI response generated and stored successfully");
    return result;

  } catch (error) {
    console.error("❌ Error in secure data chat:", error);
    if (error instanceof Error) throw error;
    throw new Error('Unknown error occurred');
  }
};

export const generateSecureDataChatResponse = async (
  question: string, 
  customerData: CustomerData[]
): Promise<string> => {
  try {
    const { response } = await sendDataChatMessage(question, customerData);
    return response;
  } catch (error) {
    console.error("❌ Error in secure data chat:", error);

    // Fallback error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "I apologize, but the AI service is not properly configured. Please contact your administrator to set up the Gemini API key.";
      }
      if (error.message.includes('Authentication')) {
        return "Authentication required. Please log in again to use the data chat feature.";
      }
    }

    return "I apologize, but I encountered an error while processing your question. Please try again later or contact support if the issue persists.";
  }
};

// Placeholder functions for backwards compatibility
export const generateEnhancedCustomerInsights = async (customerData: any): Promise<string> => {
  return generateSecureDataChatResponse(
    `Provide detailed churn insights for this customer: ${JSON.stringify(customerData, null, 2)}`,
    [customerData]
  );
};

export const generateEnhancedPortfolioAnalysis = async (customers: any[]): Promise<string> => {
  return generateSecureDataChatResponse(
    "Provide a comprehensive portfolio analysis including risk assessment, revenue insights, and strategic recommendations for this customer base.",
    customers
  );
};

export const generateContextualInsights = async (context: string, customers: any[]): Promise<string> => {
  return generateSecureDataChatResponse(
    `Given this context: ${context}, provide contextual insights about the customer data.`,
    customers
  );
};

export const validateInsightAccuracy = async (insight: string, customers: any[]): Promise<boolean> => {
  try {
    const response = await generateSecureDataChatResponse(
      `Validate if this insight is accurate based on the customer data: ${insight}`,
      customers
    );
    return response.toLowerCase().includes('accurate') || response.toLowerCase().includes('correct');
  } catch {
    return false;
  }
};