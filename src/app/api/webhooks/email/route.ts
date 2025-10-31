import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.GMAIL_WEBHOOK_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Extract email data from n8n webhook payload
    // Adjust these fields based on your n8n workflow output
    const {
      user_id,
      message_id,
      subject,
      from,
      to,
      body: emailBody,
      labels,
      received_at,
    } = body

    if (!user_id || !message_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('emails')
      .select('id')
      .eq('gmail_id', message_id)
      .eq('user_id', user_id)
      .single()

    if (existingEmail) {
      // Email already synced, skip
      return NextResponse.json({ success: true, skipped: true })
    }

    // Create new email
    const { error } = await supabase
      .from('emails')
      .insert({
        user_id,
        gmail_id: message_id,
        subject: subject || '(No Subject)',
        from_email: from,
        to_email: to,
        body: emailBody || null,
        labels: labels || null,
        received_at: received_at || new Date().toISOString(),
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Email webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
