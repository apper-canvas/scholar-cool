import { parseCSV, generateCSV, validateStudentData, normalizeStudentData } from "@/utils/csvUtils";
import { toast } from "react-toastify";
class StudentService {
  constructor() {
    this.tableName = 'student_c';
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  ensureClient() {
    if (!this.apperClient) {
      this.initializeClient();
    }
    return this.apperClient;
  }

async getAll() {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "date_of_birth_c"}},
          {"field": {"Name": "grade_level_c"}},
          {"field": {"Name": "enrollment_status_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "address_street_c"}},
          {"field": {"Name": "address_city_c"}},
          {"field": {"Name": "address_state_c"}},
          {"field": {"Name": "address_zip_code_c"}},
          {"field": {"Name": "emergency_contact_name_c"}},
          {"field": {"Name": "emergency_contact_relationship_c"}},
          {"field": {"Name": "emergency_contact_phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "parent_guardian_name_c"}},
          {"field": {"Name": "parent_guardian_relationship_c"}},
          {"field": {"Name": "parent_guardian_primary_phone_c"}},
          {"field": {"Name": "parent_guardian_secondary_phone_c"}},
          {"field": {"Name": "parent_guardian_primary_email_c"}},
          {"field": {"Name": "parent_guardian_secondary_email_c"}},
          {"field": {"Name": "parent_guardian_address_street_c"}},
          {"field": {"Name": "parent_guardian_address_city_c"}},
          {"field": {"Name": "parent_guardian_address_state_c"}},
          {"field": {"Name": "parent_guardian_address_zip_code_c"}},
          {"field": {"Name": "communication_history_c"}}
        ]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch students:", response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database records to UI format
      return response.data.map(record => ({
        Id: record.Id,
        firstName: record.first_name_c || "",
        lastName: record.last_name_c || "",
        email: record.email_c || "",
        phone: record.phone_c || "",
        dateOfBirth: record.date_of_birth_c || "",
        gradeLevel: record.grade_level_c || "",
        enrollmentStatus: record.enrollment_status_c || "Active",
        studentId: record.student_id_c || "",
        enrollmentDate: record.enrollment_date_c || "",
        address: {
          street: record.address_street_c || "",
          city: record.address_city_c || "",
          state: record.address_state_c || "",
          zipCode: record.address_zip_code_c || ""
        },
        emergencyContact: {
          name: record.emergency_contact_name_c || "",
          relationship: record.emergency_contact_relationship_c || "",
          phone: record.emergency_contact_phone_c || ""
        },
        parentGuardian: {
          name: record.parent_guardian_name_c || "",
          relationship: record.parent_guardian_relationship_c || "",
          primaryPhone: record.parent_guardian_primary_phone_c || "",
          secondaryPhone: record.parent_guardian_secondary_phone_c || "",
          primaryEmail: record.parent_guardian_primary_email_c || "",
          secondaryEmail: record.parent_guardian_secondary_email_c || "",
          address: {
            street: record.parent_guardian_address_street_c || "",
            city: record.parent_guardian_address_city_c || "",
            state: record.parent_guardian_address_state_c || "",
            zipCode: record.parent_guardian_address_zip_code_c || ""
          }
        },
        communicationHistory: this.parseCommunicationHistory(record.communication_history_c)
      }));
      
    } catch (error) {
      console.error("Error fetching students:", error?.response?.data?.message || error);
      toast.error("Failed to load students. Please try again.");
      return [];
    }
  }

async getById(id) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "date_of_birth_c"}},
          {"field": {"Name": "grade_level_c"}},
          {"field": {"Name": "enrollment_status_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "address_street_c"}},
          {"field": {"Name": "address_city_c"}},
          {"field": {"Name": "address_state_c"}},
          {"field": {"Name": "address_zip_code_c"}},
          {"field": {"Name": "emergency_contact_name_c"}},
          {"field": {"Name": "emergency_contact_relationship_c"}},
          {"field": {"Name": "emergency_contact_phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "parent_guardian_name_c"}},
          {"field": {"Name": "parent_guardian_relationship_c"}},
          {"field": {"Name": "parent_guardian_primary_phone_c"}},
          {"field": {"Name": "parent_guardian_secondary_phone_c"}},
          {"field": {"Name": "parent_guardian_primary_email_c"}},
          {"field": {"Name": "parent_guardian_secondary_email_c"}},
          {"field": {"Name": "parent_guardian_address_street_c"}},
          {"field": {"Name": "parent_guardian_address_city_c"}},
          {"field": {"Name": "parent_guardian_address_state_c"}},
          {"field": {"Name": "parent_guardian_address_zip_code_c"}},
          {"field": {"Name": "communication_history_c"}}
        ]
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        toast.error("Student not found");
        return null;
      }
      
      const record = response.data;
      return {
        Id: record.Id,
        firstName: record.first_name_c || "",
        lastName: record.last_name_c || "",
        email: record.email_c || "",
        phone: record.phone_c || "",
        dateOfBirth: record.date_of_birth_c || "",
        gradeLevel: record.grade_level_c || "",
        enrollmentStatus: record.enrollment_status_c || "Active",
        studentId: record.student_id_c || "",
        enrollmentDate: record.enrollment_date_c || "",
        address: {
          street: record.address_street_c || "",
          city: record.address_city_c || "",
          state: record.address_state_c || "",
          zipCode: record.address_zip_code_c || ""
        },
        emergencyContact: {
          name: record.emergency_contact_name_c || "",
          relationship: record.emergency_contact_relationship_c || "",
          phone: record.emergency_contact_phone_c || ""
        },
        parentGuardian: {
          name: record.parent_guardian_name_c || "",
          relationship: record.parent_guardian_relationship_c || "",
          primaryPhone: record.parent_guardian_primary_phone_c || "",
          secondaryPhone: record.parent_guardian_secondary_phone_c || "",
          primaryEmail: record.parent_guardian_primary_email_c || "",
          secondaryEmail: record.parent_guardian_secondary_email_c || "",
          address: {
            street: record.parent_guardian_address_street_c || "",
            city: record.parent_guardian_address_city_c || "",
            state: record.parent_guardian_address_state_c || "",
            zipCode: record.parent_guardian_address_zip_code_c || ""
          }
        },
        communicationHistory: this.parseCommunicationHistory(record.communication_history_c)
      };
      
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load student details. Please try again.");
      return null;
    }
  }

