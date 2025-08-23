import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, GraduationCap, MapPin, Calendar } from 'lucide-react';

const EducationManager = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);

  const API_BASE = 'http://localhost:8080/api';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // s1: Initial data fetch on component mount
  useEffect(() => {
    console.log('🔄 EducationManager mounted, fetching education...');
    fetchEducation();
  }, []);

  // s1: Fetch education from backend
  const fetchEducation = async () => {
    console.log('🚀 fetchEducation called');
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Making request to:', `${API_BASE}/education`);
      
      const response = await axios.get(`${API_BASE}/education`, {
        timeout: 10000,
      });
      
      console.log('✅ Response received:', response.status);
      console.log('📦 Education data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setEducation(response.data);
        console.log(`🎉 Successfully loaded ${response.data.length} education entries`);
      } else {
        console.warn('⚠️ API returned non-array data:', response.data);
        setEducation([]);
        setError('Invalid data format received from server');
      }
      
    } catch (error) {
      console.error('❌ Fetch error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out - please check if the server is running');
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Cannot connect to server - please check if backend is running on port 8080');
      } else {
        setError(`Unexpected error: ${error.message}`);
      }
      
      setEducation([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchEducation completed');
    }
  };

  // s1: Handle drag and drop reordering
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = education.findIndex((item) => item.id.toString() === active.id);
      const newIndex = education.findIndex((item) => item.id.toString() === over.id);

      const newEducation = arrayMove(education, oldIndex, newIndex);
      setEducation(newEducation);

      const updatedItems = newEducation.map((item, index) => ({
        ...item,
        orderIndex: index + 1
      }));

      try {
        await Promise.all(
          updatedItems.map(item =>
            axios.put(`${API_BASE}/education/${item.id}`, item)
          )
        );
        fetchEducation();
      } catch (error) {
        console.error('Error updating order:', error);
        fetchEducation();
      }
    }
  };

  // s1: Handle create/update education
  const handleSave = async (educationData) => {
    try {
      if (editingEducation) {
        await axios.put(`${API_BASE}/education/${editingEducation.id}`, educationData);
      } else {
        await axios.post(`${API_BASE}/education`, educationData);
      }
      
      setShowForm(false);
      setEditingEducation(null);
      fetchEducation();
    } catch (error) {
      console.error('Error saving education:', error);
      throw error;
    }
  };

  // s1: Handle delete education
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      try {
        await axios.delete(`${API_BASE}/education/${id}`);
        fetchEducation();
      } catch (error) {
        console.error('Error deleting education:', error);
      }
    }
  };

  // s1: Toggle education visibility
  const toggleVisibility = async (edu) => {
    try {
      await axios.put(`${API_BASE}/education/${edu.id}`, {
        ...edu,
        visible: !edu.visible
      });
      fetchEducation();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // s1: Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading education...</p>
      </div>
    );
  }

  // s1: Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">Failed to Load Education</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchEducation}
            className="bg-admin-accent text-admin-bg px-4 py-2 rounded-lg hover:bg-admin-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* s1: Header section */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-admin-text mb-2">Education</h1>
          <p className="text-admin-text/70">
            {education.length > 0 
              ? `Manage your ${education.length} education entries - drag to reorder`
              : 'No education entries found - add your first degree below'
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </button>
      </div>

      {/* s1: Education list or empty state */}
      {education.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-admin-accent/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-admin-accent" />
          </div>
          <p className="text-admin-text/50 mb-4">No education entries to display</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-admin-accent hover:text-admin-accent/80 font-medium"
          >
            Add your first degree
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={education.map(e => e.id.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {education.map((edu) => (
                <SortableEducation
                  key={edu.id}
                  education={edu}
                  onEdit={(edu) => {
                    setEditingEducation(edu);
                    setShowForm(true);
                  }}
                  onDelete={handleDelete}
                  onToggleVisibility={toggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* s1: Education form modal */}
      {showForm && (
        <EducationForm
          education={editingEducation}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingEducation(null);
          }}
        />
      )}
    </div>
  );
};

// s1: Sortable Education Card Component
const SortableEducation = ({ education, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: education.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  // s1: Helper to determine degree level
  const getDegreeLevel = (degree) => {
    const lower = degree.toLowerCase();
    if (lower.includes('phd') || lower.includes('ph.d') || lower.includes('doctorate')) return 'PhD';
    if (lower.includes('ms') || lower.includes('master') || lower.includes('m.s')) return 'Masters';
    if (lower.includes('mba') || lower.includes('management') || lower.includes('business')) return 'MBA';
    if (lower.includes('b.e') || lower.includes('bachelor') || lower.includes('b.s') || lower.includes('b.tech')) return 'Bachelors';
    return 'Other';
  };

  const degreeLevel = getDegreeLevel(education.degree);
  const levelColors = {
    'PhD': 'bg-purple-500/20 text-purple-400',
    'Masters': 'bg-blue-500/20 text-blue-400',
    'MBA': 'bg-pink-500/20 text-pink-400',
    'Bachelors': 'bg-green-500/20 text-green-400',
    'Other': 'bg-gray-500/20 text-gray-400'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-admin-card rounded-lg border border-admin-border p-6 card-hover ${
        isDragging ? 'shadow-2xl ring-2 ring-admin-accent/50 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* s1: Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 p-2 hover:bg-admin-accent/10 rounded cursor-move transition-colors duration-200"
          >
            <GripVertical className="w-4 h-4 text-admin-text/60 hover:text-admin-accent" />
          </div>
          
          <div className="flex-1 text-left">
            {/* s1: Degree and level */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-semibold text-admin-text">
                {education.degree}
              </h3>
              <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                #{education.orderIndex}
              </span>
              {/* s1: Degree level badge */}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelColors[degreeLevel]}`}>
                {degreeLevel}
              </span>
              <button
                onClick={() => onToggleVisibility(education)}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  education.visible 
                    ? 'text-admin-accent hover:bg-admin-accent/10' 
                    : 'text-admin-text/40 hover:bg-admin-text/10'
                }`}
              >
                {education.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* s1: Institution and duration info */}
            <div className="flex items-center gap-4 mb-3 text-admin-text/80">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium">{education.institution}</span>
              </div>
              {education.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{education.location}</span>
                </div>
              )}
              {education.duration && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{education.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* s1: Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(education)}
            className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(education.id)}
            className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// s1: Education Form Component
const EducationForm = ({ education, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    duration: '',
    location: '',
    visible: true,
    orderIndex: null,
    ...education
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const cleanedData = {
        ...formData,
        degree: formData.degree.trim(),
        institution: formData.institution.trim(),
        duration: formData.duration?.trim() || '',
        location: formData.location?.trim() || '',
        visible: Boolean(formData.visible),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : null
      };
      
      if (!cleanedData.degree || !cleanedData.institution) {
        throw new Error('Degree and institution are required');
      }
      
      console.log('Submitting education data:', cleanedData);
      
      await onSave(cleanedData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save education');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-semibold text-admin-text">
            {education ? 'Edit Education' : 'Add New Education'}
          </h2>
          <div className="w-8 h-0.5 bg-admin-accent mt-2"></div>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Degree *
              </label>
              <input
                type="text"
                required
                value={formData.degree || ''}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="MS Computer Science"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Institution *
              </label>
              <input
                type="text"
                required
                value={formData.institution || ''}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="New York University"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="Expected 2026"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="New York, NY"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Order Position (optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.orderIndex || ''}
              onChange={(e) => setFormData({...formData, orderIndex: e.target.value ? parseInt(e.target.value) : null})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Leave blank for auto-ordering"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="visible"
              checked={Boolean(formData.visible)}
              onChange={(e) => setFormData({...formData, visible: e.target.checked})}
              className="mr-3 accent-admin-accent"
              disabled={isSubmitting}
            />
            <label htmlFor="visible" className="text-sm text-admin-text">
              Visible on resume
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-admin-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-admin-text/80 border border-admin-border rounded-lg hover:bg-admin-text/5 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (education ? 'Update Education' : 'Create Education')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationManager;
