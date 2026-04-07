const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = __DEV__ ? LOG_LEVELS.debug : LOG_LEVELS.warn;

const shouldLog = (level) => LOG_LEVELS[level] >= MIN_LEVEL;

const logger = {
  debug: (...args) => { if (shouldLog('debug')) console.log('[DEBUG]', ...args); },
  info:  (...args) => { if (shouldLog('info'))  console.log('[INFO]',  ...args); },
  warn:  (...args) => { if (shouldLog('warn'))  console.warn('[WARN]', ...args); },
  error: (...args) => { if (shouldLog('error')) console.error('[ERROR]', ...args); },
};

export default logger;
