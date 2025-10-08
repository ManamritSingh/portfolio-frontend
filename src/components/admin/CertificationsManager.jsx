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
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Award, Calendar, ExternalLink, Building } from 'lucide-react';

const CertificationsManager = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE}/admin/certifications`, { timeout: 10000 });
      
      if (response.data && Array.isArray(response.data)) {
        setCertifications(response.data);
      } else {
        setCertifications([]);
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
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = certifications.findIndex((item) => item.id.toString() === active.id);
      const newIndex = certifications.findIndex((item) => item.id.toString() === over.id);

      const newCertifications = arrayMove(certifications, oldIndex, newIndex);
      setCertifications(newCertifications);

      const updatedItems = newCertifications.map((item, index) => ({
        ...item,
        orderIndex: index + 1
      }));

      try {
        await Promise.all(
          updatedItems.map(item => axios.put(`${API_BASE}/admin/certifications/${item.id}`, item))
        );
        fetchCertifications();
      } catch (error) {
        console.error('Error updating order:', error);
        fetchCertifications();
      }
    }
  };

  const handleSave = async (certificationData) => {
    try {
      if (editingCertification) {
        await axios.put(`${API_BASE}/admin/certifications/${editingCertification.id}`, certificationData);
      } else {
        await axios.post(`${API_BASE}/admin/certifications`, certificationData);
      }
      
      setShowForm(false);
      setEditingCertification(null);
      fetchCertifications();
    } catch (error) {
      console.error('Error saving certification:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      try {
        await axios.delete(`${API_BASE}/admin/certifications/${id}`);
        fetchCertifications();
      } catch (error) {
        console.error('Error deleting certification:', error);
      }
    }
  };

  const toggleVisibility = async (certification) => {
    try {
      await axios.put(`${API_BASE}/admin/certifications/${certification.id}`, {
        ...certification,
        visible: !certification.visible
      });
      fetchCertifications();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mb-4"></div>
        <p className="text-admin-text/70">Loading certifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">Failed to Load Certifications</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchCertifications}
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
      <div className="flex justify-between items-start mb-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-admin-text mb-2">Certifications</h1>
          <p className="text-admin-text/70">
            {certifications.length > 0 
              ? `Manage your ${certifications.length} certifications - drag to reorder`
              : 'No certifications found - add your first certification below'
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-6 py-3 bg-admin-accent text-admin-bg rounded-lg hover:bg-admin-accent/90 font-medium transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-admin-accent/10 rounded-full flex items-center justify-center">
            <Award className="w-8 h-8 text-admin-accent" />
          </div>
          <p className="text-admin-text/50 mb-4">No certifications to display</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-admin-accent hover:text-admin-accent/80 font-medium"
          >
            Add your first certification
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={certifications.map(c => c.id.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {certifications.map((certification) => (
                <SortableCertification
                  key={certification.id}
                  certification={certification}
                  onEdit={(certification) => {
                    setEditingCertification(certification);
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

      {showForm && (
        <CertificationForm
          certification={editingCertification}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCertification(null);
          }}
        />
      )}
    </div>
  );
};

// s1: Sortable Certification Card Component
const SortableCertification = ({ certification, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certification.id.toString() });

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
              <h3 className="text-xl font-semibold text-admin-text">
                {certification.name}
              </h3>
              <span className="text-xs bg-admin-accent/20 text-admin-accent px-2 py-1 rounded-full font-medium">
                #{certification.orderIndex}
              </span>
              <button
                onClick={() => onToggleVisibility(certification)}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  certification.visible 
                    ? 'text-admin-accent hover:bg-admin-accent/10' 
                    : 'text-admin-text/40 hover:bg-admin-text/10'
                }`}
              >
                {certification.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-3 text-admin-text/80">
              {certification.issuer && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">{certification.issuer}</span>
                </div>
              )}
              {certification.dateObtained && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{certification.dateObtained}</span>
                </div>
              )}
            </div>
            
            {certification.url && (
              <div className="text-admin-text/70 text-sm">
                <a
                  href={certification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-admin-accent hover:text-admin-accent/80 transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Certificate
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(certification)}
            className="p-2 text-admin-text/60 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(certification.id)}
            className="p-2 text-admin-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// s1: Certification Form Component
const CertificationForm = ({ certification, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    dateObtained: '',
    url: '',
    visible: true,
    orderIndex: null,
    ...certification
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
        name: formData.name.trim(),
        issuer: formData.issuer?.trim() || '',
        dateObtained: formData.dateObtained?.trim() || '',
        url: formData.url?.trim() || '',
        visible: Boolean(formData.visible),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : null
      };
      
      if (!cleanedData.name) {
        throw new Error('Certification name is required');
      }
      
      // Validate URL if provided
      if (cleanedData.url && !cleanedData.url.startsWith('http')) {
        throw new Error('Please enter a valid URL starting with http:// or https://');
      }
      
      await onSave(cleanedData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save certification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-admin-card border border-admin-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-xl font-semibold text-admin-text">
            {certification ? 'Edit Certification' : 'Add New Certification'}
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
              Certification Name *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
              placeholder="AWS Certified Cloud Practitioner"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Issuing Organization
              </label>
              <input
                type="text"
                value={formData.issuer || ''}
                onChange={(e) => setFormData({...formData, issuer: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="Amazon Web Services"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Date Obtained
              </label>
              <input
                type="text"
                value={formData.dateObtained || ''}
                onChange={(e) => setFormData({...formData, dateObtained: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="January 2024"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Certificate URL
              </label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text/50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition-all duration-200"
                placeholder="https://www.credly.com/badges/..."
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
              {isSubmitting ? 'Saving...' : (certification ? 'Update Certification' : 'Create Certification')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificationsManager;
