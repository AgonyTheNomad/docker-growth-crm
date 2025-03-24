import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const UploadReport = ({ 
  uploadSummary, 
  error, 
  warnings = [], 
  successMessage,
  isUploading 
}) => {
  if (isUploading || (!uploadSummary && !error && !warnings.length && !successMessage)) {
    return null;
  }

  const getProgressColor = (uploadSummary) => {
    if (!uploadSummary) return 'bg-blue-500';
    if (uploadSummary.errors > 0) return 'bg-red-500';
    if (uploadSummary.warnings?.length > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4 mt-4">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTitle className="text-yellow-800">Warnings</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <ul className="list-disc pl-4">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {uploadSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadSummary.total_rows > 0 && (
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Upload Progress</span>
                  <span>{Math.round((uploadSummary.processed_rows || 0) / uploadSummary.total_rows * 100)}%</span>
                </div>
                <Progress 
                  value={(uploadSummary.processed_rows || 0) / uploadSummary.total_rows * 100}
                  className={getProgressColor(uploadSummary)}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Processing Summary</h3>
                <div className="space-y-1">
                  <p>Total Rows: {uploadSummary.total_rows || 0}</p>
                  <p>Valid Records: {uploadSummary.valid_rows || 0}</p>
                  <p>Invalid Records: {uploadSummary.invalid_rows || 0}</p>
                  {uploadSummary.duplicates_count !== undefined && (
                    <p>Duplicates Found: {uploadSummary.duplicates_count}</p>
                  )}
                </div>
              </div>

              {uploadSummary.contact_distribution && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Contact Information Distribution</h3>
                  <div className="space-y-1">
                    <p>Phone Only: {uploadSummary.contact_distribution.phone_only || 0}</p>
                    <p>Email Only: {uploadSummary.contact_distribution.email_only || 0}</p>
                    <p>Both Phone and Email: {uploadSummary.contact_distribution.both || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {uploadSummary.processed && (
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-2">Processing Details</h3>
                <div className="space-y-1">
                  <p>Processed Records: {uploadSummary.processed}</p>
                  <p>Successfully Created: {uploadSummary.created || 0}</p>
                  <p>Successfully Updated: {uploadSummary.updated || 0}</p>
                  <p>Processing Errors: {uploadSummary.errors || 0}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadReport;