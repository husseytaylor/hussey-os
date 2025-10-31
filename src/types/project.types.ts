import type { Client } from './client.types'

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ObjectiveStatus = 'pending' | 'in_progress' | 'completed'

export interface Project {
  id: string
  user_id: string
  client_id: string | null
  name: string
  description: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface ProjectObjective {
  id: string
  project_id: string
  title: string
  description: string | null
  status: ObjectiveStatus
  notes: string | null
  image_urls: string[] | null
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  name: string
  description?: string
  client_id?: string
  status?: ProjectStatus
  start_date?: string
  end_date?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  client_id?: string
  status?: ProjectStatus
  start_date?: string
  end_date?: string
}

export interface CreateObjectiveInput {
  project_id: string
  title: string
  description?: string
  status?: ObjectiveStatus
  notes?: string
}

export interface UpdateObjectiveInput {
  title?: string
  description?: string
  status?: ObjectiveStatus
  notes?: string
  image_urls?: string[]
}

// For displaying projects with client info
export interface ProjectWithClient extends Project {
  client?: Client
}

// For displaying projects with objectives
export interface ProjectWithObjectives extends Project {
  objectives?: ProjectObjective[]
}
