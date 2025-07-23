const levelRank = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default to "warn" if not defined or invalid
const envLevel = (import.meta.env.VITE_LOG_LEVEL || "").toLowerCase();
const currentLevel = levelRank.hasOwnProperty(envLevel) ? envLevel : "warn";

function shouldLog(level) {
  return levelRank[level] >= 0 && levelRank[level] >= levelRank[currentLevel];
}

export const debug = (...args) => {
  if (shouldLog("debug")) console.debug(...args);
};

export const info = (...args) => {
  if (shouldLog("info")) console.info(...args);
};

export const warn = (...args) => {
  if (shouldLog("warn")) console.warn(...args);
};

export const error = (...args) => {
  console.error(...args); // always show
};
