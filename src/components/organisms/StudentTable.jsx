import React, { useMemo, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const StudentTable = ({ 
  students, 
  onViewStudent, 
  onEditStudent, 
  onDeleteStudent,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("lastName");
  const [sortDirection, setSortDirection] = useState("asc");
  const itemsPerPage = 10;

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Graduated", label: "Graduated" }
  ];


  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = searchTerm === "" || 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "" || student.enrollmentStatus === statusFilter;

return matchesSearch && matchesStatus;
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
}, [students, searchTerm, statusFilter, sortField, sortDirection]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      "Active": "success",
      "Inactive": "inactive", 
      "Graduated": "info"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "ArrowUpDown";
    return sortDirection === "asc" ? "ArrowUp" : "ArrowDown";
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar 
          onSearch={setSearchTerm}
          placeholder="Search students..."
          className="w-full sm:w-80"
        />
        
        <div className="flex gap-2">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-secondary">
        Showing {paginatedStudents.length} of {filteredAndSortedStudents.length} students
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="table-header cursor-pointer select-none"
                  onClick={() => handleSort("studentId")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Student ID</span>
                    <ApperIcon name={getSortIcon("studentId")} className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer select-none"
                  onClick={() => handleSort("lastName")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ApperIcon name={getSortIcon("lastName")} className="h-3 w-3" />
                  </div>
                </th>
<th className="table-header">Email</th>
                <th className="table-header">Status</th>
                <th 
                  className="table-header cursor-pointer select-none"
                  onClick={() => handleSort("enrollmentDate")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Enrolled</span>
                    <ApperIcon name={getSortIcon("enrollmentDate")} className="h-3 w-3" />
                  </div>
                </th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStudents.map((student) => (
                <tr key={student.Id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="table-cell font-mono text-xs">
                    {student.studentId}
                  </td>
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
                        <div className="text-sm text-secondary">
                          {student.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-secondary">
                    {student.email}
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(student.enrollmentStatus)}
                  </td>
                  <td className="table-cell text-sm text-secondary">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onViewStudent(student)}
                        icon="Eye"
                      />
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onEditStudent(student)}
                        icon="Edit"
                      />
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onDeleteStudent(student.Id)}
                        icon="Trash2"
                        className="text-error hover:text-red-700 hover:bg-red-50"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  icon="ChevronLeft"
                />
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  icon="ChevronRight"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTable;