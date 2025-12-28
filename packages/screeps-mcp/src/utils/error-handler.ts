/**
 * Error Handling Utilities for MCP Tools
 * 
 * Provides standardized error handling and response formatting
 * to improve AI agent understanding of errors and failure modes.
 */

import { z } from "zod";

/**
 * Standard error response format for MCP tools
 */
export interface MCPErrorResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError: true;
  errorCode?: string;
  errorType?: string;
}

/**
 * Standard success response format for MCP tools
 */
export interface MCPSuccessResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: false;
}

export type MCPResponse = MCPSuccessResponse | MCPErrorResponse;

/**
 * Error types for categorization
 */
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  NETWORK = "NETWORK_ERROR",
  API = "API_ERROR",
  TIMEOUT = "TIMEOUT_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  PERMISSION = "PERMISSION_ERROR",
  RATE_LIMIT = "RATE_LIMIT_ERROR",
  INTERNAL = "INTERNAL_ERROR"
}

/**
 * Error codes for specific error conditions
 */
export enum ErrorCode {
  // Validation errors (1xxx)
  INVALID_INPUT = "E1001",
  INVALID_ROOM_NAME = "E1002",
  INVALID_MEMORY_PATH = "E1003",
  INVALID_SEGMENT_NUMBER = "E1004",
  INVALID_USER_ID = "E1005",
  VALUE_TOO_LARGE = "E1006",
  
  // Authentication errors (2xxx)
  INVALID_TOKEN = "E2001",
  INVALID_CREDENTIALS = "E2002",
  TOKEN_EXPIRED = "E2003",
  
  // Network errors (3xxx)
  CONNECTION_FAILED = "E3001",
  CONNECTION_TIMEOUT = "E3002",
  CONNECTION_LOST = "E3003",
  
  // API errors (4xxx)
  API_ERROR = "E4001",
  API_RATE_LIMIT = "E4002",
  API_UNAVAILABLE = "E4003",
  RESOURCE_NOT_FOUND = "E4004",
  
  // Permission errors (5xxx)
  INSUFFICIENT_PERMISSIONS = "E5001",
  OPERATION_NOT_ALLOWED = "E5002",
  
  // Internal errors (9xxx)
  INTERNAL_ERROR = "E9001",
  UNKNOWN_ERROR = "E9999"
}

/**
 * Custom error class with additional context
 */
export class MCPError extends Error {
  constructor(
    message: string,
    public errorType: ErrorType,
    public errorCode: ErrorCode,
    public details?: Record<string, unknown>,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = "MCPError";
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: Error | MCPError | z.ZodError,
  context?: string
): MCPErrorResponse {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const issues = error.issues.map(issue => 
      `  - ${issue.path.join(".")}: ${issue.message}`
    ).join("\n");
    
    return {
      content: [{
        type: "text",
        text: `Validation Error: Invalid input parameters\n\nIssues:\n${issues}\n\n` +
              `Suggestion: Check the parameter types and formats. Refer to the AI_AGENT_GUIDE.md for examples.`
      }],
      isError: true,
      errorCode: ErrorCode.INVALID_INPUT,
      errorType: ErrorType.VALIDATION
    };
  }
  
  // Handle custom MCP errors
  if (error instanceof MCPError) {
    let text = `${error.errorType}: ${error.message}`;
    
    if (context) {
      text += `\n\nContext: ${context}`;
    }
    
    if (error.details) {
      text += `\n\nDetails: ${JSON.stringify(error.details, null, 2)}`;
    }
    
    if (error.suggestions && error.suggestions.length > 0) {
      text += `\n\nSuggestions:\n${error.suggestions.map(s => `  - ${s}`).join("\n")}`;
    }
    
    return {
      content: [{ type: "text", text }],
      isError: true,
      errorCode: error.errorCode,
      errorType: error.errorType
    };
  }
  
  // Handle generic errors
  let errorType = ErrorType.INTERNAL;
  let errorCode = ErrorCode.UNKNOWN_ERROR;
  let suggestions: string[] = [];
  
  // Try to categorize the error based on message
  const message = error.message.toLowerCase();
  
  if (message.includes("auth") || message.includes("token") || message.includes("credential")) {
    errorType = ErrorType.AUTHENTICATION;
    errorCode = ErrorCode.INVALID_TOKEN;
    suggestions = [
      "Verify SCREEPS_TOKEN environment variable is set correctly",
      "Check if token has expired and generate a new one",
      "Ensure token has necessary permissions"
    ];
  } else if (message.includes("network") || message.includes("connection") || message.includes("econnrefused")) {
    errorType = ErrorType.NETWORK;
    errorCode = ErrorCode.CONNECTION_FAILED;
    suggestions = [
      "Check network connectivity",
      "Verify SCREEPS_HOST is correct",
      "Check if Screeps API is accessible",
      "Retry the operation after a short delay"
    ];
  } else if (message.includes("timeout")) {
    errorType = ErrorType.TIMEOUT;
    errorCode = ErrorCode.CONNECTION_TIMEOUT;
    suggestions = [
      "Retry the operation",
      "Check if Screeps API is responding slowly",
      "Consider using more specific queries to reduce data transfer"
    ];
  } else if (message.includes("rate limit") || message.includes("too many requests")) {
    errorType = ErrorType.RATE_LIMIT;
    errorCode = ErrorCode.API_RATE_LIMIT;
    suggestions = [
      "Wait before retrying the operation",
      "Implement exponential backoff for retries",
      "Reduce the frequency of API calls",
      "Consider caching frequently accessed data"
    ];
  } else if (message.includes("not found") || message.includes("404")) {
    errorType = ErrorType.NOT_FOUND;
    errorCode = ErrorCode.RESOURCE_NOT_FOUND;
    suggestions = [
      "Verify the resource identifier (room name, user ID, etc.) is correct",
      "Check if the resource exists in the game",
      "Ensure you have visibility of the resource"
    ];
  } else if (message.includes("permission") || message.includes("forbidden") || message.includes("403")) {
    errorType = ErrorType.PERMISSION;
    errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
    suggestions = [
      "Check if your account has necessary permissions",
      "Verify token has required scopes",
      "Some operations may be restricted by game rules"
    ];
  }
  
