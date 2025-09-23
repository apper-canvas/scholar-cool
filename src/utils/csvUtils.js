import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => reject(error)
    });
  });
};

export const generateCSV = (data, filename = 'export.csv') => {
  const csv = Papa.unparse(data, {
    header: true,
    skipEmptyLines: true
  });
  
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

export const validateStudentData = (data) => {
  const errors = [];
  const required = ['firstName', 'lastName', 'email', 'dateOfBirth'];
  
  data.forEach((row, index) => {
    const rowErrors = [];
    
    required.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        rowErrors.push(`Missing required field: ${field}`);
      }
    });
    
    // Email validation
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      rowErrors.push('Invalid email format');
    }
    
    // Date validation
    if (row.dateOfBirth && isNaN(Date.parse(row.dateOfBirth))) {
      rowErrors.push('Invalid date format for dateOfBirth');
    }
    
    if (rowErrors.length > 0) {
      errors.push({
        row: index + 1,
        errors: rowErrors,
        data: row
      });
    }
  });
  
  return errors;
};

export const validateGradeData = (data) => {
  const errors = [];
  const required = ['studentId', 'courseId', 'assignmentName', 'points', 'maxPoints'];
  
  data.forEach((row, index) => {
    const rowErrors = [];
    
    required.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        rowErrors.push(`Missing required field: ${field}`);
      }
    });
    
    // Numeric validations
    if (row.studentId && (isNaN(parseInt(row.studentId)) || parseInt(row.studentId) <= 0)) {
      rowErrors.push('studentId must be a positive integer');
    }
    
    if (row.courseId && (isNaN(parseInt(row.courseId)) || parseInt(row.courseId) <= 0)) {
      rowErrors.push('courseId must be a positive integer');
    }
    
    if (row.points && (isNaN(parseFloat(row.points)) || parseFloat(row.points) < 0)) {
      rowErrors.push('points must be a non-negative number');
    }
    
    if (row.maxPoints && (isNaN(parseFloat(row.maxPoints)) || parseFloat(row.maxPoints) <= 0)) {
      rowErrors.push('maxPoints must be a positive number');
    }
    
    // Points validation
    if (row.points && row.maxPoints && parseFloat(row.points) > parseFloat(row.maxPoints)) {
      rowErrors.push('points cannot exceed maxPoints');
    }
    
    if (rowErrors.length > 0) {
      errors.push({
        row: index + 1,
        errors: rowErrors,
        data: row
      });
    }
  });
  
  return errors;
};

export const normalizeStudentData = (data) => {
  return data.map(row => ({
    firstName: row.firstName?.toString().trim() || '',
    lastName: row.lastName?.toString().trim() || '',
    email: row.email?.toString().toLowerCase().trim() || '',
    phone: row.phone?.toString().trim() || '',
    dateOfBirth: row.dateOfBirth || '',
    address: row.address?.toString().trim() || '',
    emergencyContact: row.emergencyContact?.toString().trim() || '',
    grade: row.grade?.toString().trim() || '',
    status: row.status?.toString().toLowerCase().trim() || 'active',
    enrollmentDate: row.enrollmentDate || new Date().toISOString().split('T')[0],
    parentGuardian: {
      name: row.parentGuardianName?.toString().trim() || '',
      relationship: row.parentGuardianRelationship?.toString().trim() || 'Parent',
      primaryPhone: row.parentGuardianPhone?.toString().trim() || '',
      secondaryPhone: row.parentGuardianSecondaryPhone?.toString().trim() || '',
      primaryEmail: row.parentGuardianEmail?.toString().toLowerCase().trim() || '',
      secondaryEmail: row.parentGuardianSecondaryEmail?.toString().toLowerCase().trim() || '',
      address: {
        street: row.parentGuardianAddressStreet?.toString().trim() || '',
        city: row.parentGuardianAddressCity?.toString().trim() || '',
        state: row.parentGuardianAddressState?.toString().trim() || '',
        zipCode: row.parentGuardianAddressZipCode?.toString().trim() || ''
      }
    },
    communicationHistory: []
  }));
};

export const normalizeGradeData = (data) => {
  return data.map(row => {
    const points = parseFloat(row.points) || 0;
    const maxPoints = parseFloat(row.maxPoints) || 100;
    const percentage = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
    
    let letterGrade = 'F';
    if (percentage >= 97) letterGrade = 'A+';
    else if (percentage >= 93) letterGrade = 'A';
    else if (percentage >= 90) letterGrade = 'A-';
    else if (percentage >= 87) letterGrade = 'B+';
    else if (percentage >= 83) letterGrade = 'B';
    else if (percentage >= 80) letterGrade = 'B-';
    else if (percentage >= 77) letterGrade = 'C+';
    else if (percentage >= 73) letterGrade = 'C';
    else if (percentage >= 70) letterGrade = 'C-';
    else if (percentage >= 67) letterGrade = 'D+';
    else if (percentage >= 63) letterGrade = 'D';
    else if (percentage >= 60) letterGrade = 'D-';
    
    return {
      studentId: parseInt(row.studentId),
      courseId: parseInt(row.courseId),
      assignmentName: row.assignmentName?.toString().trim() || '',
      category: row.category?.toString().trim() || 'Assignment',
      points: points,
      maxPoints: maxPoints,
      percentage: percentage,
      letterGrade: letterGrade,
      dateRecorded: row.dateRecorded || new Date().toISOString().split('T')[0],
      comments: row.comments?.toString().trim() || ''
    };
  });
};