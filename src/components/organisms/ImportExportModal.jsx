import { useState, useRef } from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const ImportExportModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  onExport, 
  type = 'students',
  loading = false 
}) => {
  const [importFile, setImportFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error('Please select a valid CSV or Excel file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setImportFile(file);
    setValidationErrors([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    try {
      const result = await onImport(importFile);
      if (result.errors && result.errors.length > 0) {
        setValidationErrors(result.errors);
        toast.warning(`Import completed with ${result.errors.length} validation errors`);
      } else {
        toast.success(`Successfully imported ${result.successCount} ${type}`);
        handleClose();
      }
    } catch (error) {
      toast.error(error.message || 'Import failed');
      console.error('Import error:', error);
    }
  };

  const handleExport = async () => {
    try {
      await onExport();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Export failed');
      console.error('Export error:', error);
    }
  };

  const handleClose = () => {
    setImportFile(null);
    setValidationErrors([]);
    setDragOver(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Import/Export {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Import Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ApperIcon name="Upload" size={20} className="mr-2" />
              Import Data
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <ApperIcon 
                name="FileSpreadsheet" 
                size={48} 
                className="mx-auto text-gray-400 mb-4" 
              />
              
              {importFile ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {importFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(importFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setImportFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Drop your CSV or Excel file here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary hover:text-blue-700 font-medium"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports CSV, XLS, and XLSX files up to 10MB
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Validation Errors ({validationErrors.length})
                </h4>
                <div className="max-h-32 overflow-y-auto text-xs text-yellow-700 space-y-1">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <div key={index}>
                      Row {error.row}: {error.errors.join(', ')}
                    </div>
                  ))}
                  {validationErrors.length > 10 && (
                    <div className="text-yellow-600 font-medium">
                      ... and {validationErrors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <Button
                onClick={handleImport}
                disabled={!importFile || loading}
                variant="primary"
                icon="Upload"
                className="w-full"
              >
                {loading ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
          </div>

          {/* Export Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ApperIcon name="Download" size={20} className="mr-2" />
              Export Data
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Download all {type} data as a CSV file for backup or external use.
            </p>
            
            <Button
              onClick={handleExport}
              disabled={loading}
              variant="secondary"
              icon="Download"
              className="w-full"
            >
              {loading ? 'Exporting...' : 'Export to CSV'}
            </Button>
          </div>

          {/* Template Download */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ApperIcon name="FileText" size={20} className="mr-2" />
              Template
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Download a template file with the correct format for importing {type}.
            </p>
            
            <Button
              onClick={() => {
                const template = type === 'students' 
                  ? getStudentTemplate() 
                  : getGradeTemplate();
                downloadTemplate(template, `${type}-template.csv`);
              }}
              variant="secondary"
              icon="FileDown"
              className="w-full"
            >
              Download Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStudentTemplate = () => {
  return [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      dateOfBirth: '2005-01-15',
      address: '123 Main St, City, State 12345',
      emergencyContact: 'Jane Doe - (555) 987-6543',
      grade: '10',
      status: 'active',
      enrollmentDate: '2024-01-15',
      parentGuardianName: 'Jane Doe',
      parentGuardianRelationship: 'Mother',
      parentGuardianPhone: '(555) 987-6543',
      parentGuardianEmail: 'jane.doe@email.com'
    }
  ];
};

const getGradeTemplate = () => {
  return [
    {
      studentId: 1,
      courseId: 1,
      assignmentName: 'Math Test 1',
      category: 'Test',
      points: 85,
      maxPoints: 100,
      dateRecorded: '2024-01-15',
      comments: 'Good work'
    }
  ];
};

const downloadTemplate = (data, filename) => {
  const csv = data.map(row => Object.keys(row).join(',')).slice(0, 1).join('\n') + '\n' +
             data.map(row => Object.values(row).join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export default ImportExportModal;