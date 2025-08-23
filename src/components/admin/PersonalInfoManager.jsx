import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Linkedin, Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

const PersonalInfoManager = () => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const API_BASE = 'http://localhost:8080/api';

  // s1: Initial data fetch on component mount
  useEffect(() => {
    console.log('🔄 PersonalInfoManager mounted, fetching personal info...');
    fetchPersonalInfo();
  }, []);

  // s1: Track form changes to show unsaved changes indicator
  useEffect(() => {
    if (personalInfo) {
      const hasModifications = Object.keys(formData).some(
        key => formData[key] !== (personalInfo[key] || '')
      );
      setHasChanges(hasModifications);
    }
  }, [formData, personalInfo]);

  // s1: Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // s1: Fetch personal info from backend
  const fetchPersonalInfo = async () => {
    console.log('🚀 fetchPersonalInfo called');
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Making request to:', `${API_BASE}/personal-info`);
      
      const response = await axios.get(`${API_BASE}/personal-info`, {
        timeout: 10000,
      });
      
      console.log('✅ Response received:', response.status);
      console.log('📦 Personal info data:', response.data);
      
      if (response.data) {
        setPersonalInfo(response.data);
        // s1: Initialize form with fetched data
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          location: response.data.location || '',
          linkedinUrl: response.data.linkedinUrl || ''
        });
        console.log('🎉 Successfully loaded personal info');
      } else {
        console.warn('⚠️ No personal info found');
        setError('No personal information found');
      }
      
    } catch (error) {
      console.error('❌ Fetch error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out - please check if the server is running');
      } else if (error.response?.status === 404) {
        setError('Personal info not found - you can create it by filling the form below');
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Cannot connect to server - please check if backend is running on port 8080');
      } else {
        setError(`Unexpected error: ${error.message}`);
      }
      
      // s1: Allow creating new personal info if none exists
      setPersonalInfo(null);
    } finally {
      setLoading(false);
      console.log('✅ fetchPersonalInfo completed');
    }
  };

  // s1: Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // s1: Handle form submission
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (saving) return;
    
    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      const cleanedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        linkedinUrl: formData.linkedinUrl.trim()
      };
      
      // s1: Validate required fields
      if (!cleanedData.name || !cleanedData.email) {
        throw new Error('Name and email are required');
      }
      
      // s1: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanedData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // s1: Validate LinkedIn URL format if provided
      if (cleanedData.linkedinUrl && !cleanedData.linkedinUrl.includes('linkedin.com')) {
        throw new Error('Please enter a valid LinkedIn URL');
      }
      
      console.log('Submitting personal info:', cleanedData);
      
      let response;
      if (personalInfo?.id) {
        // s1: Update existing record
        response = await axios.put(`${API_BASE}/personal-info/${personalInfo.id}`, cleanedData);
      } else {
        // s1: Create new record
        response = await axios.post(`${API_BASE}/personal-info`, cleanedData);
      }
      
      setPersonalInfo(response.data);
      setSuccess(true);
      setHasChanges(false);
      console.log('✅ Personal info saved successfully');
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save personal information');
    } finally {
      setSaving(false);
    }
  };

  // s1: Reset form to original values
  const handleReset = () => {
    if (personalInfo) {
      setFormData({
        name: personalInfo.name || '',
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        location: personalInfo.location || '',
        linkedinUrl: personalInfo.linkedinUrl || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedinUrl: ''
      });
    }
    setHasChanges(false);
  };

  // s1: Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading personal information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* s1: Header section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-admin-text mb-2">Personal Information</h1>
            <p className="text-admin-text/70">
              Manage your personal details and contact information
            </p>
          </div>
          {/* s1: Status indicators */}
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
            {success && (
              <span className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Changes saved!
              </span>
            )}
          </div>
        </div>
        <div className="w-16 h-0.5 bg-admin-accent"></div>
      </div>

      {/* s1: Error message */}
      {error && !personalInfo && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Notice</h3>
              <p className="text-amber-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {error && personalInfo && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-medium mb-1">Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* s1: Personal info form */}
      <div className="bg-admin-card rounded-lg border border-admin-border p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* s1: Name field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-admin-text mb-3">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-4 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200 text-lg"
              placeholder="MANAMRIT SINGH"
              disabled={saving}
            />
          </div>

          {/* s1: Email field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-admin-text mb-3">
              <Mail className="w-4 h-4" />
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-4 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200 text-lg"
              placeholder="manamritsingh@nyu.edu"
              disabled={saving}
            />
          </div>

          {/* s1: Phone and Location row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-admin-text mb-3">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-4 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="+1 914-240-3805"
                disabled={saving}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-admin-text mb-3">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-4 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="New York City"
                disabled={saving}
              />
            </div>
          </div>

          {/* s1: LinkedIn URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-admin-text mb-3">
              <Linkedin className="w-4 h-4" />
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              className="w-full px-4 py-4 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="https://www.linkedin.com/in/manamritsingh/"
              disabled={saving}
            />
            <p className="text-xs text-admin-text/50 mt-2">
              Enter your full LinkedIn profile URL
            </p>
          </div>

          {/* s1: Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-admin-border">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-6 py-3 text-admin-text/80 border border-admin-border rounded-lg hover:bg-admin-text/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Changes
            </button>

            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-8 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-admin-bg"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {personalInfo ? 'Update Information' : 'Create Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* s1: Info card about the data */}
      <div className="mt-6 p-4 bg-admin-accent/5 border border-admin-accent/20 rounded-lg">
        <p className="text-admin-text/70 text-sm">
          <strong className="text-admin-accent">Note:</strong> This information will appear at the top of your resume. 
          Make sure it's accurate and up-to-date as it's how potential employers will contact you.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoManager;
