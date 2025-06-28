export interface SignupRequest {
  first_name: string;
  last_name: string;
  age: number;
  sex: 'Male' | 'Female';
  email: string;
  username: string;
  password: string;
}

export interface EntityUpdateStatusResponse {
  message: string;
  entity_id: string;
}

const API_BASE_URL = '/api'

// Types
export interface Event {
  event_id: string
  user_id: string
  image_url: string
  start_date: string
  end_date: string
  description: string
  volunteer_form: string[]
  applications: string[] // Added this based on your event response
  category: string
  org_title: string
  country: string
  region: string
  city: string
  created_at?: string
  updated_at?: string
}

export interface Application {
  application_id: string
  user_id: string
  event_id: string
  answers: string[]
  status: 'pending' | 'accepted' | 'denied' | 'canceled'
  created_at?: string
  updated_at?: string
}

export interface User {
  user_id: string;          
  first_name: string;
  last_name: string;
  age: number;
  sex: 'Male' | 'Female';
  email: string;
  username: string;
  password: string;
  applications: string[];
  events: string[];
}

// API Functions
export const api = {
  // Events
  async getEvents(userId?: string, page = 1): Promise<Event[]> {
    const params = new URLSearchParams()
    if (userId) params.set('creator_id', userId)
    if (page) params.set('page', String(page))
    const response = await fetch(`${API_BASE_URL}/events/loadMany?${params.toString()}`)
    if (!response.ok) throw new Error('Failed to fetch events')
    return response.json()
  },

  async getEvent(id: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/load?entity_id=${id}`)
    if (!response.ok) throw new Error('Failed to fetch event')
    return response.json()
  },

  async createEvent(eventData: Omit<Event, 'event_id' | 'created_at' | 'updated_at'>): Promise<{ entity_id: string }> {
    const response = await fetch(`${API_BASE_URL}/events/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
    if (!response.ok) throw new Error('Failed to create event')
    return response.json()
  },

  async updateEvent(eventData: Partial<Event> & { event_id: string }): Promise<{ entity_id: string }> {
    const response = await fetch(`${API_BASE_URL}/events/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
    if (!response.ok) throw new Error('Failed to update event')
    return response.json()
  },

  // Applications
  async loadApplication(entityId: string): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/applications/load?entity_id=${encodeURIComponent(entityId)}`)
    if (!response.ok) throw new Error(`Failed to load application ${entityId}`)
    console.log(response)
    return response.json()
  },

  async createApplication(applicationData: {
    user_id: string
    event_id: string
    answers: string[]
  }): Promise<{ entity_id: string }> {
    const response = await fetch(`${API_BASE_URL}/applications/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    })
    if (!response.ok) throw new Error('Failed to create application')
    return response.json()
  },

  async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<EntityUpdateStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/applications/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: applicationId,
        updated_application_status: status
      })
    })
    if (!response.ok) throw new Error('Failed to update application status')
    return response.json()
  },

  async getMySubmissions(userId: string): Promise<Application[]> {
    const user = await this.getUser(userId);
    return Promise.all(user.applications.map(appId => this.loadApplication(appId)));
  },

  // Users
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/load?entity_id=${id}`)
    if (!response.ok) throw new Error('Failed to fetch user')
    return response.json()
  },

  async getRandomUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/random`)
    if (!response.ok) throw new Error('Failed to fetch random user')
    return response.json()
  },

  async registerUser(req: SignupRequest): Promise<EntityUpdateStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    })
    if (!response.ok) throw new Error('Failed to register user')
    return response.json()
  }
}