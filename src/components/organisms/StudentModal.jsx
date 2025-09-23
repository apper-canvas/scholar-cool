import React, { useEffect, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Attendance from "@/components/pages/Attendance";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const StudentModal = ({ 
  student, 
  isOpen, 
  onClose, 
  onSave, 
  mode = "view" // view, edit, create
}) => {
const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gradeLevel: "",
    enrollmentStatus: "Active",
    studentId: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    parentGuardian: {
      name: "",
      relationship: "",
      primaryPhone: "",
      secondaryPhone: "",
      primaryEmail: "",
      secondaryEmail: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: ""
      }
    },
    communicationHistory: []
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
if (student && isOpen) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        dateOfBirth: student.dateOfBirth || "",
        gradeLevel: student.gradeLevel || "",
        enrollmentStatus: student.enrollmentStatus || "Active",
        studentId: student.studentId || "",
        address: student.address || {
          street: "",
          city: "",
          state: "",
          zipCode: ""
        },
        emergencyContact: student.emergencyContact || {
          name: "",
          relationship: "",
          phone: ""
        },
        parentGuardian: student.parentGuardian || {
          name: "",
          relationship: "",
          primaryPhone: "",
          secondaryPhone: "",
          primaryEmail: "",
          secondaryEmail: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: ""
          }
        },
        communicationHistory: student.communicationHistory || []
      });
} else if (mode === "create" && isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gradeLevel: "9",
        enrollmentStatus: "Active",
        studentId: `STU${Date.now()}`,
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: ""
        },
        emergencyContact: {
          name: "",
          relationship: "",
          phone: ""
        },
        parentGuardian: {
          name: "",
          relationship: "",
          primaryPhone: "",
          secondaryPhone: "",
          primaryEmail: "",
          secondaryEmail: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: ""
          }
        },
        communicationHistory: []
      });
    }
  }, [student, isOpen, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (!isOpen) return null;

const tabs = [
    { id: "personal", name: "Personal Info", icon: "User" },
    { id: "academic", name: "Academic", icon: "GraduationCap" },
    { id: "contact", name: "Contact & Emergency", icon: "Phone" },
    { id: "parent", name: "Parent/Guardian", icon: "Users" }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "Active": "success",
      "Inactive": "inactive",
      "Graduated": "info"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const isReadOnly = mode === "view";
  const title = mode === "create" ? "Add New Student" : 
                mode === "edit" ? "Edit Student" : "Student Details";

  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-lg">
              <ApperIcon name="User" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {student && mode === "view" && (
                <p className="text-sm text-secondary">ID: {student.studentId}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ApperIcon name="X" className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-secondary hover:text-gray-700"
                }`}
              >
                <ApperIcon name={tab.icon} className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

{/* Content */}
<div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "personal" && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
                <FormField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                  disabled={isReadOnly || mode === "edit"}
                  required
                />
                <FormField
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </div>

              <FormField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isReadOnly}
                required
              />

              <FormField
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
disabled={isReadOnly}
                required
              />
              </div>
            </form>
          )}
          
          {activeTab === "academic" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Grade Level"
                  type="select"
                  value={formData.gradeLevel}
                  onChange={(e) => handleChange("gradeLevel", e.target.value)}
                  disabled={isReadOnly}
                  required
                >
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </FormField>

                <div className="space-y-2">
                  <label className="form-label">Enrollment Status</label>
                  {isReadOnly ? (
                    <div className="py-2">
                      {getStatusBadge(formData.enrollmentStatus)}
                    </div>
                  ) : (
                    <FormField
                      type="select"
                      value={formData.enrollmentStatus}
                      onChange={(e) => handleChange("enrollmentStatus", e.target.value)}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Graduated">Graduated</option>
                    </FormField>
                  )}
                </div>
              </div>

              {student && mode === "view" && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Academic Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-secondary">Enrollment Date</span>
                      <p className="font-medium">
                        {student.enrollmentDate ? 
                          new Date(student.enrollmentDate).toLocaleDateString() : 
                          "N/A"
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-secondary">Current GPA</span>
                      <p className="font-medium">3.85</p>
                    </div>
                    <div>
                      <span className="text-secondary">Credits Earned</span>
                      <p className="font-medium">24</p>
                    </div>
                    <div>
                      <span className="text-secondary">Attendance Rate</span>
                      <p className="font-medium">94%</p>
                    </div>
                  </div>
</div>
              )}
            </form>
          )}
          
          {activeTab === "contact" && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Address</h4>
                <div className="space-y-4">
                  <FormField
                    label="Street Address"
                    value={formData.address.street}
                    onChange={(e) => handleChange("address.street", e.target.value)}
                    disabled={isReadOnly}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="City"
                      value={formData.address.city}
                      onChange={(e) => handleChange("address.city", e.target.value)}
                      disabled={isReadOnly}
                    />
                    <FormField
                      label="State"
                      value={formData.address.state}
                      onChange={(e) => handleChange("address.state", e.target.value)}
                      disabled={isReadOnly}
                    />
                    <FormField
                      label="ZIP Code"
                      value={formData.address.zipCode}
                      onChange={(e) => handleChange("address.zipCode", e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Emergency Contact</h4>
                <div className="space-y-4">
                  <FormField
                    label="Contact Name"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleChange("emergencyContact.name", e.target.value)}
                    disabled={isReadOnly}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleChange("emergencyContact.relationship", e.target.value)}
                      disabled={isReadOnly}
                      required
                    />
                    <FormField
                      label="Phone Number"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => handleChange("emergencyContact.phone", e.target.value)}
                      disabled={isReadOnly}
                      required
                    />
                  </div>
</div>
              </div>
            </form>
          )}
          
          {/* Parent/Guardian Tab */}
          {activeTab === "parent" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Information</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name"
                    value={formData.parentGuardian.name}
                    onChange={(e) => handleChange("parentGuardian.name", e.target.value)}
                    placeholder="Enter parent/guardian name"
                    required
                    readOnly={mode === "view"}
                  />
                  <FormField
                    label="Relationship"
                    type="select"
value={formData.parentGuardian.relationship}
                    onChange={(e) => handleChange("parentGuardian.relationship", e.target.value)}
                    options={[
                      { value: "", label: "Select relationship" },
                      { value: "Mother", label: "Mother" },
                      { value: "Father", label: "Father" },
                      { value: "Guardian", label: "Guardian" },
                      { value: "Grandparent", label: "Grandparent" },
                      { value: "Stepparent", label: "Stepparent" },
                      { value: "Other", label: "Other" }
                    ]}
                    readOnly={mode === "view"}
                  />
                  <FormField
label="Primary Phone"
                    type="tel"
                    value={formData.parentGuardian.primaryPhone}
                    onChange={(e) => handleChange("parentGuardian.primaryPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    readOnly={mode === "view"}
                  />
                  <FormField
label="Secondary Phone"
                    type="tel"
                    value={formData.parentGuardian.secondaryPhone}
                    onChange={(e) => handleChange("parentGuardian.secondaryPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                    readOnly={mode === "view"}
                  />
                  <FormField
label="Primary Email"
                    type="email"
                    value={formData.parentGuardian.primaryEmail}
                    onChange={(e) => handleChange("parentGuardian.primaryEmail", e.target.value)}
                    placeholder="parent@example.com"
                    required
                    readOnly={mode === "view"}
                  />
<FormField
                    label="Secondary Email"
                    type="email"
                    value={formData.parentGuardian.secondaryEmail}
                    onChange={(e) => handleChange("parentGuardian.secondaryEmail", e.target.value)}
                    placeholder="parent2@example.com"
                    readOnly={mode === "view"}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
<FormField
                      label="Street Address"
                      value={formData.parentGuardian.address.street}
                      onChange={(e) => handleChange("parentGuardian.address.street", e.target.value)}
                      placeholder="123 Main St"
                      readOnly={mode === "view"}
                    />
                  </div>
<FormField
                    label="City"
                    value={formData.parentGuardian.address.city}
                    onChange={(e) => handleChange("parentGuardian.address.city", e.target.value)}
                    placeholder="City"
                    readOnly={mode === "view"}
                  />
<FormField
                    label="State"
                    value={formData.parentGuardian.address.state}
                    onChange={(e) => handleChange("parentGuardian.address.state", e.target.value)}
                    placeholder="State"
                    readOnly={mode === "view"}
                  />
<FormField
                    label="ZIP Code"
                    value={formData.parentGuardian.address.zipCode}
                    onChange={(e) => handleChange("parentGuardian.address.zipCode", e.target.value)}
                    placeholder="12345"
                    readOnly={mode === "view"}
                  />
                </div>
              </div>

              {/* Communication History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Communication History</h4>
                  {mode !== "view" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon="Plus"
                      onClick={() => {
                        const newEntry = {
                          id: Date.now(),
                          date: new Date().toISOString().split('T')[0],
                          type: "Phone Call",
                          notes: "",
                          staffMember: "Current User"
                        };
                        handleChange("communicationHistory", [...formData.communicationHistory, newEntry]);
                      }}
                    >
                      Add Communication
                    </Button>
                  )}
                </div>
                
                {formData.communicationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ApperIcon name="MessageSquare" size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No communication history yet</p>
                    {mode !== "view" && (
                      <p className="text-sm">Click "Add Communication" to record interactions</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.communicationHistory.map((entry, index) => (
                      <div key={entry.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <FormField
                            label="Date"
                            type="date"
                            value={entry.date}
                            onChange={(value) => {
                              const updated = [...formData.communicationHistory];
                              updated[index] = { ...updated[index], date: value };
                              handleChange("communicationHistory", updated);
                            }}
                            readOnly={mode === "view"}
                          />
                          <FormField
                            label="Communication Type"
                            type="select"
                            value={entry.type}
                            onChange={(value) => {
                              const updated = [...formData.communicationHistory];
                              updated[index] = { ...updated[index], type: value };
                              handleChange("communicationHistory", updated);
                            }}
                            options={[
                              { value: "Phone Call", label: "Phone Call" },
                              { value: "Email", label: "Email" },
                              { value: "In-Person", label: "In-Person Meeting" },
                              { value: "Text Message", label: "Text Message" },
                              { value: "Letter", label: "Letter" },
                              { value: "Other", label: "Other" }
                            ]}
                            readOnly={mode === "view"}
                          />
                          <FormField
                            label="Staff Member"
                            value={entry.staffMember}
                            onChange={(value) => {
                              const updated = [...formData.communicationHistory];
                              updated[index] = { ...updated[index], staffMember: value };
                              handleChange("communicationHistory", updated);
                            }}
                            placeholder="Staff member name"
                            readOnly={mode === "view"}
                          />
                        </div>
                        <FormField
                          label="Notes"
                          type="textarea"
                          value={entry.notes}
                          onChange={(value) => {
                            const updated = [...formData.communicationHistory];
                            updated[index] = { ...updated[index], notes: value };
                            handleChange("communicationHistory", updated);
                          }}
                          placeholder="Communication notes and details..."
                          rows={3}
                          readOnly={mode === "view"}
                        />
                        {mode !== "view" && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              icon="Trash2"
                              onClick={() => {
                                const updated = formData.communicationHistory.filter((_, i) => i !== index);
                                handleChange("communicationHistory", updated);
                              }}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
)}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
<div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && (
            <Button
              type="submit"
              loading={loading}
              onClick={handleSubmit}
            >
              {mode === "create" ? "Add Student" : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentModal;