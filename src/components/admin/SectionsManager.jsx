import React, { useState, useEffect } from 'react';
import axios from '../../../src/utils/axiosInstance';
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
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Settings, ChevronRight, Calendar, Search } from 'lucide-react';

const SectionsManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, []);

  // s1: Fetch sections from backend
  const fetchSections = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE}/admin/sections`, { timeout: 10000 });
      
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

  // s1: Handle drag and drop reordering using the /reorder endpoint
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((item) => item.id.toString() === active.id);
      const newIndex = sections.findIndex((item) => item.id.toString() === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      try {
        // Use your custom reorder endpoint
        await axios.put(`${API_BASE}/admin/sections/reorder`, newSections);
        fetchSections(); // Refresh to ensure consistency
      } catch (error) {
        console.error('Error updating order:', error);
        fetchSections(); // Revert on error
      }
    }
  };

  // s1: Handle create/update section
  const handleSave = async (sectionData) => {
    try {
      if (editingSection) {
        await axios.put(`${API_BASE}/admin/sections/${editingSection.id}`, sectionData);
      } else {
        await axios.post(`${API_BASE}/admin/sections`, sectionData);
      }
      
      setShowForm(false);
      setEditingSection(null);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      if (error.response?.status === 400) {
        throw new Error('Section name already exists. Please choose a different name.');
      }
      throw error;
    }
  };

  // s1: Handle delete section
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section? All content within this section will also be deleted.')) {
      try {
        await axios.delete(`${API_BASE}/admin/sections/${id}`);
        fetchSections();
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  // s1: Toggle section visibility
  const toggleVisibility = async (section) => {
    try {
      await axios.put(`${API_BASE}/admin/sections/${section.id}`, {
        ...section,
        visible: !section.visible
      });
      fetchSections();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // s1: Filter sections based on search term
  const filteredSections = sections.filter(section =>
    section.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (section.description && section.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading sections...</p>
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
          <h1 className="text-3xl font-bold text-admin-text mb-2">Custom Sections</h1>
          <p className="text-admin-text/70">
            {sections.length > 0 
              ? `Manage your ${sections.length} resume sections - drag to reorder`
              : 'No custom sections found - add your first section below'
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </button>
      </div>

      {/* s1: Search bar */}
      {sections.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-admin-card border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* s1: Sections list or empty state */}
      {filteredSections.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-admin-accent/10 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-admin-accent" />
          </div>
          <p className="text-admin-text/50 mb-4">
            {searchTerm ? `No sections found matching "${searchTerm}"` : 'No custom sections to display'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-admin-accent hover:text-admin-accent/80 font-medium"
            >
              Add your first custom section
            </button>
          )}
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredSections.map(s => s.id.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {filteredSections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onEdit={(section) => {
                    setEditingSection(section);
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

      {/* s1: Section form modal */}
      {showForm && (
        <SectionForm
          section={editingSection}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingSection(null);
          }}
        />
      )}
    </div>
  );
};

// s1: Sortable Section Card Component
const SortableSection = ({ section, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  // s1: Format creation date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
              <h3 className="text-xl font-semibold text-admin-text">
                {section.sectionName}
              </h3>
              <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                #{section.orderIndex}
              </span>
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
            
            {section.description && (
              <p className="text-admin-text/80 mb-3 text-left">{section.description}</p>
            )}
            
            {/* s1: Creation date */}
            <div className="flex items-center gap-2 text-admin-text/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(section.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {/* s1: Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => {
              // TODO: Navigate to section content management
              console.log('Manage content for section:', section.id);
            }}
            className="p-2 text-admin-text/60 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
            title="Manage Content"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(section)}
            className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// s1: Section Form Component
const SectionForm = ({ section, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sectionName: '',
    description: '',
    visible: true,
    orderIndex: null,
    ...section
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
        visible: Boolean(formData.visible),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : null
      };
      
      if (!cleanedData.sectionName) {
        throw new Error('Section name is required');
      }
      
      if (cleanedData.sectionName.length > 100) {
        throw new Error('Section name must be less than 100 characters');
      }
      
      await onSave(cleanedData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save section');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-semibold text-admin-text">
            {section ? 'Edit Section' : 'Add New Section'}
          </h2>
          <div className="w-8 h-0.5 bg-admin-accent mt-2"></div>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Section Name *
            </label>
            <input
              type="text"
              required
              value={formData.sectionName || ''}
              onChange={(e) => setFormData({...formData, sectionName: e.target.value})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Awards, Publications, Languages, etc."
              disabled={isSubmitting}
            />
            <p className="text-xs text-admin-text/50 mt-2">
              Choose a descriptive name for your custom section
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Optional description of what this section contains..."
              disabled={isSubmitting}
            />
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
              {isSubmitting ? 'Saving...' : (section ? 'Update Section' : 'Create Section')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionsManager;