  let text = `${errorType}: ${error.message}`;
  
  if (context) {
    text += `\n\nContext: ${context}`;
  }
  
  if (suggestions.length > 0) {
    text += `\n\nSuggestions:\n${suggestions.map(s => `  - ${s}`).join("\n")}`;
  }
  
  return {
    content: [{ type: "text", text }],
    isError: true,
    errorCode,
    errorType
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(data: string | object): MCPSuccessResponse {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  
  return {
    content: [{
      type: "text",
      text
    }],
    isError: false
  };
}

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandling<TInput, TOutput extends string | object>(
  handler: (input: TInput) => Promise<TOutput>,
  context?: string
): (input: TInput) => Promise<MCPResponse> {
  return async (input: TInput): Promise<MCPResponse> => {
    try {
      const result = await handler(input);
      return createSuccessResponse(result);
    } catch (error) {
      if (error instanceof Error) {
        return createErrorResponse(error, context);
      }
      return createErrorResponse(
        new Error(String(error)),
        context
      );
    }
  };
}

/**
 * Validate room name format
 */
export function validateRoomName(roomName: string): void {
  const roomPattern = /^[WE]\d+[NS]\d+$/;
  if (!roomPattern.test(roomName)) {
    throw new MCPError(
      `Invalid room name format: "${roomName}"`,
      ErrorType.VALIDATION,
      ErrorCode.INVALID_ROOM_NAME,
      { roomName },
      [
        "Room names must be in format like 'W1N1' or 'E5S10'",
        "First character: W (west) or E (east)",
        "Followed by a number",
        "Then: N (north) or S (south)",
        "Followed by a number",
        "Examples: W0N0, W1N1, E5S10, W10N25"
      ]
    );
  }
}

/**
 * Validate memory path format
 */
export function validateMemoryPath(path: string): void {
  // Memory paths can be empty (root) or dot-notation
  if (path.includes("..") || path.startsWith(".") || path.endsWith(".")) {
    throw new MCPError(
      `Invalid memory path format: "${path}"`,
      ErrorType.VALIDATION,
      ErrorCode.INVALID_MEMORY_PATH,
      { path },
      [
        "Use dot notation for nested paths: 'rooms.W1N1.level'",
        "Use empty string '' for root Memory object",
        "Do not start or end with dots",
        "Do not use consecutive dots (..)"
      ]
    );
  }
}

/**
 * Validate segment number
 */
export function validateSegmentNumber(segment: number): void {
  if (!Number.isInteger(segment) || segment < 0 || segment > 99) {
    throw new MCPError(
      `Invalid segment number: ${segment}`,
      ErrorType.VALIDATION,
      ErrorCode.INVALID_SEGMENT_NUMBER,
      { segment },
      [
        "Segment number must be an integer between 0 and 99",
        "There are 100 available segments (0-99)",
        "Each segment can store up to 100KB of data"
      ]
    );
  }
}

/**
 * Validate user ID format
 */
export function validateUserId(userId: string): void {
  const userIdPattern = /^[a-f0-9]{24}$/;
  if (!userIdPattern.test(userId)) {
    throw new MCPError(
      `Invalid user ID format: "${userId}"`,
      ErrorType.VALIDATION,
      ErrorCode.INVALID_USER_ID,
      { userId },
      [
        "User ID must be a 24-character hexadecimal string",
        "Get user ID from screeps_user_info tool first",
        "Example: 5a5b1c2d3e4f5a6b7c8d9e0f"
      ]
    );
  }
}

/**
 * Check if data size is within limits
 */
export function validateDataSize(data: string, maxSize: number, dataType: string): void {
  const size = Buffer.byteLength(data, "utf8");
  if (size > maxSize) {
    throw new MCPError(
      `${dataType} size exceeds limit: ${size} bytes (max: ${maxSize} bytes)`,
      ErrorType.VALIDATION,
      ErrorCode.VALUE_TOO_LARGE,
      { size, maxSize, dataType },
      [
        `Reduce the size of ${dataType} to ${maxSize} bytes or less`,
        "Consider splitting data across multiple segments or memory paths",
        "Use compression if appropriate"
      ]
    );
  }
}
