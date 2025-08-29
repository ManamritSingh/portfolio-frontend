import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
  Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowLeft, 
  ExternalLink, MapPin, Calendar, FileText, Link2, Search
} from 'lucide-react';

const SectionContentManager = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  
  const [section, setSection] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = 'http://localhost:8080/api';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (sectionId) {
      fetchSection();
      fetchContent();
    }
  }, [sectionId]);

  // s1: Fetch section details
  const fetchSection = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sections/${sectionId}`);
      setSection(response.data);
    } catch (error) {
      console.error('Error fetching section:', error);
      setError('Failed to load section details');
    }
  };

  // s1: Fetch content for this section using your nested API
  const fetchContent = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE}/sections/${sectionId}/content`, { 
        timeout: 10000 
      });
      
      if (response.data && Array.isArray(response.data)) {
        setContent(response.data);
      } else {
        setContent([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out - please check if the server is running');
      } else if (error.response?.status === 404) {
        setContent([]); // Section exists but has no content yet
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Cannot connect to server - please check if backend is running on port 8080');
      } else {
        setError(`Unexpected error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // s1: Handle drag and drop reordering
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = content.findIndex((item) => item.id.toString() === active.id);
      const newIndex = content.findIndex((item) => item.id.toString() === over.id);

      const newContent = arrayMove(content, oldIndex, newIndex);
      setContent(newContent);

      // Update order indices and save
      const updatedItems = newContent.map((item, index) => ({
        ...item,
        orderIndex: index + 1
      }));

      try {
        await Promise.all(
          updatedItems.map(item => 
            axios.put(`${API_BASE}/sections/${sectionId}/content/${item.id}`, item)
          )
        );
        fetchContent(); // Refresh to ensure consistency
      } catch (error) {
        console.error('Error updating order:', error);
        fetchContent(); // Revert on error
      }
    }
  };

  // s1: Handle create/update content
  const handleSave = async (contentData) => {
    try {
      // Ensure section reference is set
      const dataWithSection = {
        ...contentData,
        section: { id: parseInt(sectionId) }
      };

      if (editingContent) {
        await axios.put(`${API_BASE}/sections/${sectionId}/content/${editingContent.id}`, dataWithSection);
      } else {
        await axios.post(`${API_BASE}/sections/${sectionId}/content`, dataWithSection);
      }
      
      setShowForm(false);
      setEditingContent(null);
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  };

  // s1: Handle delete content
  const handleDelete = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await axios.delete(`${API_BASE}/sections/${sectionId}/content/${contentId}`);
        fetchContent();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  // s1: Toggle content visibility
  const toggleVisibility = async (contentItem) => {
    try {
      await axios.put(`${API_BASE}/sections/${sectionId}/content/${contentItem.id}`, {
        ...contentItem,
        visible: !contentItem.visible
      });
      fetchContent();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // s1: Filter content based on search term
  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && !section) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading section content...</p>
      </div>
    );
  }

  return (
    <div>
      {/* s1: Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/sections')}
          className="p-2 hover:bg-admin-accent/10 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-admin-text/60 hover:text-admin-accent" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-admin-text mb-2">
                {section?.sectionName || 'Section'} Content
              </h1>
              <p className="text-admin-text/70">
                {content.length > 0 
                  ? `Manage ${content.length} content items - drag to reorder`
                  : 'No content found - add your first content item below'
                }
              </p>
              {section?.description && (
                <p className="text-admin-text/60 text-sm mt-1">{section.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </button>
          </div>
        </div>
      </div>

      {/* s1: Search bar */}
      {content.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-admin-card border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* s1: Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h3 className="text-red-400 font-semibold mb-2">Failed to Load Content</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchContent}
            className="bg-admin-accent text-admin-bg px-4 py-2 rounded-lg hover:bg-admin-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* s1: Content list or empty state */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-admin-accent/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-admin-accent" />
          </div>
          <p className="text-admin-text/50 mb-4">
            {searchTerm ? `No content found matching "${searchTerm}"` : 'No content items to display'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-admin-accent hover:text-admin-accent/80 font-medium"
            >
              Add your first content item
            </button>
          )}
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredContent.map(c => c.id.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {filteredContent.map((contentItem) => (
                <SortableContentItem
                  key={contentItem.id}
                  content={contentItem}
                  onEdit={(item) => {
                    setEditingContent(item);
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

      {/* s1: Content form modal */}
      {showForm && (
        <ContentForm
          content={editingContent}
          sectionName={section?.sectionName}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingContent(null);
          }}
        />
      )}
    </div>
  );
};

// s1: Sortable Content Item Component
const SortableContentItem = ({ content, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id.toString() });

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
            {/* s1: Title and order */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-semibold text-admin-text">
                {content.title}
              </h3>
              <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                #{content.orderIndex}
              </span>
              <button
                onClick={() => onToggleVisibility(content)}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  content.visible 
                    ? 'text-admin-accent hover:bg-admin-accent/10' 
                    : 'text-admin-text/40 hover:bg-admin-text/10'
                }`}
              >
                {content.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* s1: Subtitle */}
            {content.subtitle && (
              <p className="text-admin-accent font-medium mb-3">{content.subtitle}</p>
            )}
            
            {/* s1: Meta info (duration, location) */}
            {(content.duration || content.location) && (
              <div className="flex items-center gap-4 mb-3 text-admin-text/80 text-sm">
                {content.duration && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{content.duration}</span>
                  </div>
                )}
                {content.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{content.location}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* s1: Description */}
            {content.description && (
              <p className="text-admin-text/70 mb-3 leading-relaxed">{content.description}</p>
            )}
            
            {/* s1: Bullet points */}
            {content.bulletPoints && content.bulletPoints.length > 0 && (
              <ul className="text-sm text-admin-text/70 space-y-1 mb-4">
                {content.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-admin-accent mr-2 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {/* s1: URLs */}
            <div className="flex items-center gap-4">
              {content.primaryUrl && (
                <a
                  href={content.primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-admin-accent hover:text-admin-accent/80 text-sm font-medium transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Link
                </a>
              )}
              {content.secondaryUrl && (
                <a
                  href={content.secondaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-admin-text/60 hover:text-admin-accent text-sm font-medium transition-colors duration-200"
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  Secondary Link
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* s1: Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(content)}
            className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(content.id)}
            className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// s1: Flexible Content Form Component
const ContentForm = ({ content, sectionName, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    duration: '',
    location: '',
    description: '',
    bulletPoints: [''],
    primaryUrl: '',
    secondaryUrl: '',
    visible: true,
    orderIndex: null,
    ...content
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
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        duration: formData.duration?.trim() || '',
        location: formData.location?.trim() || '',
        description: formData.description?.trim() || '',
        bulletPoints: formData.bulletPoints
          .filter(point => point && point.trim() !== '')
          .map(point => point.trim()),
        primaryUrl: formData.primaryUrl?.trim() || '',
        secondaryUrl: formData.secondaryUrl?.trim() || '',
        visible: Boolean(formData.visible),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : null
      };
      
      if (!cleanedData.title) {
        throw new Error('Title is required');
      }
      
      // URL validation
      if (cleanedData.primaryUrl && !cleanedData.primaryUrl.startsWith('http')) {
        throw new Error('Primary URL must start with http:// or https://');
      }
      
      if (cleanedData.secondaryUrl && !cleanedData.secondaryUrl.startsWith('http')) {
        throw new Error('Secondary URL must start with http:// or https://');
      }
      
      await onSave(cleanedData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save content');
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
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-semibold text-admin-text">
            {content ? 'Edit Content' : `Add Content to ${sectionName}`}
          </h2>
          <div className="w-8 h-0.5 bg-admin-accent mt-2"></div>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* s1: Title (required) */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Enter the main title..."
              disabled={isSubmitting}
            />
          </div>
          
          {/* s1: Subtitle and Duration row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="Optional subtitle..."
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="2023 - 2024"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* s1: Location and Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Auto-ordered"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* s1: Description */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Detailed description..."
              disabled={isSubmitting}
            />
          </div>
          
          {/* s1: Bullet points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-admin-text">
                Key Points
              </label>
              <button
                type="button"
                onClick={addBulletPoint}
                className="text-admin-accent hover:text-admin-accent/80 text-sm font-medium"
                disabled={isSubmitting}
              >
                + Add Point
              </button>
            </div>
            {formData.bulletPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <textarea
                  value={point || ''}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  rows="2"
                  className="flex-1 px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                  placeholder="Enter a key point..."
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

          {/* s1: URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Primary URL
              </label>
              <input
                type="url"
                value={formData.primaryUrl || ''}
                onChange={(e) => setFormData({...formData, primaryUrl: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Secondary URL
              </label>
              <input
                type="url"
                value={formData.secondaryUrl || ''}
                onChange={(e) => setFormData({...formData, secondaryUrl: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* s1: Visibility */}
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
          
          {/* s1: Form actions */}
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
              {isSubmitting ? 'Saving...' : (content ? 'Update Content' : 'Create Content')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionContentManager;
