import { parseCSV, generateCSV, validateGradeData, normalizeGradeData } from "@/utils/csvUtils";
import { toast } from "react-toastify";

class GradeService {
  constructor() {
    this.tableName = 'grade_c';
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
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "percentage_c"}},
          {"field": {"Name": "letter_grade_c"}},
          {"field": {"Name": "date_recorded_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch grades:", response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database records to UI format
      return response.data.map(record => ({
        Id: record.Id,
        assignmentName: record.assignment_name_c || "",
        category: record.category_c || "",
        points: record.points_c || 0,
        maxPoints: record.max_points_c || 0,
        percentage: record.percentage_c || 0,
        letterGrade: record.letter_grade_c || "",
        dateRecorded: record.date_recorded_c || "",
        semester: record.semester_c || "",
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c
      }));
      
    } catch (error) {
      console.error("Error fetching grades:", error?.response?.data?.message || error);
      toast.error("Failed to load grades. Please try again.");
      return [];
    }
  }

async getById(id) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "percentage_c"}},
          {"field": {"Name": "letter_grade_c"}},
          {"field": {"Name": "date_recorded_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        toast.error("Grade not found");
        return null;
      }
      
      const record = response.data;
      return {
        Id: record.Id,
        assignmentName: record.assignment_name_c || "",
        category: record.category_c || "",
        points: record.points_c || 0,
        maxPoints: record.max_points_c || 0,
        percentage: record.percentage_c || 0,
        letterGrade: record.letter_grade_c || "",
        dateRecorded: record.date_recorded_c || "",
        semester: record.semester_c || "",
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c
      };
      
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load grade details. Please try again.");
      return null;
    }
  }

async getByStudentId(studentId) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "percentage_c"}},
          {"field": {"Name": "letter_grade_c"}},
          {"field": {"Name": "date_recorded_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{"FieldName": "student_id_c", "Operator": "EqualTo", "Values": [parseInt(studentId)]}]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch grades by student:", response.message);
        return [];
      }
      
      return response.data.map(record => ({
        Id: record.Id,
        assignmentName: record.assignment_name_c || "",
        category: record.category_c || "",
        points: record.points_c || 0,
        maxPoints: record.max_points_c || 0,
        percentage: record.percentage_c || 0,
        letterGrade: record.letter_grade_c || "",
        dateRecorded: record.date_recorded_c || "",
        semester: record.semester_c || "",
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c
      }));
      
    } catch (error) {
      console.error("Error fetching grades by student:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByCourseId(courseId) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "percentage_c"}},
          {"field": {"Name": "letter_grade_c"}},
          {"field": {"Name": "date_recorded_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{"FieldName": "course_id_c", "Operator": "EqualTo", "Values": [parseInt(courseId)]}]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch grades by course:", response.message);
        return [];
      }
      
      return response.data.map(record => ({
        Id: record.Id,
        assignmentName: record.assignment_name_c || "",
        category: record.category_c || "",
        points: record.points_c || 0,
        maxPoints: record.max_points_c || 0,
        percentage: record.percentage_c || 0,
        letterGrade: record.letter_grade_c || "",
        dateRecorded: record.date_recorded_c || "",
        semester: record.semester_c || "",
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c
      }));
      
    } catch (error) {
      console.error("Error fetching grades by course:", error?.response?.data?.message || error);
      return [];
    }
  }

async create(gradeData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Name: gradeData.assignmentName,
          assignment_name_c: gradeData.assignmentName || "",
          category_c: gradeData.category || "",
          points_c: parseFloat(gradeData.points) || 0,
          max_points_c: parseFloat(gradeData.maxPoints) || 0,
          percentage_c: parseFloat(gradeData.percentage) || 0,
          letter_grade_c: gradeData.letterGrade || "",
          date_recorded_c: gradeData.dateRecorded || new Date().toISOString().split("T")[0],
          semester_c: gradeData.semester || "",
          student_id_c: parseInt(gradeData.studentId),
          course_id_c: parseInt(gradeData.courseId)
        }]
      };
      
      const response = await client.createRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to create grade:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create grade:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create grade");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error creating grade:", error?.response?.data?.message || error);
      throw error;
    }
  }

async update(id, gradeData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Id: parseInt(id),
          Name: gradeData.assignmentName,
          assignment_name_c: gradeData.assignmentName || "",
          category_c: gradeData.category || "",
          points_c: parseFloat(gradeData.points) || 0,
          max_points_c: parseFloat(gradeData.maxPoints) || 0,
          percentage_c: parseFloat(gradeData.percentage) || 0,
          letter_grade_c: gradeData.letterGrade || "",
          date_recorded_c: gradeData.dateRecorded || "",
          semester_c: gradeData.semester || "",
          student_id_c: parseInt(gradeData.studentId),
          course_id_c: parseInt(gradeData.courseId)
        }]
      };
      
      const response = await client.updateRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to update grade:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update grade:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update grade");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error updating grade:", error?.response?.data?.message || error);
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
        console.error("Failed to delete grade:", response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete grade:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        return successful.length > 0;
      }
      
      return true;
      
    } catch (error) {
      console.error("Error deleting grade:", error?.response?.data?.message || error);
      toast.error("Failed to delete grade. Please try again.");
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
      const normalizedData = normalizeGradeData(rawData);
      
      // Validate data
      const validationErrors = validateGradeData(normalizedData);
      
      // Process valid records
      const validRecords = normalizedData.filter((_, index) => 
        !validationErrors.some(error => error.row === index + 1)
      );
      
      let successCount = 0;
      const duplicates = [];
      
      for (const gradeData of validRecords) {
        try {
          await this.create(gradeData);
          successCount++;
        } catch (error) {
          duplicates.push({
            studentId: gradeData.studentId,
            courseId: gradeData.courseId,
            assignmentName: gradeData.assignmentName,
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
            errors: [duplicate.error || `Grade for student ${duplicate.studentId}, course ${duplicate.courseId}, assignment "${duplicate.assignmentName}" already exists`],
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
      const grades = await this.getAll();
      
      const exportData = grades.map(grade => ({
        Id: grade.Id,
        studentId: grade.studentId,
        courseId: grade.courseId,
        assignmentName: grade.assignmentName,
        category: grade.category,
        points: grade.points,
        maxPoints: grade.maxPoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        dateRecorded: grade.dateRecorded,
        semester: grade.semester,
        comments: grade.comments || ''
      }));
      
      const timestamp = new Date().toISOString().split('T')[0];
      generateCSV(exportData, `grades-export-${timestamp}.csv`);
      
      return { success: true, count: exportData.length };
      
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }
}
export const gradeService = new GradeService();