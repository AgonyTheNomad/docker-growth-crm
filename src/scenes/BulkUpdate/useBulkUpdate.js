import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { constructWsUrl } from '../../utils/apiUtils';
import { validateCSV } from './validators';
import { generateDetailedReport } from './reportGenerator';
import * as XLSX from 'xlsx';
import { useAuth } from '../../services/UserContext';

export const useBulkUpdate = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [warnings, setWarnings] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [updateReport, setUpdateReport] = useState([]);
    const [uploadSummary, setUploadSummary] = useState(null);
    const [currentBatch, setCurrentBatch] = useState(0);
    const [totalBatches, setTotalBatches] = useState(0);
    // Important: Add showStats flag to control visibility
    const [showStats, setShowStats] = useState(false);
    const [processingStats, setProcessingStats] = useState({
        processed: 0,
        updated: 0,
        errors: 0,
        startTime: null,
        successCount: 0,
        failureCount: 0,
        updatedRecords: []
    });

    const fileInputRef = useRef(null);
    const wsRef = useRef(null);
    const { userName } = useAuth();

    // Handle file selection
    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        console.log('Selected file:', selectedFile);

        if (!selectedFile) {
            setError('No file selected.');
            setFile(null);
            setFileName('');
            return;
        }

        // Check file type
        if (!selectedFile.name.endsWith('.csv')) {
            setError('Please select a CSV file.');
            setFile(null);
            setFileName('');
            return;
        }

        // Reset file state but don't hide stats
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
        setWarnings([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        console.log('File set in state:', selectedFile.name);
    };

    // Reset function - now with option to keep stats visible
    const resetState = (clearStats = false) => {
        setFile(null);
        setFileName('');
        setError('');
        setWarnings([]);
        
        if (clearStats) {
            setUploadProgress(0);
            setUpdateReport([]);
            setUploadSummary(null);
            setCurrentBatch(0);
            setTotalBatches(0);
            setShowStats(false);
            setProcessingStats({
                processed: 0,
                updated: 0,
                errors: 0,
                startTime: null,
                successCount: 0,
                failureCount: 0,
                updatedRecords: []
            });
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const calculateProcessingStats = (processed, total, startTime) => {
        if (!startTime || processed === 0) return {};

        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const recordsPerSecond = processed / elapsedSeconds;
        const remainingRecords = total - processed;
        const estimatedRemainingSeconds = remainingRecords / recordsPerSecond;

        return {
            processingRate: Math.round(recordsPerSecond),
            estimatedTimeRemaining: formatTime(estimatedRemainingSeconds)
        };
    };

    // Format time helper
    const formatTime = (seconds) => {
        if (seconds < 60) return `${Math.round(seconds)} seconds`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    // Track record update
    const trackRecordUpdate = (record, success, message) => {
        const timestamp = new Date().toISOString();
        setProcessingStats(prev => ({
            ...prev,
            updatedRecords: [
                ...prev.updatedRecords,
                {
                    id: record.id,
                    timestamp,
                    success,
                    message,
                    changes: record.changes || {},
                    clientName: record.client_name || record.clientName
                }
            ],
            successCount: prev.successCount + (success ? 1 : 0),
            failureCount: prev.failureCount + (success ? 0 : 1)
        }));
    };

    // Handle file upload and processing
    const uploadFile = () => {
        if (!file) {
            setError('Please select a file before uploading.');
            return;
        }

        setError('');
        setIsUploading(true);
        // Set showStats true at the beginning of upload
        setShowStats(true);
        setProcessingStats(prev => ({ ...prev, startTime: Date.now() }));

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const ws = new WebSocket(constructWsUrl('/ws/update-franchise'));
                wsRef.current = ws;

                ws.onopen = () => {
                    const batchSize = 100;
                    const total = Math.ceil(result.data.length / batchSize);
                    setTotalBatches(total);

                    for (let i = 0; i < result.data.length; i += batchSize) {
                        const batch = result.data.slice(i, i + batchSize).map(record => {
                            // Filter out empty values (always use update mode)
                            const filteredRecord = {};
                            Object.keys(record).forEach(key => {
                                if (record[key] !== null && record[key] !== undefined && record[key] !== '') {
                                    filteredRecord[key] = record[key];
                                }
                            });
                            // Always include ID and user info
                            filteredRecord.id = record.id;
                            filteredRecord.userName = userName;
                            filteredRecord.changed_by = userName;
                            
                            return filteredRecord;
                        });
                        
                        ws.send(JSON.stringify({
                            type: 'batchUpdateFranchise',
                            clients: batch,
                            batchIndex: i / batchSize,
                            totalBatches: total,
                            updateMode: true // Always use update mode
                        }));
                    }
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received WebSocket message:', data);

                        switch (data.type) {
                            case 'progress':
                                setUploadProgress(data.value || 0);
                                if (data.details) {
                                    const details = data.details;
                                    setProcessingStats(prev => ({
                                        ...prev,
                                        processed: details.processed ?? prev.processed,
                                        updated: details.updated ?? prev.updated,
                                        errors: details.errors ?? prev.errors
                                    }));
                                }
                                break;

                            case 'batchSuccess':
                                if (data.totalStats) {
                                    const stats = data.totalStats;
                                    setCurrentBatch(data.batchIndex + 1);
                                    setProcessingStats(prev => ({
                                        ...prev,
                                        processed: stats.processed ?? prev.processed,
                                        updated: stats.updated ?? prev.updated,
                                        errors: stats.errors ?? prev.errors
                                    }));
                                }
                                if (data.batchResults) {
                                    setUpdateReport(prev => [...prev, ...data.batchResults]);
                                    // Track individual record updates
                                    data.batchResults.forEach(result => {
                                        trackRecordUpdate(
                                            result,
                                            result.status === 'success',
                                            result.status === 'success' ? 'Update successful' : result.error
                                        );
                                    });
                                }
                                break;

                            case 'batchComplete':
                                setCurrentBatch((data.batchIndex || 0) + 1);
                                if (data.totalStats) {
                                    setUploadSummary(data.totalStats);
                                    setProcessingStats(prev => ({
                                        ...prev,
                                        processed: data.totalStats.processed ?? prev.processed,
                                        updated: data.totalStats.updated ?? prev.updated,
                                        errors: data.totalStats.errors ?? prev.errors
                                    }));
                                }
                                break;

                            case 'error':
                                console.error('Server error:', data.message);
                                setError(data.message || 'An error occurred');
                                setIsUploading(false);
                                break;

                            case 'complete':
                                setIsUploading(false);
                                setUploadProgress(100);
                                // IMPORTANT: Keep showStats true
                                setShowStats(true);
                                if (data.summary) {
                                    setUploadSummary(data.summary);
                                }
                                if (data.details) {
                                    setProcessingStats(prev => ({
                                        ...prev,
                                        processed: data.details.processed ?? prev.processed,
                                        updated: data.details.updated ?? prev.updated,
                                        errors: data.details.errors ?? prev.errors,
                                        completedAt: new Date().toISOString()
                                    }));
                                } else {
                                    setProcessingStats(prev => ({
                                        ...prev,
                                        completedAt: new Date().toISOString()
                                    }));
                                }
                                // Persist the final report
                                localStorage.setItem('lastUpdateReport', JSON.stringify({
                                    timestamp: new Date().toISOString(),
                                    summary: data.summary || data.details || {},
                                    records: processingStats.updatedRecords
                                }));
                                if (wsRef.current) {
                                    wsRef.current.close();
                                    wsRef.current = null;
                                }
                                break;

                            default:
                                console.log('Unhandled message type:', data.type);
                                break;
                        }
                    } catch (error) {
                        console.error('Error processing WebSocket message:', error, 'Raw data:', event.data);
                        setError('Error processing server response');
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('Connection error occurred. Please try again.');
                    setIsUploading(false);
                };

                ws.onclose = () => {
                    if (isUploading) {
                        setError('Connection closed unexpectedly. Please try again.');
                        setIsUploading(false);
                    }
                };
            },
            error: (error) => {
                console.error('CSV parsing error:', error);
                setError('Error parsing CSV file. Please check the file format.');
                setIsUploading(false);
            }
        });
    };

    // Generate and download report
    const downloadReport = () => {
        if (!updateReport.length) {
            setError('No report data available');
            return;
        }

        try {
            const workbook = generateDetailedReport(updateReport);
            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `bulk_update_report_${timestamp}.xlsx`);
        } catch (error) {
            console.error('Error generating report:', error);
            setError('Failed to generate report');
        }
    };

    // Load last report from localStorage
    useEffect(() => {
        const lastReport = localStorage.getItem('lastUpdateReport');
        if (lastReport) {
            try {
                const parsedReport = JSON.parse(lastReport);
                if (parsedReport.records?.length > 0) {
                    setUpdateReport(parsedReport.records);
                    setShowStats(true);
                }
            } catch (error) {
                console.error('Error loading last report:', error);
            }
        }
    }, []);

    // Calculate current statistics including processing rate
    const currentStats = {
        ...processingStats,
        ...calculateProcessingStats(
            processingStats.processed,
            totalBatches * 100,
            processingStats.startTime
        )
    };

    return {
        file,
        fileName,
        isUploading,
        error,
        warnings,
        uploadProgress,
        updateReport,
        uploadSummary,
        currentBatch,
        totalBatches,
        currentStats,
        showStats,  // New flag to control visibility
        fileInputRef,
        handleFileChange,
        uploadFile,
        downloadReport,
        resetState
    };
};