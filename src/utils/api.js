// This correctly reads the base URL from your .env files
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// --- PUBLIC API ENDPOINTS ---
// For fetching data on your public-facing portfolio. No token required.
export const PUBLIC_API = {
  sections: `${API_BASE_URL}/api/public/sections/unified`,
  personalInfo: `${API_BASE_URL}/api/public/personal-info`,
  experience: `${API_BASE_URL}/api/public/experience`,
  education: `${API_BASE_URL}/api/public/education`,
  skills: `${API_BASE_URL}/api/public/skills`,
  projects: `${API_BASE_URL}/api/public/projects`,
  certifications: `${API_BASE_URL}/api/public/certifications`,
  leadership: `${API_BASE_URL}/api/public/leadership`,
  skills_categories: `${API_BASE_URL}/api/public/skills/categories`
};

// --- ADMIN API ENDPOINTS ---
// For your admin panel. All requests using these (except login) must be authenticated.
export const ADMIN_API = {
  login: `${API_BASE_URL}/api/auth/login`,
  sections: `${API_BASE_URL}/api/admin/sections`,
  sections_reorder: `${API_BASE_URL}/api/admin/sections/unified/reorder`,
  sections_visibility: (sectionType) => `${API_BASE_URL}/api/admin/sections/unified/${sectionType}/visibility`,
  section_content: (sectionId) => `${API_BASE_URL}/api/admin/sections/${sectionId}/content`,
  personalInfo: `${API_BASE_URL}/api/admin/personal-info`,
  experience: `${API_BASE_URL}/api/admin/experience`,
  education: `${API_BASE_URL}/api/admin/education`,
  skills: `${API_BASE_URL}/api/admin/skills`,
  projects: `${API_BASE_URL}/api/admin/projects`,
  certifications: `${API_BASE_URL}/api/admin/certifications`,
  leadership: `${API_BASE_URL}/api/admin/leadership`
};

/**
 * A wrapper for the native fetch API that automatically adds the
 * JWT Authorization header to requests. This should be used for all
 * authenticated (admin) API calls.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Optional fetch options (e.g., method, body).
 * @returns {Promise<any>} - A promise that resolves to the JSON response.
 */
// utils/api.js (append/replace your existing authFetch)
export const authFetch = async (url, options = {}) => {
  const token = (localStorage.getItem('authToken') || '').trim();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('[authFetch] URL:', url);
  console.log('[authFetch] Authorization header:', headers.Authorization);

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // If the token is expired or invalid, auto-logout the user
    if (response.status === 401 || response.status === 403) {
      console.warn('[authFetch] Unauthorized / Forbidden — clearing auth and redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // hard redirect (simpler for utilities)
      window.location.href = '/login';
      return; // never reached normally
    }
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  }
  return null;
};



/**
 * Fetches all the necessary data for rendering the public resume.
 * This function uses the standard `fetch` because it calls public endpoints.
 */
export const fetchAllResumeData = async () => {
  try {
    const endpointsToFetch = [
      PUBLIC_API.sections,
      PUBLIC_API.personalInfo,
      PUBLIC_API.experience,
      PUBLIC_API.education,
      PUBLIC_API.skills,
      PUBLIC_API.projects,
      PUBLIC_API.certifications,
      PUBLIC_API.leadership
    ];

    const responses = await Promise.all(endpointsToFetch.map(url => fetch(url)));

    for (const res of responses) {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} for URL: ${res.url}`);
      }
    }

    const data = await Promise.all(responses.map(res => res.json()));

    return {
      sections: data[0],
      personal: data[1],
      experience: data[2],
      education: data[3],
      skills: data[4],
      projects: data[5],
      certifications: data[6],
      leadership: data[7]
    };
  } catch (error) {
    console.error('Error fetching resume data:', error);
    throw error;
  }
};

// Fire-and-forget warm-up request to reduce cold-start latency.
export const warmUpPublicApi = async () => {
  try {
    await fetch(PUBLIC_API.sections, { cache: 'no-store' });
  } catch (error) {
    console.warn('Warm-up request failed:', error);
  }
};
