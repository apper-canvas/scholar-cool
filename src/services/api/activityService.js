import { toast } from "react-toastify";

class ActivityService {
  constructor() {
    this.tableName = 'activity_c';
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}}
        ],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch activities:", response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database records to UI format
      return response.data.map(record => ({
        Id: record.Id,
        type: record.type_c || "",
        description: record.description_c || "",
        timestamp: record.timestamp_c || ""
      }));
      
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
      toast.error("Failed to load activities. Please try again.");
      return [];
    }
  }

async getById(id) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}}
        ]
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        toast.error("Activity not found");
        return null;
      }
      
      const record = response.data;
      return {
        Id: record.Id,
        type: record.type_c || "",
        description: record.description_c || "",
        timestamp: record.timestamp_c || ""
      };
      
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load activity details. Please try again.");
      return null;
    }
  }

async create(activityData) {
    try {
      const client = this.ensureClient();
      
      // Transform UI data to database format (only Updateable fields)
      const payload = {
        records: [{
          Name: activityData.description || activityData.type || "Activity",
          type_c: activityData.type || "",
          description_c: activityData.description || "",
          timestamp_c: activityData.timestamp || new Date().toISOString()
        }]
      };
      
      const response = await client.createRecord(this.tableName, payload);
      
      if (!response.success) {
        console.error("Failed to create activity:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create activity:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create activity");
        }
        
        return successful[0]?.data || {};
      }
      
      return {};
      
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      throw error;
    }
  }

async getRecent(limit = 10) {
    try {
      const client = this.ensureClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}}
        ],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch recent activities:", response.message);
        return [];
      }
      
      return response.data.map(record => ({
        Id: record.Id,
        type: record.type_c || "",
        description: record.description_c || "",
        timestamp: record.timestamp_c || ""
      }));
      
    } catch (error) {
      console.error("Error fetching recent activities:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export const activityService = new ActivityService();