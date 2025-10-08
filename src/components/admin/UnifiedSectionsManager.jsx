import React, { useState, useEffect } from 'react';
import axios from '../../../src/utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
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
import { 
  Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Settings, ChevronRight, 
  User, Briefcase, GraduationCap, Code, FolderOpen, Award, Users, Database
} from 'lucide-react';

const UnifiedSectionsManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:8080/api';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, []);

  // s1: Fetch unified sections
  const fetchSections = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE}/admin/sections/unified`, { timeout: 10000 });
      
      if (response.data && Array.isArray(response.data)) {
        setSections(response.data);
      } else {
        setSections([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out - please check if the server is running');
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Cannot connect to server - please check if backend is running on port 8080');
      } else {
        setError(`Unexpected error: ${error.message}`);
      }
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // s1: Handle drag and drop reordering
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((item) => item.id?.toString() === active.id || item.sectionType === active.id);
      const newIndex = sections.findIndex((item) => item.id?.toString() === over.id || item.sectionType === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Update order indices
      const updatedSections = newSections.map((item, index) => ({
        ...item,
        orderIndex: index + 1
      }));

      try {
        await axios.put(`${API_BASE}/admin/sections/unified/reorder`, updatedSections);
        fetchSections(); // Refresh to ensure consistency
      } catch (error) {
        console.error('Error updating order:', error);
        fetchSections(); // Revert on error
      }
    }
  };

  // s1: Handle section navigation
  const handleSectionClick = (section) => {
    if (section.isDynamic) {
      // Navigate to dynamic content manager
      navigate(`/admin/sections/${section.id}/content`);
    } else {
      // Navigate to fixed section manager
      navigate(section.route);
    }
  };

  // s1: Handle section deletion (only for dynamic sections)
  const handleDelete = async (section) => {
    if (!section.isDynamic) {
      alert('Cannot delete fixed sections');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${section.sectionName}"? All content within this section will also be deleted.`)) {
      try {
        await axios.delete(`${API_BASE}/admin/sections/${section.id}`);
        fetchSections();
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  // s1: Toggle section visibility
  const toggleVisibility = async (section) => {
    try {
      if (section.isDynamic) {
        // Toggle dynamic section visibility
        await axios.put(`${API_BASE}/admin/sections/${section.id}`, {
          ...section,
          visible: !section.visible
        });
      } else {
        // Toggle fixed section visibility
        await axios.put(`${API_BASE}/admin/sections/unified/${section.sectionType}/visibility`);
      }
      fetchSections();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // s1: Get appropriate icon for section type
  const getSectionIcon = (sectionType) => {
    const iconMap = {
      'personal-info': User,
      'experience': Briefcase,
      'education': GraduationCap,
      'skills': Code,
      'projects': FolderOpen,
      'certifications': Award,
      'leadership': Users,
      'dynamic': Database
    };
    return iconMap[sectionType] || Settings;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading all sections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">Failed to Load Sections</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchSections}
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
          <h1 className="text-3xl font-bold text-admin-text mb-2">All Resume Sections</h1>
          <p className="text-admin-text/70">
            Manage and reorder all sections of your resume - both fixed and custom sections
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Section
        </button>
      </div>

      {/* s1: Info about fixed vs dynamic sections */}
      <div className="mb-6 p-4 bg-admin-accent/5 border border-admin-accent/20 rounded-lg">
        <p className="text-admin-text/70 text-sm">
          <strong className="text-admin-accent">Fixed sections</strong> (Personal Info, Experience, etc.) have dedicated managers. 
          <strong className="text-admin-accent"> Custom sections</strong> use the flexible content manager. 
          Drag any section to reorder your entire resume layout.
        </p>
      </div>

      {/* s1: Sections list */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sections.map(s => s.id?.toString() || s.sectionType)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <SortableUnifiedSection
                key={section.id || section.sectionType}
                section={section}
                icon={getSectionIcon(section.sectionType)}
                onClick={() => handleSectionClick(section)}
                onDelete={handleDelete}
                onToggleVisibility={toggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* s1: Add custom section form */}
      {showForm && (
        <CustomSectionForm
          onSave={async (sectionData) => {
            try {
              await axios.post(`${API_BASE}/admin/sections`, sectionData);
              setShowForm(false);
              fetchSections();
            } catch (error) {
              console.error('Error creating section:', error);
              throw error;
            }
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

// s1: Sortable Unified Section Component
const SortableUnifiedSection = ({ section, icon: Icon, onClick, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id?.toString() || section.sectionType });

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
          <div
            {...attributes}
            {...listeners}
            className="mt-1 p-2 hover:bg-admin-accent/10 rounded cursor-move transition-colors duration-200"
          >
            <GripVertical className="w-4 h-4 text-admin-text/60 hover:text-admin-accent" />
          </div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-5 h-5 text-admin-accent" />
              <h3 className="text-xl font-semibold text-admin-text">
                {section.sectionName}
              </h3>
              <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                #{section.orderIndex}
              </span>
              {!section.isDynamic && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium">
                  Fixed
                </span>
              )}
              {section.isDynamic && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                  Custom
                </span>
              )}
              <button
                onClick={() => onToggleVisibility(section)}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  section.visible 
                    ? 'text-admin-accent hover:bg-admin-accent/10' 
                    : 'text-admin-text/40 hover:bg-admin-text/10'
                }`}
              >
                {section.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <p className="text-admin-text/80 mb-3 text-left">{section.description}</p>
            
            <div className="flex items-center gap-4 text-admin-text/60 text-sm">
              <span>{section.contentCount} items</span>
              <span>•</span>
              <span>{section.isDynamic ? 'Custom section' : 'System section'}</span>
            </div>
          </div>
        </div>
        
        {/* s1: Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onClick}
            className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
            title="Manage Content"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {section.isDynamic && (
            <button
              onClick={() => onDelete(section)}
              className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
              title="Delete Section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// s1: Simple form for adding custom sections
const CustomSectionForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sectionName: '',
    description: '',
    visible: true
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
        sectionName: formData.sectionName.trim(),
        description: formData.description?.trim() || '',
        visible: Boolean(formData.visible)
      };
      
      if (!cleanedData.sectionName) {
        throw new Error('Section name is required');
      }
      
      await onSave(cleanedData);
    } catch (error) {
      setError(error.message || 'Failed to create section');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-semibold text-admin-text">Add Custom Section</h2>
          <div className="w-8 h-0.5 bg-admin-accent mt-2"></div>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Section Name *
            </label>
            <input
              type="text"
              required
              value={formData.sectionName}
              onChange={(e) => setFormData({...formData, sectionName: e.target.value})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Awards, Publications, Languages..."
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Brief description..."
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-admin-text/80 border border-admin-border rounded-lg hover:bg-admin-text/5 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedSectionsManager;
