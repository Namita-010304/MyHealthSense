const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ access_token: string }>('/auth/login', credentials),

  register: (userData: { email: string; password: string }) =>
    apiClient.post<{ access_token: string }>('/auth/register', userData),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (profileData: any) => apiClient.put('/auth/profile', profileData),

  deleteProfile: () => apiClient.delete('/auth/profile'),
}

// Health API
export const healthAPI = {
  getWeeklySummary: () => apiClient.get('/health/weekly-summary'),
}

// Insights API
export const insightsAPI = {
  getWeeklyInsights: () => apiClient.get('/insights/weekly'),
}

// Diet API
export const dietAPI = {
  getMyDiets: () => apiClient.get('/diets/me'),
  createDiet: (diet: any) => apiClient.post('/diets/', diet),
  updateDiet: (id: number, diet: any) => apiClient.put(`/diets/${id}`, diet),
  deleteDiet: (id: number) => apiClient.delete(`/diets/${id}`),
}

// Symptom API
export const symptomAPI = {
  getMySymptoms: () => apiClient.get('/symptoms/me'),
  createSymptom: (symptom: any) => apiClient.post('/symptoms/', symptom),
  updateSymptom: (id: number, symptom: any) => apiClient.put(`/symptoms/${id}`, symptom),
  deleteSymptom: (id: number) => apiClient.delete(`/symptoms/${id}`),
}

// Medication API
export const medicationAPI = {
  getMyMedications: () => apiClient.get('/medications/me'),
  createMedication: (medication: any) => apiClient.post('/medications/', medication),
  updateMedication: (id: number, medication: any) => apiClient.put(`/medications/${id}`, medication),
  deleteMedication: (id: number) => apiClient.delete(`/medications/${id}`),
}

// Lifestyle API
export const lifestyleAPI = {
  getMyLifestyle: () => apiClient.get('/lifestyles/me'),
  createLifestyle: (lifestyle: any) => apiClient.post('/lifestyles/', lifestyle),
  updateLifestyle: (id: number, lifestyle: any) => apiClient.put(`/lifestyles/${id}`, lifestyle),
  deleteLifestyle: (id: number) => apiClient.delete(`/lifestyles/${id}`),
}

// AI Chat API
export const aiChatAPI = {
  sendMessage: (message: string) => apiClient.post('/ai/chat', { message }),
}

// AI Insights API
export const aiInsightsAPI = {
  getInsights: () => apiClient.get('/ai-insights/insights'),
}