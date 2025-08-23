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
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:8080/api';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  // s1: Working fetchProjects function
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // s1: Working handleDragEnd function with database updates
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = projects.findIndex((item) => item.id.toString() === active.id);
      const newIndex = projects.findIndex((item) => item.id.toString() === over.id);

      const newProjects = arrayMove(projects, oldIndex, newIndex);
      
      // Update local state immediately for smooth UX
      setProjects(newProjects);

      // Update orderIndex for all affected items
      const updatedItems = newProjects.map((item, index) => ({
        ...item,
        orderIndex: index + 1
      }));

      // Save to backend
      try {
        await Promise.all(
          updatedItems.map(item =>
            axios.put(`${API_BASE}/projects/${item.id}`, item)
          )
        );
        // Refresh from backend to ensure consistency
        fetchProjects();
      } catch (error) {
        console.error('Error updating order:', error);
        // Revert on error
        fetchProjects();
      }
    }
  };

  // s1: Working handleSave function
  // s1: Enhanced handleSave function with error handling
const handleSave = async (projectData) => {
  console.log('Received project data:', projectData); // Debug log
  
  try {
    if (editingProject) {
      console.log('Updating project:', editingProject.id);
      await axios.put(`${API_BASE}/projects/${editingProject.id}`, projectData);
    } else {
      console.log('Creating new project');
      await axios.post(`${API_BASE}/projects`, projectData);
    }
    
    console.log('Project saved successfully');
    setShowForm(false);
    setEditingProject(null);
    await fetchProjects(); // Make sure this completes
    
  } catch (error) {
    console.error('Error saving project:', error);
    console.error('Error details:', error.response?.data);
    // Don't close the form on error so user can try again
    throw error; // Re-throw so form can show the error
  }
};


  // s1: Working handleDelete function
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API_BASE}/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  // s1: Working toggleVisibility function
  const toggleVisibility = async (project) => {
    try {
      await axios.put(`${API_BASE}/projects/${project.id}`, {
        ...project,
        visible: !project.visible
      });
      fetchProjects();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8 text-admin-text">Loading...</div>;
  }

  return (
    <div>
      {/* s1: Header with dark theme styling */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-admin-text mb-2">Projects</h1>
          <p className="text-admin-text/70">Manage your portfolio projects - drag to reorder</p>
        </div>
        {/* s1: Add button with working functionality */}
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      {/* s1: Working drag and drop context */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={projects.map(p => p.id.toString())} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {projects.map((project) => (
              <SortableProject
                key={project.id}
                project={project}
                onEdit={(project) => {
                  setEditingProject(project);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
                onToggleVisibility={toggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* s1: Working form modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

// s1: Working SortableProject component with dark theme
const SortableProject = ({ project, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id.toString() });

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
          {/* s1: Working drag handle */}
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
                {project.title}
              </h3>
              <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                #{project.orderIndex}
              </span>
              {/* s1: Working visibility toggle */}
              <button
                onClick={() => onToggleVisibility(project)}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  project.visible 
                    ? 'text-admin-accent hover:bg-admin-accent/10' 
                    : 'text-admin-text/40 hover:bg-admin-text/10'
                }`}
              >
                {project.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {project.subtitle && (
              <p className="text-admin-text/80 mb-4 text-left">{project.subtitle}</p>
            )}
            
            {project.bulletPoints && project.bulletPoints.length > 0 && (
              <ul className="text-sm text-admin-text/70 space-y-2 mb-4 text-left">
                {project.bulletPoints.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start">
                    <span className="text-admin-accent mr-2 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-admin-accent hover:text-admin-accent/80 text-sm font-medium transition-colors duration-200"
              >
                View Project →
              </a>
            )}
          </div>
        </div>
        
        {/* s1: Working action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// s1: Fixed ProjectForm component with proper error handling
const ProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    bulletPoints: [''],
    url: '',
    visible: true,
    orderIndex: null,
    ...project
  });
  
  // s1: Add loading state for better UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // s1: Fixed handleSubmit with proper error handling
  const handleSubmit = async (e) => {
    e.preventDefault(); // Critical: prevent default form submission
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // s1: Clean and validate the data before sending
      const cleanedData = {
        ...formData,
        bulletPoints: formData.bulletPoints
          .filter(point => point && point.trim() !== '') // Remove empty points
          .map(point => point.trim()), // Trim whitespace
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        url: formData.url?.trim() || '',
        visible: Boolean(formData.visible), // Ensure it's a boolean
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : null
      };
      
      // s1: Validate required fields
      if (!cleanedData.title) {
        throw new Error('Project title is required');
      }
      
      console.log('Submitting data:', cleanedData); // Debug log
      
      await onSave(cleanedData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save project');
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
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <div className="w-8 h-0.5 bg-admin-accent mt-2"></div>
        </div>
        
        {/* s1: Show error message if any */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {/* s1: Fixed form with proper onSubmit handling */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Enter project title..."
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="Enter subtitle..."
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Project URL
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="https://..."
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
                  placeholder="Enter key point..."
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
              {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default ProjectsManager;
