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
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Code, ChevronDown, ChevronRight, X, Tag } from 'lucide-react';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const API_BASE = 'http://localhost:8080/api';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // s1: Initial data fetch on component mount
  useEffect(() => {
    console.log('🔄 SkillsManager mounted, fetching skills...');
    fetchSkills();
  }, []);

  // s1: Fetch skills from backend
  const fetchSkills = async () => {
    console.log('🚀 fetchSkills called');
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Making request to:', `${API_BASE}/skills`);
      
      const response = await axios.get(`${API_BASE}/admin/skills`, {
        timeout: 10000,
      });
      
      console.log('✅ Response received:', response.status);
      console.log('📦 Skills data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setSkills(response.data);
        // s1: Auto-expand first category if any exist
        if (response.data.length > 0) {
          setExpandedCategories(new Set([response.data[0].id.toString()]));
        }
        console.log(`🎉 Successfully loaded ${response.data.length} skill categories`);
      } else {
        console.warn('⚠️ API returned non-array data:', response.data);
        setSkills([]);
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
      
      setSkills([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchSkills completed');
    }
  };

  // s1: Handle drag and drop reordering
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = skills.findIndex((item) => item.id.toString() === active.id);
      const newIndex = skills.findIndex((item) => item.id.toString() === over.id);

      const newSkills = arrayMove(skills, oldIndex, newIndex);
      setSkills(newSkills);

      const updatedItems = newSkills.map((item, index) => ({
        ...item,
        orderIndex: index + 1
      }));

      try {
        await Promise.all(
          updatedItems.map(item =>
            axios.put(`${API_BASE}/admin/skills/${item.id}`, item)
          )
        );
        fetchSkills();
      } catch (error) {
        console.error('Error updating order:', error);
        fetchSkills();
      }
    }
  };

  // s1: Handle create/update skill category
  const handleSave = async (skillData) => {
    try {
      if (editingSkill) {
        await axios.put(`${API_BASE}/admin/skills/${editingSkill.id}`, skillData);
      } else {
        await axios.post(`${API_BASE}/admin/skills`, skillData);
      }
      
      setShowForm(false);
      setEditingSkill(null);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skills:', error);
      throw error;
    }
  };

  // s1: Handle delete skill category
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill category?')) {
      try {
        await axios.delete(`${API_BASE}/admin/skills/${id}`);
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skills:', error);
      }
    }
  };

  // s1: Toggle skill category visibility
  const toggleVisibility = async (skill) => {
    try {
      await axios.put(`${API_BASE}/admin/skills/${skill.id}`, {
        ...skill,
        visible: !skill.visible
      });
      fetchSkills();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // s1: Toggle category expansion
  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId.toString())) {
      newExpanded.delete(categoryId.toString());
    } else {
      newExpanded.add(categoryId.toString());
    }
    setExpandedCategories(newExpanded);
  };

  // s1: Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading skills...</p>
      </div>
    );
  }

  // s1: Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">Failed to Load Skills</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchSkills}
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
          <h1 className="text-3xl font-bold text-admin-text mb-2">Skills</h1>
          <p className="text-admin-text/70">
            {skills.length > 0 
              ? `Manage your ${skills.length} skill categories - drag to reorder`
              : 'No skill categories found - add your first category below'
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* s1: Skills categories list or empty state */}
      {skills.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-admin-accent/10 rounded-full flex items-center justify-center">
            <Code className="w-8 h-8 text-admin-accent" />
          </div>
          <p className="text-admin-text/50 mb-4">No skill categories to display</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-admin-accent hover:text-admin-accent/80 font-medium"
          >
            Add your first skill category
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={skills.map(s => s.id.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {skills.map((skill) => (
                <SortableSkillCategory
                  key={skill.id}
                  skillCategory={skill}
                  expanded={expandedCategories.has(skill.id.toString())}
                  onToggleExpanded={() => toggleExpanded(skill.id)}
                  onEdit={(skill) => {
                    setEditingSkill(skill);
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

      {/* s1: Skills form modal */}
      {showForm && (
        <SkillsForm
          skillCategory={editingSkill}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
};

// s1: Sortable Skill Category Component
const SortableSkillCategory = ({ skillCategory, expanded, onToggleExpanded, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skillCategory.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  // s1: Parse skills list (comma-separated string to array)
  const skillsList = skillCategory.skillsList ? 
    skillCategory.skillsList.split(',').map(skill => skill.trim()).filter(skill => skill) : 
    [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-admin-card rounded-lg border border-admin-border card-hover ${
        isDragging ? 'shadow-2xl ring-2 ring-admin-accent/50 scale-105' : ''
      }`}
    >
      {/* s1: Category header */}
      <div className="p-6">
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
              {/* s1: Category name and expand button */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={onToggleExpanded}
                  className="p-1 hover:bg-admin-accent/10 rounded transition-colors duration-200"
                >
                  {expanded ? (
                    <ChevronDown className="w-5 h-5 text-admin-text/80" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-admin-text/80" />
                  )}
                </button>
                <h3 className="text-xl font-semibold text-admin-text">
                  {skillCategory.category}
                </h3>
                <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                  #{skillCategory.orderIndex}
                </span>
                <span className="text-xs bg-admin-text/10 text-admin-text/70 px-2 py-1 rounded-full font-medium">
                  {skillsList.length} skills
                </span>
                <button
                  onClick={() => onToggleVisibility(skillCategory)}
                  className={`p-1.5 rounded-full transition-colors duration-200 ${
                    skillCategory.visible 
                      ? 'text-admin-accent hover:bg-admin-accent/10' 
                      : 'text-admin-text/40 hover:bg-admin-text/10'
                  }`}
                >
                  {skillCategory.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* s1: Skills preview (first few skills when collapsed) */}
              {!expanded && skillsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skillsList.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs bg-admin-accent/10 text-admin-accent px-2 py-1 rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {skillsList.length > 6 && (
                    <span className="text-xs text-admin-text/50 px-2 py-1">
                      +{skillsList.length - 6} more...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* s1: Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEdit(skillCategory)}
              className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(skillCategory.id)}
              className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* s1: Expanded skills list */}
      {expanded && skillsList.length > 0 && (
        <div className="px-6 pb-6 border-t border-admin-border/50">
          <div className="pt-4">
            <h4 className="text-sm font-medium text-admin-text/80 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              All Skills in this Category
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="text-sm bg-admin-accent/10 text-admin-accent px-3 py-1.5 rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// s1: Skills Form Component
const SkillsForm = ({ skillCategory, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: '',
    skillsList: '',
    visible: true,
    orderIndex: null,
    ...skillCategory
  });
  
  const [skillsArray, setSkillsArray] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // s1: Initialize skills array from skillsList string
  useEffect(() => {
    if (formData.skillsList) {
      const skills = formData.skillsList.split(',').map(skill => skill.trim()).filter(skill => skill);
      setSkillsArray(skills);
    } else {
      setSkillsArray(['']);
    }
  }, [formData.skillsList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const cleanedSkills = skillsArray
        .map(skill => skill.trim())
        .filter(skill => skill)
        .join(', ');
        
      const cleanedData = {
        ...formData,
        category: formData.category.trim(),
        skillsList: cleanedSkills,
        visible: Boolean(formData.visible),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : null
      };
      
      if (!cleanedData.category) {
        throw new Error('Category name is required');
      }
      
      if (!cleanedData.skillsList) {
        throw new Error('At least one skill is required');
      }
      
      console.log('Submitting skills data:', cleanedData);
      
      await onSave(cleanedData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save skills');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    setSkillsArray([...skillsArray, '']);
  };

  const updateSkill = (index, value) => {
    const newSkills = [...skillsArray];
    newSkills[index] = value;
    setSkillsArray(newSkills);
  };

  const removeSkill = (index) => {
    if (skillsArray.length > 1) {
      setSkillsArray(skillsArray.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-semibold text-admin-text">
            {skillCategory ? 'Edit Skill Category' : 'Add New Skill Category'}
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
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="Technical Skills"
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
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-admin-text">
                Skills *
              </label>
              <button
                type="button"
                onClick={addSkill}
                className="text-admin-accent hover:text-admin-accent/80 text-sm font-medium"
                disabled={isSubmitting}
              >
                + Add Skill
              </button>
            </div>
            {skillsArray.map((skill, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                  placeholder="Enter skill name..."
                  disabled={isSubmitting}
                />
                {skillsArray.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-400 hover:text-red-300 p-2"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <p className="text-xs text-admin-text/50 mt-2">
              Add individual skills that belong to this category
            </p>
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
              {isSubmitting ? 'Saving...' : (skillCategory ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillsManager;
