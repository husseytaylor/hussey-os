export interface CalendarEvent {
  id: string
  user_id: string
  google_event_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  attendees: Attendee[] | null
  created_at: string
  updated_at: string
}

export interface Attendee {
  email: string
  name?: string
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction'
}

export interface CreateEventInput {
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  attendees?: Attendee[]
}

export interface UpdateEventInput {
  title?: string
  description?: string
  start_time?: string
  end_time?: string
  location?: string
  attendees?: Attendee[]
}

// For react-big-calendar
export interface CalendarEventView {
  id: string
  title: string
  start: Date
  end: Date
  resource?: CalendarEvent
}
