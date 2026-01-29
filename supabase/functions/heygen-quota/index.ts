import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isPaidPlan: false, 
          remainingQuota: 0,
          error: 'API key is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Checking HeyGen quota for API key...')

    // Call HeyGen's remaining_quota endpoint
    const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey
      }
    })

    if (!response.ok) {
      console.error('HeyGen API error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isPaidPlan: false, 
          remainingQuota: 0,
          error: 'Invalid API key or HeyGen service error' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    // Response can come as array or direct object
    const quotaData = Array.isArray(data) ? data[0] : data
    
    if (quotaData.error) {
      console.error('HeyGen quota error:', quotaData.error)
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isPaidPlan: false, 
          remainingQuota: 0,
          error: quotaData.error 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Detect paid plan by checking if "plan_credit" exists in details
    const details = quotaData.data?.details || {}
    const hasPlanCredit = 'plan_credit' in details && details.plan_credit > 0
    const remainingQuota = quotaData.data?.remaining_quota || 0

    console.log('HeyGen quota check result:', {
      remainingQuota,
      hasPlanCredit,
      detailsKeys: Object.keys(details)
    })

    return new Response(
      JSON.stringify({ 
        isValid: true, 
        isPaidPlan: hasPlanCredit,
        remainingQuota,
        details 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        isPaidPlan: false, 
        remainingQuota: 0,
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
