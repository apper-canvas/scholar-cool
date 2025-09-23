import coursesData from "@/services/mockData/courses.json";

class CourseService {
  constructor() {
    this.courses = [...coursesData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.courses];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const course = this.courses.find(c => c.Id === parseInt(id));
    if (!course) {
      throw new Error("Course not found");
    }
    return { ...course };
  }

  async create(courseData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.courses.map(c => c.Id), 0);
    const newCourse = {
      ...courseData,
      Id: maxId + 1,
      enrolledStudents: courseData.enrolledStudents || []
    };
    
    this.courses.push(newCourse);
    return { ...newCourse };
  }

  async update(id, courseData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.courses.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Course not found");
    }
    
    this.courses[index] = {
      ...this.courses[index],
      ...courseData,
      Id: parseInt(id)
    };
    
    return { ...this.courses[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.courses.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Course not found");
    }
    
    this.courses.splice(index, 1);
    return true;
  }

  async enrollStudent(courseId, studentId) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const course = this.courses.find(c => c.Id === parseInt(courseId));
    if (!course) {
      throw new Error("Course not found");
    }
    
    if (!course.enrolledStudents.includes(parseInt(studentId))) {
      course.enrolledStudents.push(parseInt(studentId));
    }
    
    return { ...course };
  }

  async unenrollStudent(courseId, studentId) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const course = this.courses.find(c => c.Id === parseInt(courseId));
    if (!course) {
      throw new Error("Course not found");
    }
    
    course.enrolledStudents = course.enrolledStudents.filter(id => id !== parseInt(studentId));
    return { ...course };
  }
}

export const courseService = new CourseService();