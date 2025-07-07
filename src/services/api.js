const API_BASE_URL = 'http://192.168.0.10:8080';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Kullanıcı girişi
  async login(credentials) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Çıkış
  logout() {
    this.clearToken();
  }

  // Malzeme talebi ekleme (Flask endpoint'e uygun)
  async addMaterialRequest(materialData) {
    return this.request('/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: materialData.name || "Kullanıcı",
        company: materialData.company || "Kurum",
        material: materialData.materialName || materialData.material,
        amount: materialData.quantity || materialData.amount,
        location: materialData.location || ""
      }),
    });
  }

  // Tüm malzeme talepleri
  async getMaterialRequests() {
    return this.request('/api/data');
  }

  // Kullanıcının kendi talepleri
  async getMyMaterialRequests() {
    return this.request('/my-material-requests');
  }

  // Token kontrolü
  isAuthenticated() {
    return !!this.token;
  }
}

export default new ApiService(); 