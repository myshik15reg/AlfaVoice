/**
 * Logger Service
 * 
 * Provides structured logging with different levels (INFO, WARN, ERROR).
 * Logs are displayed in the console with timestamps and stored in memory.
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Store last 100 logs in memory

  /**
   * Format timestamp for logs
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Add log entry to memory buffer
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Format log message for console output
   */
  private formatConsoleMessage(entry: LogEntry): string {
    const context = entry.context ? `[${entry.context}] ` : '';
    return `${entry.timestamp} ${entry.level} ${context}${entry.message}`;
  }

  /**
   * Log an INFO level message
   */
  info(message: string, context?: string): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: LogLevel.INFO,
      message,
      context
    };
    
    this.addLog(entry);
    console.log(this.formatConsoleMessage(entry));
  }

  /**
   * Log a WARN level message
   */
  warn(message: string, context?: string): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: LogLevel.WARN,
      message,
      context
    };
    
    this.addLog(entry);
    console.warn(this.formatConsoleMessage(entry));
  }

  /**
   * Log an ERROR level message
   */
  error(message: string, error?: unknown, context?: string): void {
    let errorMessage = message;
    
    if (error) {
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        if (error.stack) {
          console.error(error.stack);
        }
      } else {
        errorMessage += `: ${String(error)}`;
      }
    }
    
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: LogLevel.ERROR,
      message: errorMessage,
      context
    };
    
    this.addLog(entry);
    console.error(this.formatConsoleMessage(entry));
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared', 'Logger');
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
}

// Export singleton instance
export const logger = new Logger();
