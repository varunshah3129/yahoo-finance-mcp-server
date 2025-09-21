import SmartWidgetSelector from './smart-widget-selector.js';

/**
 * Enhanced Widget Bridge - Integrates smart widget selection with the existing MCP bridge
 */
class EnhancedWidgetBridge {
  constructor() {
    this.smartSelector = new SmartWidgetSelector();
    this.widgetHistory = [];
    this.userPreferences = {};
  }

  /**
   * Process query with enhanced widget selection
   */
  async processQueryWithSmartWidgets(query, data, toolUsed, originalResponse) {
    try {
      // Analyze query and data
      const analysis = this.smartSelector.analyzeQueryAndData(query, data, toolUsed);
      
      // Select optimal widget
      const selectedWidget = this.smartSelector.selectOptimalWidget(query, data, toolUsed);
      
      // Enhance response with smart widget information
      const enhancedResponse = {
        ...originalResponse,
        smartWidget: {
          id: selectedWidget.id,
          name: selectedWidget.name,
          description: selectedWidget.description,
          icon: selectedWidget.icon,
          confidence: this.calculateConfidence(analysis, selectedWidget),
          reasoning: this.generateReasoning(analysis, selectedWidget),
          suggestedLayout: this.suggestLayout(analysis, selectedWidget),
          dataOptimization: this.optimizeDataForWidget(data, selectedWidget)
        },
        analysis: {
          queryIntent: analysis.queryIntent,
          dataStructure: analysis.dataStructure,
          dataVolume: analysis.dataVolume,
          userContext: analysis.userContext,
          toolContext: analysis.toolContext
        }
      };

      // Store in history for learning
      this.updateWidgetHistory(query, selectedWidget, enhancedResponse);

      return enhancedResponse;
    } catch (error) {
      console.error('Smart widget selection failed:', error);
      return originalResponse; // Fallback to original response
    }
  }

