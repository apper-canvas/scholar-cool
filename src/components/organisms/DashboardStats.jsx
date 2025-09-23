import StatsCard from "@/components/molecules/StatsCard";

const DashboardStats = ({ stats }) => {
  const statsData = [
    {
      title: "Total Students",
      value: stats.totalStudents || 0,
      change: "+12",
      trend: "up",
      icon: "Users"
    },
    {
      title: "Average GPA",
      value: stats.averageGPA || "3.8",
      change: "+0.2",
      trend: "up", 
      icon: "TrendingUp"
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate || 92}%`,
      change: "-1.2%",
      trend: "down",
      icon: "Calendar"
    },
    {
      title: "Active Courses",
      value: stats.activeCourses || 0,
      change: "2",
      trend: "up",
      icon: "BookOpen"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          trend={stat.trend}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default DashboardStats;