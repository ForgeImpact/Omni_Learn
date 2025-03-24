// Format progress data for Gemini to understand
  _formatProgressData(progress) {
    const formattedProgress = [];
    
    // Convert the progress object to an array of item completions
    for (const moduleId in progress) {
      for (const lessonId in progress[moduleId]) {
        formattedProgress.push({
          moduleId,
          lessonId,
          completed: progress[moduleId][lessonId].completed || false,
          completedAt: progress[moduleId][lessonId].completedAt || null,
          score: progress[moduleId][lessonId].score || 0,
          timeSpent: progress[moduleId][lessonId].timeSpent || 0
        });
      }
    }
    
    return formattedProgress;
  }

  // Call the Gemini API with the provided prompt
  async _callGeminiApi(prompt) {
    try {
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt.text
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  // Parse recommendations from Gemini response
  _parseRecommendations(response) {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const recommendations = JSON.parse(jsonString);
        
        // Validate and format recommendations
        return recommendations.map(rec => ({
          id: rec.id || '',
          title: rec.title || 'Untitled Recommendation',
          reason: rec.reason || 'Recommended based on your learning profile',
          priority: rec.priority || 3,
          estimatedTimeToComplete: rec.estimatedTimeToComplete || 0
        })).slice(0, 5); // Limit to 5 recommendations
      }
      
      // Fallback if JSON parsing fails
      return [];
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return [];
    }
  }

  // Parse learning path from Gemini response
  _parseLearningPath(response) {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const learningPath = JSON.parse(jsonString);
        
        // Validate and format learning path
        return learningPath.map(item => ({
          id: item.id || '',
          title: item.title || 'Untitled Item',
          type: item.type || 'module',
          estimatedTimeToComplete: item.estimatedTimeToComplete || 0,
          prerequisites: item.prerequisites || [],
          nextSteps: item.nextSteps || []
        }));
      }
      
      // Fallback if JSON parsing fails
      return [];
    } catch (error) {
      console.error('Error parsing learning path:', error);
      return [];
    }
  }

  // Generate personalized quiz questions based on user's progress
  async generateQuizQuestions(moduleId, topics, difficulty) {
    try {
      const prompt = {
        text: `Generate 5 quiz questions for a learning module with ID ${moduleId}.
          The module covers the following topics: ${topics.join(', ')}.
          Difficulty level: ${difficulty}.
          
          Format the response as a JSON array of questions, where each question has:
          - question: The question text
          - options: An array of 4 possible answers
          - correctAnswer: The index (0-3) of the correct answer
          - explanation: A brief explanation of why the answer is correct
          `
      };
      
      const response = await this._callGeminiApi(prompt);
      const questions = this._parseQuizQuestions(response);
      
      return questions;
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      return [];
    }
  }

  // Parse quiz questions from Gemini response
  _parseQuizQuestions(response) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const questions = JSON.parse(jsonString);
        
        return questions.map(q => ({
          question: q.question || 'No question provided',
          options: q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || 'No explanation provided'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing quiz questions:', error);
      return [];
    }
  }

  // Generate personalized feedback on user's learning progress
  async generateLearningFeedback(courses, progress, timeSpent) {
    try {
      const userData = {
        progressSummary: this._summarizeProgress(progress, courses),
        timeSpent: timeSpent,
        strengths: this._identifyStrengths(progress, courses),
        weaknesses: this._identifyWeaknesses(progress, courses)
      };
      
      const prompt = {
        text: `Generate personalized learning feedback based on the user's progress:
          ${JSON.stringify(userData, null, 2)}
          
          Please provide constructive feedback that includes:
          1. An overall assessment of their learning progress
          2. Specific strengths they've demonstrated
          3. Areas that need improvement
          4. Actionable recommendations for how to improve
          5. Encouragement and motivation
          
          Format the response as a JSON object with the following keys:
          - overallAssessment
          - strengths
          - improvementAreas
          - recommendations
          - encouragement
          `
      };
      
      const response = await this._callGeminiApi(prompt);
      const feedback = this._parseFeedback(response);
      
      return feedback;
    } catch (error) {
      console.error('Error generating learning feedback:', error);
      return null;
    }
  }

  // Summarize overall progress across all courses
  _summarizeProgress(progress, courses) {
    const summary = {
      totalModules: 0,
      completedModules: 0,
      totalLessons: 0,
      completedLessons: 0,
      averageScore: 0,
      totalScores: 0,
      scoreCount: 0
    };
    
    courses.forEach(course => {
      course.modules.forEach(module => {
        summary.totalModules++;
        
        let moduleComplete = true;
        module.lessons.forEach(lesson => {
          summary.totalLessons++;
          
          if (progress[module.id]?.[lesson.id]?.completed) {
            summary.completedLessons++;
            
            if (progress[module.id][lesson.id].score) {
              summary.totalScores += progress[module.id][lesson.id].score;
              summary.scoreCount++;
            }
          } else {
            moduleComplete = false;
          }
        });
        
        if (moduleComplete) {
          summary.completedModules++;
        }
      });
    });
    
    summary.averageScore = summary.scoreCount > 0 ? summary.totalScores / summary.scoreCount : 0;
    
    return summary;
  }

  // Identify user's strengths based on progress
  _identifyStrengths(progress, courses) {
    const strengths = [];
    const categoryScores = {};
    
    courses.forEach(course => {
      if (!categoryScores[course.category]) {
        categoryScores[course.category] = {
          totalScore: 0,
          count: 0
        };
      }
      
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          if (progress[module.id]?.[lesson.id]?.score) {
            const score = progress[module.id][lesson.id].score;
            if (score > 80) {
              categoryScores[course.category].totalScore += score;
              categoryScores[course.category].count++;
            }
          }
        });
      });
    });
    
    // Identify top 3 categories
    const topCategories = Object.entries(categoryScores)
      .filter(([_, data]) => data.count > 0)
      .map(([category, data]) => ({
        category,
        averageScore: data.totalScore / data.count
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3);
    
    topCategories.forEach(item => {
      strengths.push(item.category);
    });
    
    return strengths;
  }

  // Identify user's weaknesses based on progress
  _identifyWeaknesses(progress, courses) {
    const weaknesses = [];
    const categoryScores = {};
    
    courses.forEach(course => {
      if (!categoryScores[course.category]) {
        categoryScores[course.category] = {
          totalScore: 0,
          count: 0
        };
      }
      
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          if (progress[module.id]?.[lesson.id]?.score) {
            const score = progress[module.id][lesson.id].score;
            if (score < 70) {
              categoryScores[course.category].totalScore += score;
              categoryScores[course.category].count++;
            }
          }
        });
      });
    });
    
    // Identify bottom 3 categories
    const bottomCategories = Object.entries(categoryScores)
      .filter(([_, data]) => data.count > 0)
      .map(([category, data]) => ({
        category,
        averageScore: data.totalScore / data.count
      }))
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3);
    
    bottomCategories.forEach(item => {
      weaknesses.push(item.category);
    });
    
    return weaknesses;
  }

  // Parse feedback from Gemini response
  _parseFeedback(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const feedback = JSON.parse(jsonString);
        
        return {
          overallAssessment: feedback.overallAssessment || 'No assessment provided',
          strengths: feedback.strengths || [],
          improvementAreas: feedback.improvementAreas || [],
          recommendations: feedback.recommendations || [],
          encouragement: feedback.encouragement || 'Keep learning!'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing feedback:', error);
      return null;
    }
  }
}
