import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { gradeService } from "@/services/api/gradeService";
import { studentService } from "@/services/api/studentService";
import { courseService } from "@/services/api/courseService";
import { toast } from "react-toastify";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    assignmentName: "",
    category: "Assignment",
    points: "",
    maxPoints: "",
    semester: "Fall 2024"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [gradesData, studentsData, coursesData] = await Promise.all([
        gradeService.getAll(),
        studentService.getAll(),
        courseService.getAll()
      ]);
      
      setGrades(gradesData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to load grades data. Please try again.");
      console.error("Error loading grades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const points = parseFloat(formData.points);
      const maxPoints = parseFloat(formData.maxPoints);
      
      if (points > maxPoints) {
        toast.error("Points cannot exceed maximum points");
        return;
      }

      const percentage = (points / maxPoints) * 100;
      const letterGrade = calculateLetterGrade(percentage);

      const gradeData = {
        ...formData,
        points,
        maxPoints,
        percentage: Math.round(percentage * 100) / 100,
        letterGrade,
        dateRecorded: new Date().toISOString().split("T")[0]
      };

      await gradeService.create(gradeData);
      await loadData();
      setShowAddForm(false);
      resetForm();
      toast.success("Grade recorded successfully");
    } catch (err) {
      console.error("Error saving grade:", err);
      toast.error("Failed to record grade");
    }
  };

  const calculateLetterGrade = (percentage) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      courseId: "",
      assignmentName: "",
      category: "Assignment",
      points: "",
      maxPoints: "",
      semester: "Fall 2024"
    });
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.Id.toString() === studentId.toString());
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.Id.toString() === courseId.toString());
    return course ? course.courseName : "Unknown Course";
  };

  const getGradeBadge = (letterGrade) => {
    const variants = {
      "A": "success",
      "B": "info",
      "C": "warning",
      "D": "warning",
      "F": "error"
    };
    return <Badge variant={variants[letterGrade] || "default"}>{letterGrade}</Badge>;
  };

  const filteredGrades = grades.filter(grade => {
    const studentName = getStudentName(grade.studentId).toLowerCase();
    const courseName = getCourseName(grade.courseId).toLowerCase();
    
    const matchesSearch = searchTerm === "" || 
      studentName.includes(searchTerm.toLowerCase()) ||
      courseName.includes(searchTerm.toLowerCase()) ||
      grade.assignmentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = courseFilter === "" || grade.courseId.toString() === courseFilter;
    const matchesGrade = gradeFilter === "" || grade.letterGrade === gradeFilter;

    return matchesSearch && matchesCourse && matchesGrade;
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const courseOptions = courses.map(course => ({
    value: course.Id.toString(),
    label: course.courseName
  }));

  const gradeOptions = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
    { value: "F", label: "F" }
  ];

  const categoryOptions = [
    "Assignment",
    "Quiz",
    "Test",
    "Project",
    "Homework",
    "Participation"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
          <p className="text-secondary mt-2">
            Record and manage student grades and assignments
          </p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowAddForm(true)}
        >
          Record Grade
        </Button>
      </div>

      {/* Add Grade Form */}
      {showAddForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Record New Grade</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Student"
                type="select"
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({...prev, studentId: e.target.value}))}
                required
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.Id} value={student.Id}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </option>
                ))}
              </FormField>

              <FormField
                label="Course"
                type="select"
                value={formData.courseId}
                onChange={(e) => setFormData(prev => ({...prev, courseId: e.target.value}))}
                required
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.Id} value={course.Id}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Assignment Name"
                value={formData.assignmentName}
                onChange={(e) => setFormData(prev => ({...prev, assignmentName: e.target.value}))}
                required
              />

              <FormField
                label="Category"
                type="select"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                required
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Points Earned"
                type="number"
                step="0.5"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({...prev, points: e.target.value}))}
                required
              />

              <FormField
                label="Maximum Points"
                type="number"
                step="0.5" 
                min="0"
                value={formData.maxPoints}
                onChange={(e) => setFormData(prev => ({...prev, maxPoints: e.target.value}))}
                required
              />

              <FormField
                label="Semester"
                type="select"
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({...prev, semester: e.target.value}))}
                required
              >
                <option value="Fall 2024">Fall 2024</option>
                <option value="Spring 2024">Spring 2024</option>
                <option value="Summer 2024">Summer 2024</option>
              </FormField>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Record Grade
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar 
          onSearch={setSearchTerm}
          placeholder="Search grades..."
          className="w-full sm:w-80"
        />
        
        <div className="flex gap-2">
          <FilterDropdown
            label="Course"
            options={courseOptions}
            value={courseFilter}
            onChange={setCourseFilter}
            placeholder="All Courses"
          />
          <FilterDropdown
            label="Grade"
            options={gradeOptions}
            value={gradeFilter}
            onChange={setGradeFilter}
            placeholder="All Grades"
          />
        </div>
      </div>

      {/* Content */}
      {grades.length === 0 ? (
        <Empty
          title="No grades recorded"
          description="Start recording grades for your students and assignments."
          action={() => setShowAddForm(true)}
          actionLabel="Record First Grade"
          icon="BookOpen"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Assignment</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Points</th>
                  <th className="table-header">Percentage</th>
                  <th className="table-header">Grade</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade) => (
                  <tr key={grade.Id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {getStudentName(grade.studentId).split(" ").map(n => n.charAt(0)).join("")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getStudentName(grade.studentId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm">
                      {getCourseName(grade.courseId)}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.assignmentName}
                      </div>
                    </td>
                    <td className="table-cell">
                      <Badge variant="default">{grade.category}</Badge>
                    </td>
                    <td className="table-cell text-sm">
                      {grade.points} / {grade.maxPoints}
                    </td>
                    <td className="table-cell text-sm font-medium">
                      {grade.percentage}%
                    </td>
                    <td className="table-cell">
                      {getGradeBadge(grade.letterGrade)}
                    </td>
                    <td className="table-cell text-sm text-secondary">
                      {new Date(grade.dateRecorded).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-secondary">
        Showing {filteredGrades.length} of {grades.length} grades
      </div>
    </div>
  );
};

export default Grades;