  /**
   * Calculate confidence score for widget selection
   */
  calculateConfidence(analysis, selectedWidget) {
    let confidence = 0.5; // Base confidence

    // Data type match
    if (selectedWidget.dataTypes.includes(analysis.dataStructure)) {
      confidence += 0.3;
    }

    // Query intent match
    const intentMatches = analysis.queryIntent.filter(intent => 
      selectedWidget.queryPatterns.some(pattern => intent.includes(pattern))
    );
    confidence += (intentMatches.length / analysis.queryIntent.length) * 0.2;

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate reasoning for widget selection
   */
  generateReasoning(analysis, selectedWidget) {
    const reasons = [];

    // Data structure reasoning
    if (selectedWidget.dataTypes.includes(analysis.dataStructure)) {
      reasons.push(`Data structure (${analysis.dataStructure}) matches widget requirements`);
    }

    // Query intent reasoning
    const matchedIntents = analysis.queryIntent.filter(intent => 
      selectedWidget.queryPatterns.some(pattern => intent.includes(pattern))
    );
    if (matchedIntents.length > 0) {
      reasons.push(`Query intent (${matchedIntents.join(', ')}) aligns with widget purpose`);
    }

    // Data volume reasoning
    if (analysis.dataVolume === 'small' && selectedWidget.name.includes('Card')) {
      reasons.push('Small data volume suits card layout');
    } else if (analysis.dataVolume === 'large' && selectedWidget.name.includes('Table')) {
      reasons.push('Large data volume requires table layout');
    }

    // User context reasoning
    if (analysis.userContext.isProfessional && selectedWidget.name.includes('Dashboard')) {
      reasons.push('Professional context benefits from dashboard view');
    }

    return reasons.length > 0 ? reasons.join('; ') : 'General purpose widget selected';
  }

  /**
   * Suggest optimal layout based on analysis
   */
  suggestLayout(analysis, selectedWidget) {
    const layout = {
      size: 'medium',
      orientation: 'vertical',
      responsive: true,
      features: []
    };

    // Size suggestions
    if (analysis.dataVolume === 'small') {
      layout.size = 'small';
    } else if (analysis.dataVolume === 'large') {
      layout.size = 'large';
    }

    // Orientation suggestions
    if (analysis.userContext.isComparative) {
      layout.orientation = 'horizontal';
    }

    // Feature suggestions
    if (analysis.userContext.isProfessional) {
      layout.features.push('detailed_metrics', 'export_options', 'advanced_filters');
    } else if (analysis.userContext.isCasual) {
      layout.features.push('simplified_view', 'quick_actions');
    }

    if (analysis.dataVolume === 'large') {
      layout.features.push('pagination', 'search', 'sorting');
    }

    return layout;
  }

  /**
   * Optimize data structure for the selected widget
   */
  optimizeDataForWidget(data, selectedWidget) {
    const optimized = { ...data };

    // Add computed fields based on widget type
    switch (selectedWidget.id) {
      case 'quote_card':
        if (optimized.regularMarketPrice) {
          optimized.priceChange = optimized.regularMarketChange;
          optimized.priceChangePercent = optimized.regularMarketChangePercent;
          optimized.isPositive = optimized.regularMarketChange >= 0;
        }
        break;

      case 'insights_dashboard':
        if (optimized.instrumentInfo?.technicalEvents) {
          optimized.overallSentiment = this.calculateOverallSentiment(optimized.instrumentInfo.technicalEvents);
          optimized.keyLevels = this.extractKeyLevels(optimized.instrumentInfo);
        }
        break;

      case 'trending_grid':
        if (Array.isArray(optimized)) {
          optimized.sort((a, b) => (b.regularMarketChangePercent || 0) - (a.regularMarketChangePercent || 0));
          optimized.topPerformers = optimized.slice(0, 5);
        }
        break;
    }

    return optimized;
  }

  /**
   * Calculate overall sentiment from technical events
   */
  calculateOverallSentiment(technicalEvents) {
    const sentiments = [];
    
    if (technicalEvents.shortTermOutlook) {
      sentiments.push(technicalEvents.shortTermOutlook.direction === 'Bullish' ? 1 : -1);
    }
    if (technicalEvents.intermediateTermOutlook) {
      sentiments.push(technicalEvents.intermediateTermOutlook.direction === 'Bullish' ? 1 : -1);
    }
    if (technicalEvents.longTermOutlook) {
      sentiments.push(technicalEvents.longTermOutlook.direction === 'Bullish' ? 1 : -1);
    }

    const average = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    return average > 0.3 ? 'Bullish' : average < -0.3 ? 'Bearish' : 'Neutral';
  }

  /**
   * Extract key technical levels
   */
  extractKeyLevels(instrumentInfo) {
    const levels = {};
    
    if (instrumentInfo.keyTechnicals) {
      levels.support = instrumentInfo.keyTechnicals.support;
      levels.resistance = instrumentInfo.keyTechnicals.resistance;
      levels.stopLoss = instrumentInfo.keyTechnicals.stopLoss;
    }

    return levels;
  }

  /**
   * Update widget history for learning
   */
  updateWidgetHistory(query, selectedWidget, response) {
    this.widgetHistory.push({
      timestamp: new Date(),
      query: query,
      widgetId: selectedWidget.id,
      confidence: response.smartWidget.confidence,
      success: true // Would be updated based on user interaction
    });

    // Keep only last 100 entries
    if (this.widgetHistory.length > 100) {
      this.widgetHistory = this.widgetHistory.slice(-100);
    }
  }

  /**
   * Get widget suggestions based on query
   */
  getWidgetSuggestions(query) {
    const analysis = this.smartSelector.analyzeQueryAndData(query, null, null);
    const suggestions = [];

    // Get top 3 widget matches
    const scores = [];
    for (const [widgetId, widget] of this.smartSelector.widgetRegistry) {
      const score = this.smartSelector.calculateWidgetScore(widget, analysis);
      scores.push({ widgetId, widget, score });
    }

    scores.sort((a, b) => b.score - a.score);
    
    return scores.slice(0, 3).map(item => ({
      id: item.widgetId,
      name: item.widget.name,
      description: item.widget.description,
      confidence: item.score / 20, // Normalize score
      reasoning: this.generateReasoning(analysis, item.widget)
    }));
  }

  /**
   * Learn from user preferences
   */
  updateUserPreferences(userId, preferences) {
    this.userPreferences[userId] = {
      ...this.userPreferences[userId],
      ...preferences,
      lastUpdated: new Date()
    };
  }

  /**
   * Get personalized widget recommendations
   */
  getPersonalizedRecommendations(userId, query) {
    const userPrefs = this.userPreferences[userId];
    if (!userPrefs) {
      return this.getWidgetSuggestions(query);
    }

    // Apply user preferences to widget selection
    const suggestions = this.getWidgetSuggestions(query);
    
    return suggestions.map(suggestion => {
      let adjustedConfidence = suggestion.confidence;
      
      // Boost confidence for preferred widget types
      if (userPrefs.preferredWidgets?.includes(suggestion.id)) {
        adjustedConfidence += 0.2;
      }
      
      // Boost confidence for preferred layouts
      if (userPrefs.preferredLayout === 'detailed' && suggestion.name.includes('Dashboard')) {
        adjustedConfidence += 0.1;
      } else if (userPrefs.preferredLayout === 'simple' && suggestion.name.includes('Card')) {
        adjustedConfidence += 0.1;
      }

      return {
        ...suggestion,
        confidence: Math.min(adjustedConfidence, 1.0),
        personalized: true
      };
    });
  }
}

export default EnhancedWidgetBridge;



