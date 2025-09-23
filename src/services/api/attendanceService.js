import { toast } from "react-toastify";

class AttendanceService {
  constructor() {
    this.tableName = 'attendance_c';
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
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "recorded_by_c"}}
        ]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch attendance:", response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database records to UI format
      return response.data.map(record => ({
        Id: record.Id,
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c,
        date: record.date_c || "",
        status: record.status_c || "",
        notes: record.notes_c || "",
        recordedBy: record.recorded_by_c || ""
      }));
      
    } catch (error) {
      console.error("Error fetching attendance:", error?.response?.data?.message || error);
      toast.error("Failed to load attendance. Please try again.");
      return [];
    }
  }

async getById(id) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "recorded_by_c"}}
        ]
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        toast.error("Attendance record not found");
        return null;
      }
      
      const record = response.data;
      return {
        Id: record.Id,
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c,
        date: record.date_c || "",
        status: record.status_c || "",
        notes: record.notes_c || "",
        recordedBy: record.recorded_by_c || ""
      };
      
    } catch (error) {
      console.error(`Error fetching attendance ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load attendance record. Please try again.");
      return null;
    }
  }

async getByStudentId(studentId) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "recorded_by_c"}}
        ],
        where: [{"FieldName": "student_id_c", "Operator": "EqualTo", "Values": [parseInt(studentId)]}]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch attendance by student:", response.message);
        return [];
      }
      
      return response.data.map(record => ({
        Id: record.Id,
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c,
        date: record.date_c || "",
        status: record.status_c || "",
        notes: record.notes_c || "",
        recordedBy: record.recorded_by_c || ""
      }));
      
    } catch (error) {
      console.error("Error fetching attendance by student:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByDate(date) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "recorded_by_c"}}
        ],
        where: [{"FieldName": "date_c", "Operator": "EqualTo", "Values": [date]}]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch attendance by date:", response.message);
        return [];
      }
      
      return response.data.map(record => ({
        Id: record.Id,
        studentId: record.student_id_c?.Id || record.student_id_c,
        courseId: record.course_id_c?.Id || record.course_id_c,
        date: record.date_c || "",
        status: record.status_c || "",
        notes: record.notes_c || "",
        recordedBy: record.recorded_by_c || ""
      }));
      
    } catch (error) {
      console.error("Error fetching attendance by date:", error?.response?.data?.message || error);
      return [];
    }
  }

async create(attendanceData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Name: `${attendanceData.studentId} - ${attendanceData.date}`,
          student_id_c: parseInt(attendanceData.studentId),
          course_id_c: parseInt(attendanceData.courseId),
          date_c: attendanceData.date || "",
          status_c: attendanceData.status || "Present",
          notes_c: attendanceData.notes || "",
          recorded_by_c: attendanceData.recordedBy || "System"
        }]
      };
      
      const response = await client.createRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to create attendance:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create attendance:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create attendance");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error creating attendance:", error?.response?.data?.message || error);
      throw error;
    }
  }
async update(id, attendanceData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Id: parseInt(id),
          Name: `${attendanceData.studentId} - ${attendanceData.date}`,
          student_id_c: parseInt(attendanceData.studentId),
          course_id_c: parseInt(attendanceData.courseId),
          date_c: attendanceData.date || "",
          status_c: attendanceData.status || "Present",
          notes_c: attendanceData.notes || "",
          recorded_by_c: attendanceData.recordedBy || "System"
        }]
      };
      
      const response = await client.updateRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to update attendance:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update attendance:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update attendance");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error updating attendance:", error?.response?.data?.message || error);
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
        console.error("Failed to delete attendance:", response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete attendance:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        return successful.length > 0;
      }
      
      return true;
      
    } catch (error) {
      console.error("Error deleting attendance:", error?.response?.data?.message || error);
      toast.error("Failed to delete attendance. Please try again.");
      return false;
    }
  }
}

export const attendanceService = new AttendanceService();