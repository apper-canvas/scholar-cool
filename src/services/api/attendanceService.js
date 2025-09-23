import attendanceData from "@/services/mockData/attendance.json";

class AttendanceService {
  constructor() {
    this.attendance = [...attendanceData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.attendance];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const record = this.attendance.find(a => a.Id === parseInt(id));
    if (!record) {
      throw new Error("Attendance record not found");
    }
    return { ...record };
  }

  async getByStudentId(studentId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.attendance.filter(a => a.studentId === parseInt(studentId));
  }

  async getByDate(date) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.attendance.filter(a => a.date === date);
  }

  async create(attendanceData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.attendance.map(a => a.Id), 0);
    const newRecord = {
      ...attendanceData,
      Id: maxId + 1,
      studentId: parseInt(attendanceData.studentId),
      courseId: parseInt(attendanceData.courseId),
      recordedBy: attendanceData.recordedBy || "System"
    };
    
    this.attendance.push(newRecord);
    return { ...newRecord };
  }

  async update(id, attendanceData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.attendance.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Attendance record not found");
    }
    
    this.attendance[index] = {
      ...this.attendance[index],
      ...attendanceData,
      Id: parseInt(id),
      studentId: parseInt(attendanceData.studentId),
      courseId: parseInt(attendanceData.courseId)
    };
    
    return { ...this.attendance[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.attendance.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Attendance record not found");
    }
    
    this.attendance.splice(index, 1);
    return true;
  }
}

export const attendanceService = new AttendanceService();