async create(studentData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Name: `${studentData.firstName} ${studentData.lastName}`,
          first_name_c: studentData.firstName || "",
          last_name_c: studentData.lastName || "",
          email_c: studentData.email || "",
          phone_c: studentData.phone || "",
          date_of_birth_c: studentData.dateOfBirth || "",
          grade_level_c: studentData.gradeLevel || "",
          enrollment_status_c: studentData.enrollmentStatus || "Active",
          student_id_c: studentData.studentId || `STU${Date.now()}`,
          address_street_c: studentData.address?.street || "",
          address_city_c: studentData.address?.city || "",
          address_state_c: studentData.address?.state || "",
          address_zip_code_c: studentData.address?.zipCode || "",
          emergency_contact_name_c: studentData.emergencyContact?.name || "",
          emergency_contact_relationship_c: studentData.emergencyContact?.relationship || "",
          emergency_contact_phone_c: studentData.emergencyContact?.phone || "",
          enrollment_date_c: studentData.enrollmentDate || new Date().toISOString().split("T")[0],
          parent_guardian_name_c: studentData.parentGuardian?.name || "",
          parent_guardian_relationship_c: studentData.parentGuardian?.relationship || "",
          parent_guardian_primary_phone_c: studentData.parentGuardian?.primaryPhone || "",
          parent_guardian_secondary_phone_c: studentData.parentGuardian?.secondaryPhone || "",
          parent_guardian_primary_email_c: studentData.parentGuardian?.primaryEmail || "",
          parent_guardian_secondary_email_c: studentData.parentGuardian?.secondaryEmail || "",
          parent_guardian_address_street_c: studentData.parentGuardian?.address?.street || "",
          parent_guardian_address_city_c: studentData.parentGuardian?.address?.city || "",
          parent_guardian_address_state_c: studentData.parentGuardian?.address?.state || "",
          parent_guardian_address_zip_code_c: studentData.parentGuardian?.address?.zipCode || "",
          communication_history_c: this.serializeCommunicationHistory(studentData.communicationHistory || [])
        }]
      };
      
      const response = await client.createRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to create student:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create student:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create student");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
