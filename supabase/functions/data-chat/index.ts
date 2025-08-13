import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Gemini API key from Supabase secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { question, customerData } = await req.json()

    if (!question || !customerData) {
      throw new Error('Question and customer data are required')
    }

    // Prepare data summary for better context
    const totalCustomers = customerData.length
    const riskDistribution = customerData.reduce((acc: any, customer: any) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1
      return acc
    }, {})

    const totalRevenue = customerData.reduce((sum: number, customer: any) => sum + (customer.totalSpent || 0), 0)
    const avgOrderValue = customerData.reduce((sum: number, customer: any) => sum + (customer.avgOrderValue || 0), 0) / totalCustomers
    const avgRiskScore = customerData.reduce((sum: number, customer: any) => sum + (customer.riskScore || 0), 0) / totalCustomers

    // Get sample customer records for context
    const sampleCustomers = customerData.slice(0, 3).map((customer: any) => ({
      name: customer.name,
      email: customer.email,
      segment: customer.segment,
      riskScore: customer.riskScore,
      totalSpent: customer.totalSpent,
      purchaseCount: customer.purchaseCount
    }))

    const prompt = `You are a business intelligence AI assistant analyzing customer data. Please answer the user's question based on the provided customer data.

Customer Data Summary:
- Total Customers: ${totalCustomers}
- Risk Distribution: ${JSON.stringify(riskDistribution)}
- Total Revenue: $${totalRevenue.toLocaleString()}
- Average Order Value: $${avgOrderValue.toFixed(2)}
- Average Risk Score: ${avgRiskScore.toFixed(2)}

Sample Customer Records:
${JSON.stringify(sampleCustomers, null, 2)}

User Question: "${question}"

Instructions:
1. Provide specific, data-driven answers based on the actual customer data provided
2. Include relevant numbers, percentages, and insights
3. If the question asks for specific customers or segments, analyze the data accordingly
4. Be conversational but professional
5. If you cannot answer based on the available data, clearly explain what information is missing
6. Suggest follow-up questions or actions when appropriate

Please provide a helpful and insightful response:`

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      throw new Error('No response from Gemini API')
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in data-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: 'Please check your API configuration and try again'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})