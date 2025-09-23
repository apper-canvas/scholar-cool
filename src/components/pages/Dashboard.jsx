import { useState, useEffect } from "react";
import DashboardStats from "@/components/organisms/DashboardStats";
import RecentActivity from "@/components/organisms/RecentActivity";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { studentService } from "@/services/api/studentService";
import { activityService } from "@/services/api/activityService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageGPA: "0.0",
    attendanceRate: 0,
    activeCourses: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load students and calculate stats
      const students = await studentService.getAll();
      const allActivities = await activityService.getAll();

      // Calculate stats
      const activeStudents = students.filter(s => s.enrollmentStatus === "Active");
      const totalGPA = activeStudents.reduce((sum, student) => sum + (student.gpa || 3.5), 0);
      const avgGPA = activeStudents.length > 0 ? (totalGPA / activeStudents.length).toFixed(1) : "0.0";

      setStats({
        totalStudents: students.length,
        averageGPA: avgGPA,
        attendanceRate: 92, // Mock data
        activeCourses: 15 // Mock data
      });

      setActivities(allActivities);
      
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const quickActions = [
    {
      label: "Add Student",
      icon: "UserPlus",
      href: "/students?action=create",
      color: "btn-primary"
    },
    {
      label: "Record Grades",
      icon: "BookOpen", 
      href: "/grades",
      color: "btn-secondary"
    },
    {
      label: "Take Attendance",
      icon: "Calendar",
      href: "/attendance",
      color: "btn-secondary"
    },
    {
      label: "Generate Report",
      icon: "FileText",
      href: "/reports",
      color: "btn-secondary"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Welcome to Scholar Hub
          </h1>
          <p className="text-secondary mt-2">
            Manage your student data efficiently and track academic progress
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <ApperIcon name="Calendar" className="h-5 w-5 text-secondary" />
          <span className="text-sm text-secondary">
            {new Date().toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Quick Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <ApperIcon name="Zap" className="h-5 w-5 text-secondary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.color === "btn-primary" ? "primary" : "secondary"}
              className="h-20 flex-col space-y-2 text-center justify-center"
              onClick={() => window.location.href = action.href}
            >
              <ApperIcon name={action.icon} className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>
        
        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <ApperIcon name="Bell" className="h-5 w-5 text-secondary" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
              <div className="p-2 rounded-full bg-primary text-white">
                <ApperIcon name="Calendar" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Parent-Teacher Conferences</p>
                <p className="text-xs text-secondary mt-1">Tomorrow, 2:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50">
              <div className="p-2 rounded-full bg-warning text-white">
                <ApperIcon name="AlertTriangle" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Grade Submission Deadline</p>
                <p className="text-xs text-secondary mt-1">Friday, End of Day</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50">
              <div className="p-2 rounded-full bg-success text-white">
                <ApperIcon name="Award" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Graduation Ceremony</p>
                <p className="text-xs text-secondary mt-1">Next Month, June 15th</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;