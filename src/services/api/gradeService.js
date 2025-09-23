import gradesData from "@/services/mockData/grades.json";

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
}

export const gradeService = new GradeService();