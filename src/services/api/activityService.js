import activitiesData from "@/services/mockData/activities.json";

class ActivityService {
  constructor() {
    this.activities = [...activitiesData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activity = this.activities.find(a => a.Id === parseInt(id));
    if (!activity) {
      throw new Error("Activity not found");
    }
    return { ...activity };
  }

  async create(activityData) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const maxId = Math.max(...this.activities.map(a => a.Id), 0);
    const newActivity = {
      ...activityData,
      Id: maxId + 1,
      timestamp: activityData.timestamp || new Date().toISOString()
    };
    
    this.activities.push(newActivity);
    return { ...newActivity };
  }

  async getRecent(limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...this.activities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
}

export const activityService = new ActivityService();