import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import StudentTable from "@/components/organisms/StudentTable";
import StudentModal from "@/components/organisms/StudentModal";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const shouldCreateStudent = queryParams.get("action") === "create";

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      setError("Failed to load students. Please try again.");
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (shouldCreateStudent && !loading) {
      handleCreateStudent();
    }
  }, [shouldCreateStudent, loading]);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCreateStudent = () => {
    setSelectedStudent(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        await studentService.delete(studentId);
        await loadStudents(); // Reload the list
        toast.success("Student deleted successfully");
      } catch (err) {
        console.error("Error deleting student:", err);
        toast.error("Failed to delete student");
      }
    }
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (modalMode === "create") {
        await studentService.create(studentData);
        toast.success("Student added successfully");
      } else {
        await studentService.update(selectedStudent.Id, studentData);
        toast.success("Student updated successfully");
      }
      await loadStudents(); // Reload the list
    } catch (err) {
      console.error("Error saving student:", err);
      toast.error("Failed to save student");
      throw err; // Re-throw to handle in modal
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setModalMode("view");
    
    // Clear the action query param if it exists
    if (shouldCreateStudent) {
      window.history.replaceState({}, "", "/students");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadStudents} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-secondary mt-2">
            Manage student information, enrollment, and academic records
          </p>
        </div>
        <Button
          variant="primary"
          icon="UserPlus"
          onClick={handleCreateStudent}
        >
          Add Student
        </Button>
      </div>

      {/* Content */}
      {students.length === 0 ? (
        <Empty
          title="No students found"
          description="Get started by adding your first student to the system."
          action={handleCreateStudent}
          actionLabel="Add First Student"
          icon="Users"
        />
      ) : (
        <StudentTable
          students={students}
          onViewStudent={handleViewStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
          loading={loading}
        />
      )}

      {/* Modal */}
      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
        mode={modalMode}
      />
    </div>
  );
};

export default Students;