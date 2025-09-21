import axios from 'axios';

export class RealMCPClient {
  constructor() {
    // Your MCP server runs on stdio, so we need to create an HTTP bridge
    // For now, let's create a simple HTTP server that bridges to your MCP
    this.baseURL = 'http://localhost:3001'; // We'll create this bridge
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendMessage(message) {
    try {
      console.log('Sending message to MCP server:', message);
      
      // Parse the message to determine the type of request
      const requestType = this.determineRequestType(message);
      
      if (requestType.type === 'analyze') {
        return await this.executeAnalysis(requestType.message);
      } else if (requestType.type === 'prompt') {
        return await this.executePrompt(requestType.name, requestType.args, message);
      } else if (requestType.type === 'tool') {
        return await this.executeTool(requestType.name, requestType.args, message);
      } else {
        // Default to general analysis
        return await this.executeAnalysis(message);
      }
    } catch (error) {
      console.error('MCP Client Error:', error);
      throw new Error(`Failed to communicate with MCP server: ${error.message}`);
    }
  }

  determineRequestType(message) {
    // Let the MCP server handle all the intelligence
    // Just pass the raw message and let the server decide what to do
    return { type: 'analyze', message: message.trim() };
  }

  async executeAnalysis(message) {
    try {
      console.log(`Executing analysis for message: ${message}`);
      
      // Call the MCP server HTTP bridge with the raw message
      const response = await this.client.post('/analyze', {
        message: message
      });
      
      return {
        content: response.data.content,
        data: response.data.data,
        widgetType: response.data.widgetType
      };
    } catch (error) {
      console.error('Error executing analysis:', error);
      throw new Error(`Failed to execute analysis: ${error.message}`);
    }
  }


  async executePrompt(promptName, args, originalMessage) {
    try {
      console.log(`Executing prompt: ${promptName} with args:`, args);
      
      // Call the MCP server HTTP bridge
      const response = await this.client.post('/prompt', {
        name: promptName,
        args: args,
        message: originalMessage
      });
      
      return {
        content: response.data.content,
        data: response.data.data,
        widgetType: response.data.widgetType
      };
    } catch (error) {
      console.error('Error executing prompt:', error);
      throw new Error(`Failed to execute prompt ${promptName}: ${error.message}`);
    }
  }

  async executeTool(toolName, args, originalMessage) {
    try {
      console.log(`Executing tool: ${toolName} with args:`, args);
      
      // Call the MCP server HTTP bridge
      const response = await this.client.post('/tool', {
        name: toolName,
        args: args,
        message: originalMessage
      });
      
      return {
        content: response.data.content,
        data: response.data.data,
        widgetType: response.data.widgetType
      };
    } catch (error) {
      console.error('Error executing tool:', error);
      throw new Error(`Failed to execute tool ${toolName}: ${error.message}`);
    }
  }

}
