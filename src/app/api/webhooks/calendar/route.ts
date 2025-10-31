import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.GOOGLE_CALENDAR_WEBHOOK_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Extract event data from n8n webhook payload
    // Adjust these fields based on your n8n workflow output
    const {
      user_id,
      event_id,
      summary,
      description,
      start,
      end,
      location,
      attendees,
    } = body

    if (!user_id || !event_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if event already exists
    const { data: existingEvent } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('google_event_id', event_id)
      .eq('user_id', user_id)
      .single()

    if (existingEvent) {
      // Update existing event
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: summary,
          description: description || null,
          start_time: start,
          end_time: end,
          location: location || null,
          attendees: attendees || null,
        })
        .eq('id', existingEvent.id)

      if (error) throw error
    } else {
      // Create new event
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id,
          google_event_id: event_id,
          title: summary,
          description: description || null,
          start_time: start,
          end_time: end,
          location: location || null,
          attendees: attendees || null,
        })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Calendar webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
