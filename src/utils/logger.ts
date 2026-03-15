import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, errors } = winston.format;

const myFormat = printf(info => {
  const { level, message, label, timestamp, stack } = info;
  const date = new Date(timestamp as string);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const formattedMessage = `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level}: ${message}`;
  return stack ? `${formattedMessage}\n${stack}` : formattedMessage;
});

// Daily Rotate File Transport for Success/Info logs
const successTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'success', 'success-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'info',
  format: combine(label({ label: 'easybet-backend' }), timestamp(), myFormat),
});

// Daily Rotate File Transport for Error logs
const errorTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'errors', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d', // Automatically delete logs older than 7 days
  level: 'error',
  format: combine(label({ label: 'Your-CR' }), timestamp(), errors({ stack: true }), myFormat),
});

// Console Transport
const consoleTransport = new winston.transports.Console({
  format: combine(label({ label: 'Your-CR' }), timestamp(), winston.format.colorize(), myFormat),
});

// General logger with file and console transports
const logger = winston.createLogger({
  level: 'info',
  format: combine(label({ label: 'Your-CR' }), timestamp(), myFormat),
  transports: [successTransport, consoleTransport, errorTransport],
});

export default logger;
