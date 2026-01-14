import { reactive, toRefs } from 'vue';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  detail?: string;
  context?: string;
  timestamp: number;
}

const MAX_LOGS = 200;

const state = reactive({
  entries: [] as LogEntry[]
});

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const formatDetail = (value: unknown) => {
  if (value instanceof Error) {
    return value.stack || value.message;
  }
  if (typeof value === 'string') {
    return value;
  }
  return safeStringify(value);
};

const pushEntry = (entry: LogEntry) => {
  state.entries = [...state.entries, entry].slice(-MAX_LOGS);
};

const addLog = (level: LogLevel, message: string, detail?: string, context?: string) => {
  pushEntry({
    id: crypto.randomUUID(),
    level,
    message,
    detail,
    context,
    timestamp: Date.now()
  });
};

const logInfo = (message: string, detail?: string, context?: string) => {
  addLog('info', message, detail, context);
};

const logWarn = (message: string, detail?: string, context?: string) => {
  addLog('warn', message, detail, context);
};

const logError = (context: string, error: unknown, message?: string) => {
  addLog('error', message ?? `Error in ${context}`, formatDetail(error), context);
};

const clearLogs = () => {
  state.entries = [];
  addLog('info', 'Logs cleared');
};

export const useLogStore = () => ({
  ...toRefs(state),
  addLog,
  clearLogs,
  logInfo,
  logWarn,
  logError
});

export { addLog, logInfo, logWarn, logError, clearLogs };
