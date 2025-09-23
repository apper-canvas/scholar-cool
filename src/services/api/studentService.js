import studentsData from "@/services/mockData/students.json";
import { parseCSV, generateCSV, validateStudentData, normalizeStudentData } from "@/utils/csvUtils";
class StudentService {
  constructor() {
    this.students = [...studentsData];
  }

async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.students];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const student = this.students.find(s => s.Id === parseInt(id));
    if (!student) {
      throw new Error("Student not found");
    }
    return { ...student };
  }

  async create(studentData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.students.map(s => s.Id), 0);
    const newStudent = {
      ...studentData,
      Id: maxId + 1,
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split("T")[0],
      parentGuardian: studentData.parentGuardian || {
        name: "",
        relationship: "",
        primaryPhone: "",
        secondaryPhone: "",
        primaryEmail: "",
        secondaryEmail: "",
        address: { street: "", city: "", state: "", zipCode: "" }
      },
      communicationHistory: studentData.communicationHistory || []
    };
    
    this.students.push(newStudent);
    return { ...newStudent };
  }

  async update(id, studentData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    this.students[index] = {
      ...this.students[index],
      ...studentData,
      Id: parseInt(id),
      parentGuardian: studentData.parentGuardian || this.students[index].parentGuardian || {
        name: "",
        relationship: "",
        primaryPhone: "",
        secondaryPhone: "",
        primaryEmail: "",
        secondaryEmail: "",
        address: { street: "", city: "", state: "", zipCode: "" }
      },
      communicationHistory: studentData.communicationHistory || this.students[index].communicationHistory || []
    };
    
    return { ...this.students[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    this.students.splice(index, 1);
    return true;
  }

  async bulkImport(file) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Parse CSV file
      const rawData = await parseCSV(file);
      
      if (!rawData || rawData.length === 0) {
        throw new Error("No data found in the uploaded file");
      }

      // Normalize data
      const normalizedData = normalizeStudentData(rawData);
      
      // Validate data
      const validationErrors = validateStudentData(normalizedData);
      
      // Process valid records
      const validRecords = normalizedData.filter((_, index) => 
        !validationErrors.some(error => error.row === index + 1)
      );
      
      let successCount = 0;
      const duplicates = [];
      
      for (const studentData of validRecords) {
        // Check for existing student with same email
        const existingStudent = this.students.find(s => 
          s.email.toLowerCase() === studentData.email.toLowerCase()
        );
        
        if (existingStudent) {
          duplicates.push({
            email: studentData.email,
            name: `${studentData.firstName} ${studentData.lastName}`
          });
          continue;
        }
        
        // Create new student
        const maxId = Math.max(...this.students.map(s => s.Id), 0);
        const newStudent = {
          ...studentData,
          Id: maxId + successCount + 1
        };
        
        this.students.push(newStudent);
        successCount++;
      }
      
      const result = {
        successCount,
        totalRows: rawData.length,
        errors: validationErrors,
        duplicates
      };
      
      // Add duplicate warnings to errors if any
      if (duplicates.length > 0) {
        duplicates.forEach((duplicate, index) => {
          result.errors.push({
            row: `duplicate_${index + 1}`,
            errors: [`Student with email ${duplicate.email} already exists`],
            data: duplicate
          });
        });
      }
      
      return result;
      
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  async bulkExport() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const exportData = this.students.map(student => ({
        Id: student.Id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        emergencyContact: student.emergencyContact,
        grade: student.grade,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
        parentGuardianName: student.parentGuardian?.name || '',
        parentGuardianRelationship: student.parentGuardian?.relationship || '',
        parentGuardianPhone: student.parentGuardian?.primaryPhone || '',
        parentGuardianSecondaryPhone: student.parentGuardian?.secondaryPhone || '',
        parentGuardianEmail: student.parentGuardian?.primaryEmail || '',
        parentGuardianSecondaryEmail: student.parentGuardian?.secondaryEmail || '',
        parentGuardianAddressStreet: student.parentGuardian?.address?.street || '',
        parentGuardianAddressCity: student.parentGuardian?.address?.city || '',
        parentGuardianAddressState: student.parentGuardian?.address?.state || '',
        parentGuardianAddressZipCode: student.parentGuardian?.address?.zipCode || ''
      }));
      
      const timestamp = new Date().toISOString().split('T')[0];
      generateCSV(exportData, `students-export-${timestamp}.csv`);
      
      return { success: true, count: exportData.length };
      
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }
}

export const studentService = new StudentService();