// Send email notification after successful student creation
      if (successful.length > 0) {
        try {
          const { ApperClient } = window.ApperSDK;
          const apperClient = new ApperClient({
            apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
            apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
          });
          
          await apperClient.functions.invoke(import.meta.env.VITE_SEND_STUDENT_NOTIFICATION, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              studentData: studentData
            })
          });
        } catch (emailError) {
          console.error('Failed to send student notification email:', emailError);
          // Don't throw error here - student creation was successful
        }
      }
      
    } catch (error) {
      console.error("Error creating student:", error?.response?.data?.message || error);
      throw error;
    }
  }

async update(id, studentData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Id: parseInt(id),
          Name: `${studentData.firstName} ${studentData.lastName}`,
          first_name_c: studentData.firstName || "",
          last_name_c: studentData.lastName || "",
          email_c: studentData.email || "",
          phone_c: studentData.phone || "",
          date_of_birth_c: studentData.dateOfBirth || "",
          grade_level_c: studentData.gradeLevel || "",
          enrollment_status_c: studentData.enrollmentStatus || "Active",
          student_id_c: studentData.studentId || "",
          address_street_c: studentData.address?.street || "",
          address_city_c: studentData.address?.city || "",
          address_state_c: studentData.address?.state || "",
          address_zip_code_c: studentData.address?.zipCode || "",
          emergency_contact_name_c: studentData.emergencyContact?.name || "",
          emergency_contact_relationship_c: studentData.emergencyContact?.relationship || "",
          emergency_contact_phone_c: studentData.emergencyContact?.phone || "",
          enrollment_date_c: studentData.enrollmentDate || "",
          parent_guardian_name_c: studentData.parentGuardian?.name || "",
          parent_guardian_relationship_c: studentData.parentGuardian?.relationship || "",
          parent_guardian_primary_phone_c: studentData.parentGuardian?.primaryPhone || "",
          parent_guardian_secondary_phone_c: studentData.parentGuardian?.secondaryPhone || "",
          parent_guardian_primary_email_c: studentData.parentGuardian?.primaryEmail || "",
          parent_guardian_secondary_email_c: studentData.parentGuardian?.secondaryEmail || "",
          parent_guardian_address_street_c: studentData.parentGuardian?.address?.street || "",
          parent_guardian_address_city_c: studentData.parentGuardian?.address?.city || "",
          parent_guardian_address_state_c: studentData.parentGuardian?.address?.state || "",
          parent_guardian_address_zip_code_c: studentData.parentGuardian?.address?.zipCode || "",
          communication_history_c: this.serializeCommunicationHistory(studentData.communicationHistory || [])
        }]
      };
      
      const response = await client.updateRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to update student:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update student:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update student");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error updating student:", error?.response?.data?.message || error);
      throw error;
    }
  }

async delete(id) {
    try {
      const client = this.ensureClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await client.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to delete student:", response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete student:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        return successful.length > 0;
      }
      
      return true;
      
    } catch (error) {
      console.error("Error deleting student:", error?.response?.data?.message || error);
      toast.error("Failed to delete student. Please try again.");
      return false;
    }
  }

async bulkImport(file) {
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
        try {
          await this.create(studentData);
          successCount++;
        } catch (error) {
          duplicates.push({
            email: studentData.email,
            name: `${studentData.firstName} ${studentData.lastName}`,
            error: error.message
          });
        }
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
            errors: [duplicate.error || `Student with email ${duplicate.email} already exists`],
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
    try {
      const students = await this.getAll();
      
      const exportData = students.map(student => ({
        Id: student.Id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        address: `${student.address?.street || ''}, ${student.address?.city || ''}, ${student.address?.state || ''} ${student.address?.zipCode || ''}`.trim(),
        emergencyContact: `${student.emergencyContact?.name || ''} - ${student.emergencyContact?.phone || ''}`,
        grade: student.gradeLevel,
        status: student.enrollmentStatus,
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

  // Helper methods for communication history
  parseCommunicationHistory(historyText) {
    if (!historyText) return [];
    try {
      return JSON.parse(historyText);
    } catch {
      return [];
    }
  }

  serializeCommunicationHistory(history) {
    if (!history || history.length === 0) return "";
    return JSON.stringify(history);
  }
}

export const studentService = new StudentService();