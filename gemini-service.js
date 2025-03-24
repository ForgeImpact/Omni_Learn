// services/geminiService.js
export class GeminiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-pro';
  }

  async generateRecommendations(courses, progress, preferences, deviceInfo) {
    try {
      // Prepare the data to send to Gemini
      const userData = {
        courses: courses.map(course => ({
          id: course.id,
          title: course.title,
          category: course.category,
          difficulty: course.difficulty,
          estimatedHours: course.estimatedHours
        })),
        progress: this._formatProgressData(progress),
        preferences: preferences,
        deviceType: deviceInfo.type,
        networkQuality: deviceInfo.networkInfo.bandwidth
      };

      // Create a prompt for Gemini
      const prompt = {
        text: `Generate learning recommendations based on the following user data:
          ${JSON.stringify(userData, null, 2)}
          
          Please provide a list of 5 recommended courses or modules for this user to pursue next, 
          considering their progress, preferences, and device constraints.
          Format the response as a JSON array with objects containing:
          - id: The course or module ID
          - title: The title of the recommended item
          - reason: A brief explanation of why this is recommended
          - priority: A number from 1-5 (1 being highest priority)
          - estimatedTimeToComplete: In hours
          `
      };

      // Call Gemini API
      const response = await this._callGeminiApi(prompt);
      
      // Parse and format the recommendations
      const recommendations = this._parseRecommendations(response);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations with Gemini:', error);
      return [];
    }
  }

  async generateLearningPath(courses, progress, preferences, deviceInfo) {
    try {
      // Prepare the data to send to Gemini
      const userData = {
        courses: courses.map(course => ({
          id: course.id,
          title: course.title,
          category: course.category,
          difficulty: course.difficulty,
          estimatedHours: course.estimatedHours,
          modules: course.modules.map(module => ({
            id: module.id,
            title: module.title,
            topics: module.topics
          }))
        })),
        progress: this._formatProgressData(progress),
        preferences: preferences,
        deviceType: deviceInfo.type,
        learningGoals: preferences.goals || []
      };

      // Create a prompt for Gemini
      const prompt = {
        text: `Generate a personalized learning path for a user based on the following data:
          ${JSON.stringify(userData, null, 2)}
          
          Please create a structured learning path that will help the user achieve their learning goals.
          The path should include specific modules or courses in a recommended sequence.
          For each item in the path, include:
          - id: The module or course ID
          - title: The title of the item
          - type: "module" or "course"
          - estimatedTimeToComplete: In hours
          - prerequisites: Any prerequisites that should be completed first
          - nextSteps: What to pursue after completing this item
          
          Format the response as a JSON array of learning path items.`
      };

      // Call Gemini API
      const response = await this._callGeminiApi(prompt);
      
      // Parse and format the learning path
      const learningPath = this._parseLearningPath(response);
      
      return learningPath;
    } catch (error) {
      console.error('Error generating learning path with Gemini:', error);
      return [];
    }
  }

  // Format progress data for Gemini to understand
  _formatProgressData