import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import StatsCard from "@/components/molecules/StatsCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { studentService } from "@/services/api/studentService";
import { gradeService } from "@/services/api/gradeService";
import { attendanceService } from "@/services/api/attendanceService";
import { courseService } from "@/services/api/courseService";
import { toast } from "react-toastify";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split("T")[0], // First day of current month
    endDate: new Date().toISOString().split("T")[0] // Today
  });
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  
  const [data, setData] = useState({
    students: [],
    grades: [],
    attendance: [],
    courses: []
  });
  
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, gradesData, attendanceData, coursesData] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll(),
        courseService.getAll()
      ]);
      
      setData({
        students: studentsData,
        grades: gradesData,
        attendance: attendanceData,
        courses: coursesData
      });
      
      // Generate initial overview report
      generateOverviewReport(studentsData, gradesData, attendanceData, coursesData);
      
    } catch (err) {
      setError("Failed to load data for reports. Please try again.");
      console.error("Error loading report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateOverviewReport = (students, grades, attendance, courses) => {
    const activeStudents = students.filter(s => s.enrollmentStatus === "Active");
    
    // Calculate average GPA
    const gradesByStudent = grades.reduce((acc, grade) => {
      if (!acc[grade.studentId]) acc[grade.studentId] = [];
      acc[grade.studentId].push(grade.percentage);
      return acc;
    }, {});
    
    const gpas = Object.values(gradesByStudent).map(studentGrades => {
      const avgPercentage = studentGrades.reduce((sum, grade) => sum + grade, 0) / studentGrades.length;
      return convertToGPA(avgPercentage);
    });
    
    const averageGPA = gpas.length > 0 ? (gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length).toFixed(2) : "0.00";
    
    // Calculate attendance rate
    const totalAttendanceRecords = attendance.length;
    const presentRecords = attendance.filter(record => record.status === "Present").length;
    const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 0;
    
    // Grade distribution
    const gradeDistribution = grades.reduce((acc, grade) => {
      acc[grade.letterGrade] = (acc[grade.letterGrade] || 0) + 1;
      return acc;
    }, {});
    
    setReportData({
      type: "overview",
      summary: {
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        totalCourses: courses.length,
        averageGPA,
        attendanceRate,
        totalGrades: grades.length
      },
      gradeDistribution,
      generatedAt: new Date().toISOString()
    });
  };

  const generateStudentReport = async (studentId) => {
    setGenerating(true);
    try {
      const student = data.students.find(s => s.Id.toString() === studentId);
      if (!student) {
        toast.error("Student not found");
        return;
      }

      const studentGrades = data.grades.filter(g => g.studentId.toString() === studentId);
      const studentAttendance = data.attendance.filter(a => a.studentId.toString() === studentId);
      
      // Calculate GPA
      const gradePoints = studentGrades.map(grade => convertToGPA(grade.percentage));
      const gpa = gradePoints.length > 0 ? 
        (gradePoints.reduce((sum, points) => sum + points, 0) / gradePoints.length).toFixed(2) : "0.00";
      
      // Attendance rate
      const presentCount = studentAttendance.filter(record => record.status === "Present").length;
      const attendanceRate = studentAttendance.length > 0 ? 
        Math.round((presentCount / studentAttendance.length) * 100) : 0;
      
      // Group grades by course
      const gradesByCourse = studentGrades.reduce((acc, grade) => {
        const course = data.courses.find(c => c.Id.toString() === grade.courseId.toString());
        const courseName = course ? course.courseName : "Unknown Course";
        
        if (!acc[courseName]) acc[courseName] = [];
        acc[courseName].push(grade);
        return acc;
      }, {});

      setReportData({
        type: "student",
        student,
        summary: {
          gpa,
          attendanceRate,
          totalGrades: studentGrades.length,
          coursesEnrolled: Object.keys(gradesByCourse).length
        },
        gradesByCourse,
        attendanceHistory: studentAttendance,
        generatedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error("Error generating student report:", err);
      toast.error("Failed to generate student report");
    } finally {
      setGenerating(false);
    }
  };

  const generateCourseReport = async (courseId) => {
    setGenerating(true);
    try {
      const course = data.courses.find(c => c.Id.toString() === courseId);
      if (!course) {
        toast.error("Course not found");
        return;
      }

      const courseGrades = data.grades.filter(g => g.courseId.toString() === courseId);
      const courseAttendance = data.attendance.filter(a => a.courseId.toString() === courseId);
      
      // Get unique students in this course
      const studentIds = [...new Set(courseGrades.map(g => g.studentId))];
      const enrolledStudents = data.students.filter(s => 
        studentIds.includes(s.Id) || (course.enrolledStudents && course.enrolledStudents.includes(s.Id))
      );

      // Calculate course statistics
      const gradePercentages = courseGrades.map(g => g.percentage);
      const averageGrade = gradePercentages.length > 0 ? 
        (gradePercentages.reduce((sum, grade) => sum + grade, 0) / gradePercentages.length).toFixed(1) : "0.0";
      
      // Grade distribution
      const gradeDistribution = courseGrades.reduce((acc, grade) => {
        acc[grade.letterGrade] = (acc[grade.letterGrade] || 0) + 1;
        return acc;
      }, {});

      // Attendance rate for course
      const presentCount = courseAttendance.filter(record => record.status === "Present").length;
      const attendanceRate = courseAttendance.length > 0 ? 
        Math.round((presentCount / courseAttendance.length) * 100) : 0;

      setReportData({
        type: "course",
        course,
        summary: {
          enrolledStudents: enrolledStudents.length,
          averageGrade,
          attendanceRate,
          totalAssignments: courseGrades.length,
          passRate: Math.round((courseGrades.filter(g => g.percentage >= 60).length / courseGrades.length) * 100) || 0
        },
        gradeDistribution,
        studentPerformance: enrolledStudents.map(student => {
          const studentGrades = courseGrades.filter(g => g.studentId === student.Id);
          const avgGrade = studentGrades.length > 0 ? 
            (studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length).toFixed(1) : "0.0";
          
          return {
            student,
            averageGrade: avgGrade,
            totalAssignments: studentGrades.length
          };
        }),
        generatedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error("Error generating course report:", err);
      toast.error("Failed to generate course report");
    } finally {
      setGenerating(false);
    }
  };

  const convertToGPA = (percentage) => {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
  };

  const handleGenerateReport = async () => {
    switch (reportType) {
      case "overview":
        generateOverviewReport(data.students, data.grades, data.attendance, data.courses);
        break;
      case "student":
        if (!selectedStudent) {
          toast.error("Please select a student");
          return;
        }
        await generateStudentReport(selectedStudent);
        break;
      case "course":
        if (!selectedCourse) {
          toast.error("Please select a course");
          return;
        }
        await generateCourseReport(selectedCourse);
        break;
      default:
        toast.error("Invalid report type");
    }
  };

  const exportReport = (format) => {
    if (!reportData) {
      toast.error("No report data to export");
      return;
    }

    const filename = `${reportData.type}_report_${new Date().toISOString().split("T")[0]}`;
    
    if (format === "json") {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${filename}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } else if (format === "csv") {
      // Simple CSV export for overview data
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (reportData.type === "overview") {
        csvContent += "Metric,Value\n";
        Object.entries(reportData.summary).forEach(([key, value]) => {
          csvContent += `${key},${value}\n`;
        });
      }
      
      const encodedUri = encodeURI(csvContent);
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", encodedUri);
      linkElement.setAttribute("download", `${filename}.csv`);
      linkElement.click();
    }

    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-secondary mt-2">
            Generate comprehensive reports on student performance and attendance
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Generate Report</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              label="Report Type"
              type="select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              required
            >
              <option value="overview">School Overview</option>
              <option value="student">Individual Student</option>
              <option value="course">Course Performance</option>
            </FormField>

            {reportType === "student" && (
              <FormField
                label="Select Student"
                type="select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">Choose a student</option>
                {data.students.map(student => (
                  <option key={student.Id} value={student.Id}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </option>
                ))}
              </FormField>
            )}

            {reportType === "course" && (
              <FormField
                label="Select Course"
                type="select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">Choose a course</option>
                {data.courses.map(course => (
                  <option key={course.Id} value={course.Id}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </FormField>
            )}

            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleGenerateReport}
                loading={generating}
                icon="FileText"
                className="w-full"
              >
                Generate Report
              </Button>
            </div>
          </div>

          {reportData && (
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <span className="text-sm text-secondary">Export:</span>
              <Button
                variant="ghost"
                size="small"
                onClick={() => exportReport("csv")}
                icon="Download"
              >
                CSV
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={() => exportReport("json")}
                icon="Download"
              >
                JSON
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Overview Report */}
          {reportData.type === "overview" && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">School Overview</h3>
                  <div className="text-sm text-secondary">
                    Generated: {new Date(reportData.generatedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatsCard
                    title="Total Students"
                    value={reportData.summary.totalStudents}
                    icon="Users"
                  />
                  <StatsCard
                    title="Active Students"
                    value={reportData.summary.activeStudents}
                    icon="UserCheck"
                  />
                  <StatsCard
                    title="Total Courses"
                    value={reportData.summary.totalCourses}
                    icon="BookOpen"
                  />
                  <StatsCard
                    title="Average GPA"
                    value={reportData.summary.averageGPA}
                    icon="TrendingUp"
                  />
                  <StatsCard
                    title="Attendance Rate"
                    value={`${reportData.summary.attendanceRate}%`}
                    icon="Calendar"
                  />
                  <StatsCard
                    title="Total Grades"
                    value={reportData.summary.totalGrades}
                    icon="FileText"
                  />
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Grade Distribution</h4>
                <div className="grid grid-cols-5 gap-4">
                  {["A", "B", "C", "D", "F"].map(grade => (
                    <div key={grade} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {reportData.gradeDistribution[grade] || 0}
                      </div>
                      <div className="text-sm text-secondary">Grade {grade}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Student Report */}
          {reportData.type === "student" && reportData.student && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reportData.student.firstName} {reportData.student.lastName}
                    </h3>
                    <p className="text-secondary">Student ID: {reportData.student.studentId}</p>
                  </div>
                  <div className="text-sm text-secondary">
                    Generated: {new Date(reportData.generatedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Current GPA"
                    value={reportData.summary.gpa}
                    icon="TrendingUp"
                  />
                  <StatsCard
                    title="Attendance Rate"
                    value={`${reportData.summary.attendanceRate}%`}
                    icon="Calendar"
                  />
                  <StatsCard
                    title="Total Grades"
                    value={reportData.summary.totalGrades}
                    icon="FileText"
                  />
                  <StatsCard
                    title="Courses Enrolled"
                    value={reportData.summary.coursesEnrolled}
                    icon="BookOpen"
                  />
                </div>
              </div>

              {/* Grades by Course */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Grades by Course</h4>
                <div className="space-y-4">
                  {Object.entries(reportData.gradesByCourse).map(([courseName, grades]) => (
                    <div key={courseName} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">{courseName}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {grades.map((grade, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="text-sm font-medium">{grade.assignmentName}</div>
                            <div className="text-xs text-secondary">{grade.category}</div>
                            <div className="text-lg font-bold text-primary">
                              {grade.points}/{grade.maxPoints} ({grade.percentage}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Course Report */}
          {reportData.type === "course" && reportData.course && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reportData.course.courseName}
                    </h3>
                    <p className="text-secondary">Course Code: {reportData.course.courseCode}</p>
                    <p className="text-secondary">Teacher: {reportData.course.teacher}</p>
                  </div>
                  <div className="text-sm text-secondary">
                    Generated: {new Date(reportData.generatedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Enrolled Students"
                    value={reportData.summary.enrolledStudents}
                    icon="Users"
                  />
                  <StatsCard
                    title="Average Grade"
                    value={`${reportData.summary.averageGrade}%`}
                    icon="TrendingUp"
                  />
                  <StatsCard
                    title="Pass Rate"
                    value={`${reportData.summary.passRate}%`}
                    icon="CheckCircle"
                  />
                  <StatsCard
                    title="Attendance Rate"
                    value={`${reportData.summary.attendanceRate}%`}
                    icon="Calendar"
                  />
                </div>
              </div>

              {/* Student Performance */}
              <div className="card">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Student Performance</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-header">Student</th>
                        <th className="table-header">Average Grade</th>
                        <th className="table-header">Assignments Completed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.studentPerformance.map((performance, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="table-cell">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {performance.student.firstName.charAt(0)}{performance.student.lastName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {performance.student.firstName} {performance.student.lastName}
                                </div>
                                <div className="text-sm text-secondary">
                                  {performance.student.studentId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="text-lg font-semibold text-primary">
                              {performance.averageGrade}%
                            </span>
                          </td>
                          <td className="table-cell">
                            {performance.totalAssignments}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;