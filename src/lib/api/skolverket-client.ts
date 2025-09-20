/**
 * Skolverket Syllabus API Client
 * OpenAPI-generated types and client for Swedish curriculum data
 * 
 * Based on: https://api.skolverket.se/syllabus/openapi.json
 */

// Core Skolverket API types based on OpenAPI specification
export interface SkolaverketSubject {
  code: string;
  name: string;
  description?: string;
  category?: string;
  schoolType: 'grundskola' | 'gymnasium';
}

export interface CentralContent {
  id: string;
  subjectCode: string;
  gradeSpan: string; // "1-3", "4-6", "7-9", etc.
  title: string;
  body: string;
  sourceUrl?: string;
  version?: string;
}

export interface KnowledgeRequirement {
  id: string;
  subjectCode: string;
  gradeSpan: string;
  gradeLevel: 'E' | 'C' | 'A'; // E=godkänd, C=väl godkänd, A=mycket väl godkänd
  body: string;
  sourceUrl?: string;
  version?: string;
}

export interface ApiResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
  metadata?: {
    version: string;
    lastModified: string;
    etag?: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Skolverket API Client with retry and caching
 */
export class SkolverketApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.SYLLABUS_BASE_URL || 'https://api.skolverket.se/syllabus';
    this.defaultHeaders = {
      'Accept': 'application/json',
      'User-Agent': 'Skolapp-v3/1.0 (Educational Quiz Platform)',
    };
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    };
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithRetry(
    url: string, 
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    const fullUrl = `${this.baseUrl}${url}`;
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      // If rate limited, wait and retry
      if (response.status === 429 && retryCount < this.retryConfig.maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : Math.min(
              this.retryConfig.baseDelay * Math.pow(2, retryCount),
              this.retryConfig.maxDelay
            );
        
        console.warn(`Rate limited, retrying after ${delay}ms (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      // For other 5xx errors, retry with exponential backoff
      if (response.status >= 500 && retryCount < this.retryConfig.maxRetries) {
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, retryCount),
          this.retryConfig.maxDelay
        );
        
        console.warn(`Server error ${response.status}, retrying after ${delay}ms (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      return response;
    } catch (error) {
      if (retryCount < this.retryConfig.maxRetries) {
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, retryCount),
          this.retryConfig.maxDelay
        );
        
        console.warn(`Network error, retrying after ${delay}ms (attempt ${retryCount + 1}):`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Get all subjects from Skolverket API
   */
  async getSubjects(schoolType?: 'grundskola' | 'gymnasium'): Promise<SkolaverketSubject[]> {
    const params = new URLSearchParams();
    if (schoolType) params.set('schoolType', schoolType);
    
    const response = await this.fetchWithRetry(`/subjects?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.status} ${response.statusText}`);
    }
    
    const result: ApiResponse<SkolaverketSubject> = await response.json();
    return result.data;
  }

  /**
   * Get central content for a subject and grade span
   */
  async getCentralContent(
    subjectCode: string, 
    gradeSpan?: string,
    page = 1,
    limit = 100
  ): Promise<ApiResponse<CentralContent>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (gradeSpan) params.set('gradeSpan', gradeSpan);
    
    const response = await this.fetchWithRetry(
      `/subjects/${encodeURIComponent(subjectCode)}/central-content?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch central content: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get knowledge requirements for a subject and grade span
   */
  async getKnowledgeRequirements(
    subjectCode: string,
    gradeSpan?: string,
    page = 1,
    limit = 100
  ): Promise<ApiResponse<KnowledgeRequirement>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (gradeSpan) params.set('gradeSpan', gradeSpan);
    
    const response = await this.fetchWithRetry(
      `/subjects/${encodeURIComponent(subjectCode)}/knowledge-requirements?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch knowledge requirements: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get all curriculum data for a subject (paginated)
   */
  async getSubjectCurriculum(subjectCode: string): Promise<{
    subject: SkolaverketSubject;
    centralContent: CentralContent[];
    knowledgeRequirements: KnowledgeRequirement[];
  }> {
    // Fetch subject info
    const subjects = await this.getSubjects();
    const subject = subjects.find(s => s.code === subjectCode);
    
    if (!subject) {
      throw new Error(`Subject not found: ${subjectCode}`);
    }

    // Fetch all central content (handle pagination)
    const centralContent: CentralContent[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await this.getCentralContent(subjectCode, undefined, page, 100);
      centralContent.push(...response.data);
      hasMore = response.pagination?.hasNext ?? false;
      page++;
    }

    // Fetch all knowledge requirements (handle pagination)
    const knowledgeRequirements: KnowledgeRequirement[] = [];
    page = 1;
    hasMore = true;
    
    while (hasMore) {
      const response = await this.getKnowledgeRequirements(subjectCode, undefined, page, 100);
      knowledgeRequirements.push(...response.data);
      hasMore = response.pagination?.hasNext ?? false;
      page++;
    }

    return {
      subject,
      centralContent,
      knowledgeRequirements,
    };
  }

  /**
   * Health check - verify API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry('/health', {}, 0); // No retries for health check
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const skolverketApi = new SkolverketApiClient();