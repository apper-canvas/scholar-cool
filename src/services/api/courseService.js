import { toast } from "react-toastify";

class CourseService {
  constructor() {
    this.tableName = 'course_c';
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
          {"field": {"Name": "course_name_c"}},
          {"field": {"Name": "course_code_c"}},
          {"field": {"Name": "teacher_c"}},
          {"field": {"Name": "credit_hours_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "schedule_days_c"}},
          {"field": {"Name": "schedule_start_time_c"}},
          {"field": {"Name": "schedule_end_time_c"}},
          {"field": {"Name": "schedule_room_c"}},
          {"field": {"Name": "enrolled_students_c"}}
        ]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch courses:", response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database records to UI format
      return response.data.map(record => ({
        Id: record.Id,
        courseName: record.course_name_c || "",
        courseCode: record.course_code_c || "",
        teacher: record.teacher_c || "",
        creditHours: record.credit_hours_c || 0,
        semester: record.semester_c || "",
        schedule: {
          days: this.parseScheduleDays(record.schedule_days_c),
          startTime: record.schedule_start_time_c || "",
          endTime: record.schedule_end_time_c || "",
          room: record.schedule_room_c || ""
        },
        enrolledStudents: this.parseEnrolledStudents(record.enrolled_students_c)
      }));
      
    } catch (error) {
      console.error("Error fetching courses:", error?.response?.data?.message || error);
      toast.error("Failed to load courses. Please try again.");
      return [];
    }
  }

  async getById(id) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "course_name_c"}},
          {"field": {"Name": "course_code_c"}},
          {"field": {"Name": "teacher_c"}},
          {"field": {"Name": "credit_hours_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "schedule_days_c"}},
          {"field": {"Name": "schedule_start_time_c"}},
          {"field": {"Name": "schedule_end_time_c"}},
          {"field": {"Name": "schedule_room_c"}},
          {"field": {"Name": "enrolled_students_c"}}
        ]
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        toast.error("Course not found");
        return null;
      }
      
      const record = response.data;
      return {
        Id: record.Id,
        courseName: record.course_name_c || "",
        courseCode: record.course_code_c || "",
        teacher: record.teacher_c || "",
        creditHours: record.credit_hours_c || 0,
        semester: record.semester_c || "",
        schedule: {
          days: this.parseScheduleDays(record.schedule_days_c),
          startTime: record.schedule_start_time_c || "",
          endTime: record.schedule_end_time_c || "",
          room: record.schedule_room_c || ""
        },
        enrolledStudents: this.parseEnrolledStudents(record.enrolled_students_c)
      };
      
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load course details. Please try again.");
      return null;
    }
  }

  async create(courseData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Name: courseData.courseName,
          course_name_c: courseData.courseName || "",
          course_code_c: courseData.courseCode || "",
          teacher_c: courseData.teacher || "",
          credit_hours_c: parseInt(courseData.creditHours) || 0,
          semester_c: courseData.semester || "",
          schedule_days_c: this.serializeScheduleDays(courseData.schedule?.days || []),
          schedule_start_time_c: courseData.schedule?.startTime || "",
          schedule_end_time_c: courseData.schedule?.endTime || "",
          schedule_room_c: courseData.schedule?.room || "",
          enrolled_students_c: this.serializeEnrolledStudents(courseData.enrolledStudents || [])
        }]
      };
      
      const response = await client.createRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to create course:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create course:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create course");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error creating course:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, courseData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Id: parseInt(id),
          Name: courseData.courseName,
          course_name_c: courseData.courseName || "",
          course_code_c: courseData.courseCode || "",
          teacher_c: courseData.teacher || "",
          credit_hours_c: parseInt(courseData.creditHours) || 0,
          semester_c: courseData.semester || "",
          schedule_days_c: this.serializeScheduleDays(courseData.schedule?.days || []),
          schedule_start_time_c: courseData.schedule?.startTime || "",
          schedule_end_time_c: courseData.schedule?.endTime || "",
          schedule_room_c: courseData.schedule?.room || "",
          enrolled_students_c: this.serializeEnrolledStudents(courseData.enrolledStudents || [])
        }]
      };
      
      const response = await client.updateRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to update course:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update course:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update course");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error updating course:", error?.response?.data?.message || error);
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
        console.error("Failed to delete course:", response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete course:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        return successful.length > 0;
      }
      
      return true;
      
    } catch (error) {
      console.error("Error deleting course:", error?.response?.data?.message || error);
      toast.error("Failed to delete course. Please try again.");
      return false;
    }
  }

  async enrollStudent(courseId, studentId) {
    try {
      const course = await this.getById(courseId);
      if (!course) throw new Error("Course not found");
      
      const enrolledStudents = [...course.enrolledStudents];
      if (!enrolledStudents.includes(parseInt(studentId))) {
        enrolledStudents.push(parseInt(studentId));
        await this.update(courseId, { ...course, enrolledStudents });
      }
      
      return course;
    } catch (error) {
      console.error("Error enrolling student:", error);
      throw error;
    }
  }

  async unenrollStudent(courseId, studentId) {
    try {
      const course = await this.getById(courseId);
      if (!course) throw new Error("Course not found");
      
      const enrolledStudents = course.enrolledStudents.filter(id => id !== parseInt(studentId));
      await this.update(courseId, { ...course, enrolledStudents });
      
      return course;
    } catch (error) {
      console.error("Error unenrolling student:", error);
      throw error;
    }
  }

  // Helper methods for data serialization
  parseScheduleDays(daysText) {
    if (!daysText) return [];
    try {
      return JSON.parse(daysText);
    } catch {
      return daysText.split(',').map(d => d.trim()).filter(d => d);
    }
  }

  serializeScheduleDays(days) {
    if (!days || days.length === 0) return "";
    return JSON.stringify(days);
  }

  parseEnrolledStudents(studentsText) {
    if (!studentsText) return [];
    try {
      const parsed = JSON.parse(studentsText);
      return Array.isArray(parsed) ? parsed.map(id => parseInt(id)) : [];
    } catch {
      return studentsText.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }
  }

  serializeEnrolledStudents(students) {
    if (!students || students.length === 0) return "";
    return JSON.stringify(students.map(id => parseInt(id)));
  }
}

export const courseService = new CourseService();