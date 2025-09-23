import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { attendanceService } from "@/services/api/attendanceService";
import { studentService } from "@/services/api/studentService";
import { courseService } from "@/services/api/courseService";
import { toast } from "react-toastify";
import { format, startOfWeek, addDays, isToday, parseISO } from "date-fns";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [view, setView] = useState("daily"); // daily, weekly

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [attendanceData, studentsData, coursesData] = await Promise.all([
        attendanceService.getAll(),
        studentService.getAll(),
        courseService.getAll()
      ]);
      
      setAttendance(attendanceData);
      setStudents(studentsData.filter(s => s.enrollmentStatus === "Active"));
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to load attendance data. Please try again.");
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAttendanceChange = async (studentId, date, status) => {
    try {
      // Find existing attendance record
      const existingRecord = attendance.find(record => 
        record.studentId.toString() === studentId.toString() && 
        record.date === date &&
        (selectedCourse === "" || record.courseId.toString() === selectedCourse)
      );

      if (existingRecord) {
        // Update existing record
        await attendanceService.update(existingRecord.Id, {
          ...existingRecord,
          status
        });
      } else {
        // Create new record
        await attendanceService.create({
          studentId: parseInt(studentId),
          date,
          status,
          courseId: selectedCourse ? parseInt(selectedCourse) : 1, // Default to first course
          notes: "",
          recordedBy: "System"
        });
      }

      await loadData();
      toast.success("Attendance updated successfully");
    } catch (err) {
      console.error("Error updating attendance:", err);
      toast.error("Failed to update attendance");
    }
  };

  const getAttendanceStatus = (studentId, date) => {
    const record = attendance.find(record => 
      record.studentId.toString() === studentId.toString() && 
      record.date === date &&
      (selectedCourse === "" || record.courseId.toString() === selectedCourse)
    );
    return record ? record.status : "Present";
  };

  const getStatusBadge = (status) => {
    const variants = {
      "Present": "success",
      "Absent": "error", 
      "Late": "warning",
      "Excused": "info"
    };
    const colors = {
      "Present": "bg-success text-white",
      "Absent": "bg-error text-white",
      "Late": "bg-warning text-white", 
      "Excused": "bg-info text-white"
    };
    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const getWeekDays = (startDate) => {
    const start = startOfWeek(parseISO(startDate));
    return Array.from({ length: 5 }, (_, i) => addDays(start, i + 1)); // Monday to Friday
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const courseOptions = courses.map(course => ({
    value: course.Id.toString(),
    label: course.courseName
  }));

  const statusOptions = ["Present", "Absent", "Late", "Excused"];

  const weekDays = view === "weekly" ? getWeekDays(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-secondary mt-2">
            Track and record student attendance for each class
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === "daily" ? "primary" : "secondary"}
            size="small"
            onClick={() => setView("daily")}
          >
            Daily
          </Button>
          <Button
            variant={view === "weekly" ? "primary" : "secondary"}
            size="small"
            onClick={() => setView("weekly")}
          >
            Weekly
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="space-y-2">
            <label className="form-label text-sm">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label text-sm">Course</label>
            <FilterDropdown
              options={courseOptions}
              value={selectedCourse}
              onChange={setSelectedCourse}
              placeholder="All Courses"
            />
          </div>
        </div>

        {isToday(parseISO(selectedDate)) && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-success font-medium">Today</span>
          </div>
        )}
      </div>

      {/* Content */}
      {students.length === 0 ? (
        <Empty
          title="No active students found"
          description="Add students to start taking attendance."
          action={() => window.location.href = "/students?action=create"}
          actionLabel="Add Students"
          icon="Users"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Student ID</th>
                  <th className="table-header">Grade</th>
                  {view === "daily" ? (
                    <th className="table-header">
                      Attendance - {format(parseISO(selectedDate), "MMM d, yyyy")}
                    </th>
                  ) : (
                    weekDays.map(day => (
                      <th key={day.toISOString()} className="table-header text-center">
                        <div className="flex flex-col">
                          <span>{format(day, "EEE")}</span>
                          <span className="text-xs text-secondary">{format(day, "M/d")}</span>
                        </div>
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.Id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs">
                      {student.studentId}
                    </td>
                    <td className="table-cell">
                      <span className="text-sm font-medium">Grade {student.gradeLevel}</span>
                    </td>
                    {view === "daily" ? (
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(getAttendanceStatus(student.Id, selectedDate))}
                          <div className="flex space-x-1">
                            {statusOptions.map(status => (
                              <button
                                key={status}
                                onClick={() => handleAttendanceChange(student.Id, selectedDate, status)}
                                className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                                  getAttendanceStatus(student.Id, selectedDate) === status
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                title={`Mark as ${status}`}
                              >
                                {status.charAt(0)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    ) : (
                      weekDays.map(day => (
                        <td key={day.toISOString()} className="table-cell text-center">
                          <div className="flex justify-center">
                            {getStatusBadge(getAttendanceStatus(student.Id, format(day, "yyyy-MM-dd")))}
                          </div>
                          <div className="flex justify-center space-x-1 mt-1">
                            {statusOptions.map(status => (
                              <button
                                key={status}
                                onClick={() => handleAttendanceChange(student.Id, format(day, "yyyy-MM-dd"), status)}
                                className="w-4 h-4 text-xs rounded transition-colors duration-200 hover:bg-gray-200 flex items-center justify-center"
                                title={`Mark as ${status}`}
                              >
                                {status.charAt(0)}
                              </button>
                            ))}
                          </div>
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusOptions.map(status => {
          const count = students.reduce((total, student) => {
            const studentStatus = getAttendanceStatus(student.Id, selectedDate);
            return total + (studentStatus === status ? 1 : 0);
          }, 0);
          
          return (
            <div key={status} className="card text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-secondary">{status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Attendance;