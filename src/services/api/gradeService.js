import gradesData from "@/services/mockData/grades.json";
import { parseCSV, generateCSV, validateGradeData, normalizeGradeData } from "@/utils/csvUtils";
class GradeService {
  constructor() {
    this.grades = [...gradesData];
  }

async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.grades];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const grade = this.grades.find(g => g.Id === parseInt(id));
    if (!grade) {
      throw new Error("Grade not found");
    }
    return { ...grade };
  }

  async getByStudentId(studentId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.grades.filter(g => g.studentId === parseInt(studentId));
  }

  async getByCourseId(courseId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.grades.filter(g => g.courseId === parseInt(courseId));
  }

  async create(gradeData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.grades.map(g => g.Id), 0);
    const newGrade = {
      ...gradeData,
      Id: maxId + 1,
      studentId: parseInt(gradeData.studentId),
      courseId: parseInt(gradeData.courseId),
      dateRecorded: gradeData.dateRecorded || new Date().toISOString().split("T")[0]
    };
    
    this.grades.push(newGrade);
    return { ...newGrade };
  }

  async update(id, gradeData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    this.grades[index] = {
      ...this.grades[index],
      ...gradeData,
      Id: parseInt(id),
      studentId: parseInt(gradeData.studentId),
      courseId: parseInt(gradeData.courseId)
    };
    
    return { ...this.grades[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    this.grades.splice(index, 1);
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
        // Check for existing grade with same student, course, and assignment
        const existingGrade = this.grades.find(g => 
          g.studentId === gradeData.studentId &&
          g.courseId === gradeData.courseId &&
          g.assignmentName.toLowerCase() === gradeData.assignmentName.toLowerCase()
        );
        
        if (existingGrade) {
          duplicates.push({
            studentId: gradeData.studentId,
            courseId: gradeData.courseId,
            assignmentName: gradeData.assignmentName
          });
          continue;
        }
        
        // Create new grade
        const maxId = Math.max(...this.grades.map(g => g.Id), 0);
        const newGrade = {
          ...gradeData,
          Id: maxId + successCount + 1
        };
        
        this.grades.push(newGrade);
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
            errors: [`Grade for student ${duplicate.studentId}, course ${duplicate.courseId}, assignment "${duplicate.assignmentName}" already exists`],
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
      const exportData = this.grades.map(grade => ({
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