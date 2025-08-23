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
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Briefcase, MapPin, Calendar } from 'lucide-react';

const ExperienceManager = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  const API_BASE = 'http://localhost:8080/api';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // s1: Initial data fetch on component mount
  useEffect(() => {
    console.log('🔄 ExperienceManager mounted, fetching experiences...');
    fetchExperiences();
  }, []);

  // s1: Fetch experiences from backend
  const fetchExperiences = async () => {
    console.log('🚀 fetchExperiences called');
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Making request to:', `${API_BASE}/experience`);
      
      const response = await axios.get(`${API_BASE}/experience`, {
        timeout: 10000,
      });
      
      console.log('✅ Response received:', response.status);
      console.log('📦 Experience data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setExperiences(response.data);
        console.log(`🎉 Successfully loaded ${response.data.length} experiences`);
      } else {
        console.warn('⚠️ API returned non-array data:', response.data);
        setExperiences([]);
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
      
      setExperiences([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchExperiences completed');
    }
  };

  // s1: Handle drag and drop reordering
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = experiences.findIndex((item) => item.id.toString() === active.id);
      const newIndex = experiences.findIndex((item) => item.id.toString() === over.id);

      const newExperiences = arrayMove(experiences, oldIndex, newIndex);
      setExperiences(newExperiences);

      const updatedItems = newExperiences.map((item, index) => ({
        ...item,
        orderIndex: index + 1
      }));

      try {
        await Promise.all(
          updatedItems.map(item =>
            axios.put(`${API_BASE}/experience/${item.id}`, item)
          )
        );
        fetchExperiences();
      } catch (error) {
        console.error('Error updating order:', error);
        fetchExperiences();
      }
    }
  };

  // s1: Handle create/update experience
  const handleSave = async (experienceData) => {
    try {
      if (editingExperience) {
        await axios.put(`${API_BASE}/experience/${editingExperience.id}`, experienceData);
      } else {
        await axios.post(`${API_BASE}/experience`, experienceData);
      }
      
      setShowForm(false);
      setEditingExperience(null);
      fetchExperiences();
    } catch (error) {
      console.error('Error saving experience:', error);
      throw error;
    }
  };

  // s1: Handle delete experience
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await axios.delete(`${API_BASE}/experience/${id}`);
        fetchExperiences();
      } catch (error) {
        console.error('Error deleting experience:', error);
      }
    }
  };

  // s1: Toggle experience visibility
  const toggleVisibility = async (experience) => {
    try {
      await axios.put(`${API_BASE}/experience/${experience.id}`, {
        ...experience,
        visible: !experience.visible
      });
      fetchExperiences();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // s1: Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading experiences...</p>
      </div>
    );
  }

  // s1: Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">Failed to Load Experiences</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchExperiences}
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
          <h1 className="text-3xl font-bold text-admin-text mb-2">Experience</h1>
          <p className="text-admin-text/70">
            {experiences.length > 0 
              ? `Manage your ${experiences.length} work experiences - drag to reorder`
              : 'No experiences found - add your first experience below'
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </button>
      </div>

      {/* s1: Experience list or empty state */}
      {experiences.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-admin-accent/10 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-admin-accent" />
          </div>
          <p className="text-admin-text/50 mb-4">No work experiences to display</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-admin-accent hover:text-admin-accent/80 font-medium"
          >
            Add your first experience
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={experiences.map(e => e.id.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {experiences.map((experience) => (
                <SortableExperience
                  key={experience.id}
                  experience={experience}
                  onEdit={(experience) => {
                    setEditingExperience(experience);
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

      {/* s1: Experience form modal */}
      {showForm && (
        <ExperienceForm
          experience={editingExperience}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingExperience(null);
          }}
        />
      )}
    </div>
  );
};

// s1: Sortable Experience Card Component
const SortableExperience = ({ experience, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
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
            {/* s1: Position and company */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-semibold text-admin-text">
                {experience.position}
              </h3>
              <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                #{experience.orderIndex}
              </span>
              {/* s1: Status badge for current/past */}
              {experience.status === 'Current' && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                  Current
                </span>
              )}
              <button
                onClick={() => onToggleVisibility(experience)}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  experience.visible 
                    ? 'text-admin-accent hover:bg-admin-accent/10' 
                    : 'text-admin-text/40 hover:bg-admin-text/10'
                }`}
              >
                {experience.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* s1: Company and location info */}
            <div className="flex items-center gap-4 mb-3 text-admin-text/80">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{experience.company}</span>
              </div>
              {experience.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{experience.location}</span>
                </div>
              )}
              {experience.duration && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{experience.duration}</span>
                </div>
              )}
            </div>
            
            {/* s1: Bullet points */}
            {experience.bulletPoints && experience.bulletPoints.length > 0 && (
              <ul className="text-sm text-admin-text/70 space-y-2 mb-4 text-left">
                {experience.bulletPoints.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start">
                    <span className="text-admin-accent mr-2 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* s1: Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(experience)}
            className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(experience.id)}
            className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// s1: Experience Form Component
const ExperienceForm = ({ experience, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    duration: '',
    location: '',
    status: '',
    bulletPoints: [''],
    visible: true,
    orderIndex: null,
    ...experience
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
        bulletPoints: formData.bulletPoints
          .filter(point => point && point.trim() !== '')
          .map(point => point.trim()),
        position: formData.position.trim(),
        company: formData.company.trim(),
        duration: formData.duration?.trim() || '',
        location: formData.location?.trim() || '',
        status: formData.status?.trim() || '',
        visible: Boolean(formData.visible),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : null
      };
      
      if (!cleanedData.position || !cleanedData.company) {
        throw new Error('Position and company are required');
      }
      
      console.log('Submitting experience data:', cleanedData);
      
      await onSave(cleanedData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save experience');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBulletPoint = () => {
    setFormData({
      ...formData,
      bulletPoints: [...formData.bulletPoints, '']
    });
  };

  const updateBulletPoint = (index, value) => {
    const newBulletPoints = [...formData.bulletPoints];
    newBulletPoints[index] = value;
    setFormData({
      ...formData,
      bulletPoints: newBulletPoints
    });
  };

  const removeBulletPoint = (index) => {
    if (formData.bulletPoints.length > 1) {
      setFormData({
        ...formData,
        bulletPoints: formData.bulletPoints.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-semibold text-admin-text">
            {experience ? 'Edit Experience' : 'Add New Experience'}
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
                Position *
              </label>
              <input
                type="text"
                required
                value={formData.position || ''}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="Software Engineer Intern"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Company *
              </label>
              <input
                type="text"
                required
                value={formData.company || ''}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="Reliable Power Alternatives Corp"
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
                placeholder="May 2025 - Aug 2025"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Status
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                disabled={isSubmitting}
              >
                <option value="">Select status</option>
                <option value="Current">Current</option>
                <option value="Past">Past</option>
              </select>
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
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-admin-text">
                Key Achievements
              </label>
              <button
                type="button"
                onClick={addBulletPoint}
                className="text-admin-accent hover:text-admin-accent/80 text-sm font-medium"
                disabled={isSubmitting}
              >
                + Add Achievement
              </button>
            </div>
            {formData.bulletPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <textarea
                  value={point || ''}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  rows="2"
                  className="flex-1 px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                  placeholder="Enter key achievement..."
                  disabled={isSubmitting}
                />
                {formData.bulletPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBulletPoint(index)}
                    className="text-red-400 hover:text-red-300 p-2"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
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
              {isSubmitting ? 'Saving...' : (experience ? 'Update Experience' : 'Create Experience')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceManager;
