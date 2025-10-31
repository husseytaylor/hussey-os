export interface Whiteboard {
  id: string
  user_id: string
  name: string
  description: string | null
  snapshot: any // TLDraw snapshot data
  created_at: string
  updated_at: string
}

export interface CreateWhiteboardInput {
  name: string
  description?: string
  snapshot?: any
}

export interface UpdateWhiteboardInput {
  name?: string
  description?: string
  snapshot?: any
}
