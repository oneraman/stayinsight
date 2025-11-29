import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Lovable API key from Supabase secrets
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured')
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

    const { question, customerData, sessionId: incomingSessionId, title } = await req.json()

    if (!question || !customerData) {
      throw new Error('Question and customer data are required')
    }

    const userId = user.id
    let sessionId = incomingSessionId as string | undefined

    // Ensure a valid session exists and belongs to the current user
    if (sessionId) {
      const { data: session, error: sessionErr } = await supabase
        .from('data_chat_sessions')
        .select('id,user_id')
        .eq('id', sessionId)
        .maybeSingle()

      if (sessionErr || !session || session.user_id !== userId) {
        throw new Error('Invalid or unauthorized session')
      }
    } else {
      const derivedTitle = (title || question).slice(0, 80)
      const { data: newSession, error: createErr } = await supabase
        .from('data_chat_sessions')
        .insert({ user_id: userId, title: derivedTitle })
        .select('id')
        .single()

      if (createErr || !newSession) {
        throw new Error('Failed to create chat session')
      }
      sessionId = newSession.id
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

    const systemPrompt = `You are a concise data analyst for customer churn analysis.

Rules:
- Keep answers under 3 sentences
- Use bullet points for lists
- Be direct and specific
- No fluff or filler words
- Focus on actionable insights
- Reference actual customer data`

    const prompt = `Customer Data Summary:
- Total: ${totalCustomers} customers
- Risk Distribution: ${JSON.stringify(riskDistribution)}
- Revenue: $${totalRevenue.toLocaleString()}
- Avg Order Value: $${avgOrderValue.toFixed(2)}
- Avg Risk Score: ${avgRiskScore.toFixed(2)}

Sample Customers:
${JSON.stringify(sampleCustomers, null, 2)}

Question: "${question}"

Respond in under 150 words with bullet points.`

    // Persist user message
    await supabase
      .from('data_chat_messages')
      .insert({ session_id: sessionId!, user_id: userId, role: 'user', content: question });

    console.log('🤖 Calling Lovable AI Gateway...')

    // Call Lovable AI Gateway
    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lovable AI Gateway error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        )
      }
      
      throw new Error(`Lovable AI Gateway error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from Lovable AI Gateway')
    }

    console.log('✅ AI response received successfully')

    // Persist AI response message
    await supabase
      .from('data_chat_messages')
      .insert({ session_id: sessionId!, user_id: userId, role: 'ai', content: aiResponse });

    return new Response(
      JSON.stringify({ response: aiResponse, sessionId }),
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