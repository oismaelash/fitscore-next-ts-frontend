'use client';

import { useState } from 'react';
import { Interview, InterviewType, InterviewStatus, InterviewFeedback, InterviewForm } from '@/types';

interface InterviewHistoryFormProps {
  candidateId: string;
  jobId: string;
  interviews: Interview[];
  onAddInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateInterview: (id: string, updates: Partial<Interview>) => void;
  onDeleteInterview: (id: string) => void;
}

const INTERVIEW_TYPES: InterviewType[] = [
  'Technical Interview',
  'Cultural Fit Interview',
  'Behavioral Interview',
  'Final Round Interview',
  'Phone Screen',
  'Take-Home Assignment Review',
  'Reference Check',
  'Other'
];

const INTERVIEW_STATUSES: InterviewStatus[] = [
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled',
  'no-show'
];

const RECOMMENDATIONS = [
  { value: 'strong_yes', label: 'Strong Yes', color: 'text-green-600' },
  { value: 'yes', label: 'Yes', color: 'text-green-500' },
  { value: 'maybe', label: 'Maybe', color: 'text-yellow-600' },
  { value: 'no', label: 'No', color: 'text-red-500' },
  { value: 'strong_no', label: 'Strong No', color: 'text-red-600' }
];

export default function InterviewHistoryForm({
  candidateId,
  jobId,
  interviews,
  onAddInterview,
  onUpdateInterview,
  onDeleteInterview
}: InterviewHistoryFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [formData, setFormData] = useState<InterviewForm>({
    type: 'Technical Interview',
    date: '',
    time: '',
    duration: '60 minutes',
    interviewer: '',
    location: '',
    notes: '',
    feedback: {
      strengths: [],
      areasForImprovement: [],
      recommendation: 'maybe',
      nextSteps: ''
    }
  });

  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const interviewData = {
      candidateId,
      jobId,
      type: formData.type,
      date: `${formData.date}T${formData.time}:00Z`,
      duration: formData.duration,
      interviewer: formData.interviewer,
      status: 'scheduled' as InterviewStatus,
      notes: formData.notes || '',
      score: formData.feedback?.overall,
      feedback: {
        technicalSkills: formData.feedback?.technicalSkills,
        communication: formData.feedback?.communication,
        problemSolving: formData.feedback?.problemSolving,
        culturalFit: formData.feedback?.culturalFit,
        experience: formData.feedback?.experience,
        overall: formData.feedback?.overall,
        strengths: formData.feedback?.strengths || [],
        areasForImprovement: formData.feedback?.areasForImprovement || [],
        recommendation: formData.feedback?.recommendation || 'maybe',
        nextSteps: formData.feedback?.nextSteps || ''
      }
    };

    if (editingInterview) {
      onUpdateInterview(editingInterview.id, interviewData);
      setEditingInterview(null);
    } else {
      onAddInterview(interviewData);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setFormData({
      type: interview.type,
      date: interview.date.split('T')[0],
      time: interview.date.split('T')[1].substring(0, 5),
      duration: interview.duration,
      interviewer: interview.interviewer,
      location: '',
      notes: interview.notes,
      feedback: interview.feedback
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      onDeleteInterview(id);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Technical Interview',
      date: '',
      time: '',
      duration: '60 minutes',
      interviewer: '',
      location: '',
      notes: '',
      feedback: {
        strengths: [],
        areasForImprovement: [],
        recommendation: 'maybe',
        nextSteps: ''
      }
    });
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData(prev => ({
        ...prev,
        feedback: {
          ...prev.feedback!,
          strengths: [...(prev.feedback?.strengths || []), newStrength.trim()]
        }
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback!,
        strengths: prev.feedback?.strengths?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFormData(prev => ({
        ...prev,
        feedback: {
          ...prev.feedback!,
          areasForImprovement: [...(prev.feedback?.areasForImprovement || []), newImprovement.trim()]
        }
      }));
      setNewImprovement('');
    }
  };

  const removeImprovement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback!,
        areasForImprovement: prev.feedback?.areasForImprovement?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    const rec = RECOMMENDATIONS.find(r => r.value === recommendation);
    return rec?.color || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Interview History</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {editingInterview ? 'Edit Interview' : 'Add Interview'}
        </button>
      </div>

      {/* Interview Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Interview Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as InterviewType }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {INTERVIEW_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 60 minutes"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interviewer
                  </label>
                  <input
                    type="text"
                    value={formData.interviewer}
                    onChange={(e) => setFormData(prev => ({ ...prev, interviewer: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Conference Room A, Zoom"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Interview Feedback</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Score (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.feedback?.overall || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback!, overall: Number(e.target.value) }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recommendation
                  </label>
                  <select
                    value={formData.feedback?.recommendation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback!, recommendation: e.target.value as any }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {RECOMMENDATIONS.map(rec => (
                      <option key={rec.value} value={rec.value}>{rec.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strengths
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      placeholder="Add a strength"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addStrength}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {formData.feedback?.strengths?.map((strength, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="text-sm">{strength}</span>
                        <button
                          type="button"
                          onClick={() => removeStrength(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Areas for Improvement
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newImprovement}
                      onChange={(e) => setNewImprovement(e.target.value)}
                      placeholder="Add an area for improvement"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addImprovement}
                      className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {formData.feedback?.areasForImprovement?.map((improvement, index) => (
                      <div key={index} className="flex items-center justify-between bg-yellow-50 p-2 rounded">
                        <span className="text-sm">{improvement}</span>
                        <button
                          type="button"
                          onClick={() => removeImprovement(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Next Steps */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Add detailed notes about the interview..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Steps
                </label>
                <textarea
                  value={formData.feedback?.nextSteps}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    feedback: { ...prev.feedback!, nextSteps: e.target.value }
                  }))}
                  rows={3}
                  placeholder="What are the next steps for this candidate?"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingInterview(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingInterview ? 'Update Interview' : 'Add Interview'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interview List */}
      <div className="space-y-4">
        {interviews.length > 0 ? (
          interviews.map((interview) => (
            <div key={interview.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{interview.type}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(interview.date).toLocaleDateString()} • {interview.duration} • {interview.interviewer}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                  {interview.score && (
                    <span className="text-sm font-medium text-gray-700">
                      Score: {interview.score}/10
                    </span>
                  )}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(interview)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(interview.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {interview.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{interview.notes}</p>
                </div>
              )}

              {interview.feedback && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Feedback</h4>
                  
                  {interview.feedback.overall && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Overall Score:</span>
                      <span className="font-medium">{interview.feedback.overall}/10</span>
                    </div>
                  )}

                  {interview.feedback.recommendation && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Recommendation:</span>
                      <span className={`font-medium ${getRecommendationColor(interview.feedback.recommendation)}`}>
                        {RECOMMENDATIONS.find(r => r.value === interview.feedback.recommendation)?.label}
                      </span>
                    </div>
                  )}

                  {interview.feedback.strengths && interview.feedback.strengths.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Strengths:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {interview.feedback.strengths.map((strength, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {interview.feedback.areasForImprovement && interview.feedback.areasForImprovement.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Areas for Improvement:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {interview.feedback.areasForImprovement.map((improvement, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            {improvement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {interview.feedback.nextSteps && (
                    <div>
                      <span className="text-sm text-gray-600">Next Steps:</span>
                      <p className="text-sm text-gray-700 mt-1">{interview.feedback.nextSteps}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview History</h3>
            <p className="text-gray-600 mb-6">
              No interviews have been scheduled or recorded for this candidate yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
