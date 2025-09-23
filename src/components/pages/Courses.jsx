import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { courseService } from "@/services/api/courseService";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    teacher: "",
    creditHours: "",
    semester: "Fall 2024",
    schedule: {
      days: [],
      startTime: "",
      endTime: "",
      room: ""
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [coursesData, studentsData] = await Promise.all([
        courseService.getAll(),
        studentService.getAll()
      ]);
      
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (err) {
      setError("Failed to load courses data. Please try again.");
      console.error("Error loading courses:", err);
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
      const courseData = {
        ...formData,
        creditHours: parseInt(formData.creditHours),
        enrolledStudents: editingCourse ? editingCourse.enrolledStudents : []
      };

      if (editingCourse) {
        await courseService.update(editingCourse.Id, courseData);
        toast.success("Course updated successfully");
      } else {
        await courseService.create(courseData);
        toast.success("Course created successfully");
      }
      
      await loadData();
      setShowAddForm(false);
      setEditingCourse(null);
      resetForm();
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error("Failed to save course");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      teacher: course.teacher,
      creditHours: course.creditHours.toString(),
      semester: course.semester,
      schedule: course.schedule || {
        days: [],
        startTime: "",
        endTime: "",
        room: ""
      }
    });
    setShowAddForm(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await courseService.delete(courseId);
        await loadData();
        toast.success("Course deleted successfully");
      } catch (err) {
        console.error("Error deleting course:", err);
        toast.error("Failed to delete course");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      courseName: "",
      courseCode: "",
      teacher: "",
      creditHours: "",
      semester: "Fall 2024",
      schedule: {
        days: [],
        startTime: "",
        endTime: "",
        room: ""
      }
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCourse(null);
    resetForm();
  };

  const handleScheduleDayChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: checked 
          ? [...prev.schedule.days, day]
          : prev.schedule.days.filter(d => d !== day)
      }
    }));
  };

  const getEnrollmentCount = (course) => {
    return course.enrolledStudents ? course.enrolledStudents.length : 0;
  };

  const getScheduleDisplay = (schedule) => {
    if (!schedule || !schedule.days || schedule.days.length === 0) {
      return "Not scheduled";
    }
    
    const timeDisplay = schedule.startTime && schedule.endTime 
      ? `${schedule.startTime} - ${schedule.endTime}`
      : "";
    
    const roomDisplay = schedule.room ? `Room ${schedule.room}` : "";
    
    return `${schedule.days.join(", ")} ${timeDisplay} ${roomDisplay}`.trim();
  };

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-secondary mt-2">
            Manage course information, schedules, and enrollments
          </p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowAddForm(true)}
        >
          Add Course
        </Button>
      </div>

      {/* Add/Edit Course Form */}
      {showAddForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Course Name"
                value={formData.courseName}
                onChange={(e) => setFormData(prev => ({...prev, courseName: e.target.value}))}
                required
              />

              <FormField
                label="Course Code"
                value={formData.courseCode}
                onChange={(e) => setFormData(prev => ({...prev, courseCode: e.target.value}))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Teacher"
                value={formData.teacher}
                onChange={(e) => setFormData(prev => ({...prev, teacher: e.target.value}))}
                required
              />

              <FormField
                label="Credit Hours"
                type="number"
                min="1"
                max="6"
                value={formData.creditHours}
                onChange={(e) => setFormData(prev => ({...prev, creditHours: e.target.value}))}
                required
              />
            </div>

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

            {/* Schedule Section */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Schedule</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Days of Week</label>
                  <div className="flex flex-wrap gap-3">
                    {weekDays.map(day => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.schedule.days.includes(day)}
                          onChange={(e) => handleScheduleDayChange(day, e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Start Time"
                    type="time"
                    value={formData.schedule.startTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: {...prev.schedule, startTime: e.target.value}
                    }))}
                  />

                  <FormField
                    label="End Time"
                    type="time"
                    value={formData.schedule.endTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: {...prev.schedule, endTime: e.target.value}
                    }))}
                  />

                  <FormField
                    label="Room"
                    value={formData.schedule.room}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: {...prev.schedule, room: e.target.value}
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <SearchBar 
        onSearch={setSearchTerm}
        placeholder="Search courses..."
        className="w-full sm:w-80"
      />

      {/* Content */}
      {courses.length === 0 ? (
        <Empty
          title="No courses found"
          description="Create your first course to start managing student enrollments."
          action={() => setShowAddForm(true)}
          actionLabel="Create First Course"
          icon="GraduationCap"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.Id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary to-blue-600 p-3 rounded-lg">
                    <ApperIcon name="BookOpen" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-secondary">{course.courseCode}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleEdit(course)}
                    icon="Edit"
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleDelete(course.Id)}
                    icon="Trash2"
                    className="text-error hover:text-red-700 hover:bg-red-50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Teacher:</span>
                  <span className="text-sm font-medium">{course.teacher}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Credits:</span>
                  <Badge variant="default">{course.creditHours} Credits</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Semester:</span>
                  <Badge variant="info">{course.semester}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Enrolled:</span>
                  <Badge variant="success">{getEnrollmentCount(course)} Students</Badge>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-secondary mb-1">Schedule:</div>
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {getScheduleDisplay(course.schedule)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredCourses.length !== courses.length && (
        <div className="text-sm text-secondary">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      )}
    </div>
  );
};

export default Courses;