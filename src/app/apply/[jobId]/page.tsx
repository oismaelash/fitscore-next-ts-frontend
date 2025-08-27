'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { CandidateForm } from '@/types';

type Step = 'personal' | 'resume' | 'performance' | 'energy' | 'culture';

export default function CandidateApplicationPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<CandidateForm>({
    name: '',
    email: '',
    phone: '',
    resume: null as any,
    culturalFit: {
      performance: '',
      energy: '',
      culture: ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const steps: { key: Step; title: string; description: string }[] = [
    {
      key: 'personal',
      title: 'Personal Information',
      description: 'Basic contact details'
    },
    {
      key: 'resume',
      title: 'Resume/CV',
      description: 'Upload your resume'
    },
    {
      key: 'performance',
      title: 'Performance',
      description: 'Experience & delivery'
    },
    {
      key: 'energy',
      title: 'Energy',
      description: 'Deadlines & pressure'
    },
    {
      key: 'culture',
      title: 'Culture',
      description: 'Workplace values'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        culturalFit: {
          ...prev.culturalFit,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const nextStep = () => {
    if (currentStep === 'personal') setCurrentStep('resume');
    else if (currentStep === 'resume') setCurrentStep('performance');
    else if (currentStep === 'performance') setCurrentStep('energy');
    else if (currentStep === 'energy') setCurrentStep('culture');
  };

  const prevStep = () => {
    if (currentStep === 'culture') setCurrentStep('energy');
    else if (currentStep === 'energy') setCurrentStep('performance');
    else if (currentStep === 'performance') setCurrentStep('resume');
    else if (currentStep === 'resume') setCurrentStep('personal');
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'personal':
        return formData.name.trim() && formData.email.trim() && formData.phone.trim();
      case 'resume':
        return formData.resume;
      case 'performance':
        return formData.culturalFit.performance.trim();
      case 'energy':
        return formData.culturalFit.energy.trim();
      case 'culture':
        return formData.culturalFit.culture.trim();
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', jobId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('resume', formData.resume);
      formDataToSend.append('culturalFit', JSON.stringify(formData.culturalFit));

      const response = await fetch('/api/candidates', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          resume: null as any,
          culturalFit: {
            performance: '',
            energy: '',
            culture: ''
          }
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark mb-2">
              Job Application
            </h1>
            <p className="text-gray-600">
              Please complete all steps to apply for this position
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.key
                        ? 'bg-primary text-white'
                        : steps.findIndex(s => s.key === currentStep) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {steps.findIndex(s => s.key === currentStep) > index ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        currentStep === step.key ? 'text-primary' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      steps.findIndex(s => s.key === currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Application Submitted Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Thank you for your application. We will review your information and get back to you soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Submitting Application
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    There was an error submitting your application. Please try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 'personal' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-dark border-b border-gray-200 pb-2">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide your basic contact information.
                </p>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Resume/CV */}
            {currentStep === 'resume' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-dark border-b border-gray-200 pb-2">
                  Resume/CV Upload
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Please upload your resume or CV in a supported format.
                </p>

                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                    Resume/CV *
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-secondary"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>

                {formData.resume && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-800">
                        File selected: {formData.resume.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Performance */}
            {currentStep === 'performance' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-dark border-b border-gray-200 pb-2">
                  Performance Assessment
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Tell us about your experience level and how you handle project deliveries.
                </p>

                <div>
                  <label htmlFor="performance" className="block text-sm font-medium text-gray-700 mb-1">
                    Describe your experience level and how you handle project deliveries *
                  </label>
                  <textarea
                    id="performance"
                    name="culturalFit.performance"
                    value={formData.culturalFit.performance}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Share your experience level, how you approach project deliveries, your methodology, and examples of successful projects you've completed..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Consider including: years of experience, project management approach, tools you use, and examples of successful deliveries.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Energy */}
            {currentStep === 'energy' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-dark border-b border-gray-200 pb-2">
                  Energy Assessment
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  How do you manage deadlines and work under pressure?
                </p>

                <div>
                  <label htmlFor="energy" className="block text-sm font-medium text-gray-700 mb-1">
                    Describe your approach to deadlines and pressure situations *
                  </label>
                  <textarea
                    id="energy"
                    name="culturalFit.energy"
                    value={formData.culturalFit.energy}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Explain how you handle tight deadlines, high-pressure situations, and stress management techniques you use..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Consider including: time management strategies, stress handling techniques, and examples of how you've thrived under pressure.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Culture */}
            {currentStep === 'culture' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-dark border-b border-gray-200 pb-2">
                  Culture Assessment
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  What values are most important to you in a workplace?
                </p>

                <div>
                  <label htmlFor="culture" className="block text-sm font-medium text-gray-700 mb-1">
                    Share what workplace values matter most to you *
                  </label>
                  <textarea
                    id="culture"
                    name="culturalFit.culture"
                    value={formData.culturalFit.culture}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Describe the workplace values, culture, and environment that help you thrive and be most productive..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Consider including: collaboration preferences, communication styles, work-life balance, and the type of team environment you prefer.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 'personal'}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>

              {currentStep === 'culture' ? (
                <button
                  type="submit"
                  disabled={isSubmitting || !canProceedToNext()}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              By submitting this application, you agree to our privacy policy and terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
