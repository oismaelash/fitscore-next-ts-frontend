'use client';

import { Interview } from '@/types';

interface InterviewStatsProps {
  interviews: Interview[];
}

export default function InterviewStats({ interviews }: InterviewStatsProps) {
  const completedInterviews = interviews.filter(interview => interview.status === 'completed');
  const scheduledInterviews = interviews.filter(interview => interview.status === 'scheduled');
  const cancelledInterviews = interviews.filter(interview => interview.status === 'cancelled');

  const averageScore = completedInterviews.length > 0
    ? completedInterviews.reduce((sum, interview) => sum + (interview.score || 0), 0) / completedInterviews.length
    : 0;

  const recommendations = completedInterviews.reduce((acc, interview) => {
    const rec = interview.feedback?.recommendation;
    if (rec) {
      acc[rec] = (acc[rec] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'strong_yes': return 'Strong Yes';
      case 'yes': return 'Yes';
      case 'maybe': return 'Maybe';
      case 'no': return 'No';
      case 'strong_no': return 'Strong No';
      default: return rec;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_yes': return 'text-green-600';
      case 'yes': return 'text-green-500';
      case 'maybe': return 'text-yellow-600';
      case 'no': return 'text-red-500';
      case 'strong_no': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (interviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{interviews.length}</div>
          <div className="text-sm text-blue-700">Total Interviews</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{completedInterviews.length}</div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{scheduledInterviews.length}</div>
          <div className="text-sm text-yellow-700">Scheduled</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{cancelledInterviews.length}</div>
          <div className="text-sm text-red-700">Cancelled</div>
        </div>
      </div>

      {completedInterviews.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-medium text-gray-900 mb-2">Average Score</div>
            <div className="text-3xl font-bold text-blue-600">
              {averageScore.toFixed(1)}/10
            </div>
          </div>

          {Object.keys(recommendations).length > 0 && (
            <div>
              <div className="text-lg font-medium text-gray-900 mb-3">Recommendations</div>
              <div className="space-y-2">
                {Object.entries(recommendations).map(([rec, count]) => (
                  <div key={rec} className="flex justify-between items-center">
                    <span className={`font-medium ${getRecommendationColor(rec)}`}>
                      {getRecommendationLabel(rec)}
                    </span>
                    <span className="text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-lg font-medium text-gray-900 mb-3">Interview Types</div>
            <div className="space-y-2">
              {Object.entries(
                interviews.reduce((acc, interview) => {
                  acc[interview.type] = (acc[interview.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-700">{type}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
