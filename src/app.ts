import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import path from 'path';
import config from './config/index';
import globalErrorHandler from './middleware/error.middleware';
import notFound from './middleware/not-found.middleware';
import { generalApiRateLimiter } from './middleware/rate-limit.middleware';
import version1Routes from './routes/v1';
const app = express();

const getAllowedOrigins = (): string[] => {
  const origins = [...config.cors.allowedOrigins];

  // Add development origins in development mode
  if (process.env.NODE_ENV === 'development') {
    origins.push(...config.cors.developmentOrigins);
  }

  return origins;
};

//
const getCorsOptions = (allowedOrigins: string[]) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void
    ) => {
      if (isProduction) {
        if (!origin) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn(`🛡️ CORS blocked origin in production: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }

      // In development: More permissive
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost in development only
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Accept-Language',
      'Accept-Encoding',
      'Connection',
      'User-Agent',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: isProduction ? 86400 : 3600,
  };
};

// helmet config
const getHelmetConfig = (allowedOrigins: string[]) => {
  return helmet({
    hsts: {
      includeSubDomains: true,
      preload: true,
      maxAge: 63072000, // 2 years in seconds
    },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: [
          "'self'",
          'https://polyfill.io',
          'https://*.cloudflare.com',
          'http://127.0.0.1:3000/',
        ],
        baseUri: ["'self'"],
        scriptSrc: [
          "'self'",
          'http://127.0.0.1:3000/',
          'https://*.cloudflare.com',
          'https://polyfill.io',
          process.env.NODE_ENV === 'development' ? "'unsafe-inline'" : "'strict-dynamic'",
        ],
        styleSrc: ["'self'", 'https:', 'http:', "'unsafe-inline'"],
        imgSrc: ["'self'", 'blob:', 'validator.swagger.io', '*'],
        fontSrc: ["'self'", 'https:', 'data:'],
        childSrc: ["'self'", 'blob:'],
        styleSrcAttr: ["'self'", "'unsafe-inline'", 'http:'],
        frameSrc: ["'self'"],
        connectSrc: ["'self'", ...allowedOrigins],
      },
    },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    originAgentCluster: true,
  });
};

// security headers
const getAdditionalSecurityHeaders = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Permissions-Policy',
      'fullscreen=(self), camera=(), geolocation=(self), autoplay=(), payment=(), microphone=()'
    );
    next();
  };
};

//Configure HTTP Parameter Pollution protection
const getHppConfig = () => {
  return hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'filter'],
  });
};

//Log suspicious activity patterns
const logSuspiciousActivity = (req: Request, ip: string | undefined): void => {
  const bodyStr = JSON.stringify(req.body);
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\$ne|\$gt|\$lt|\$regex/i, // MongoDB injection patterns
    /union\s+select/i, // SQL injection patterns
    /exec\s*\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(bodyStr)) {
      console.warn(`⚠️ Suspicious pattern detected from IP ${ip}: ${pattern.source}`);
      break;
    }
  }
};

/**
 * Configure security logging middleware
 */
const getSecurityLoggingMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const origin = req.get('Origin');

    // Log security-relevant information
    console.log(
      `${timestamp} - ${req.method} ${
        req.url
      } - IP: ${ip} - Origin: ${origin} - UA: ${userAgent?.substring(0, 100)}`
    );

    // Log suspicious activities
    if (req.body && typeof req.body === 'object') {
      logSuspiciousActivity(req, ip);
    }

    next();
  };
};

const getSecurityErrorHandler = () => {
  return (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    // Log security-related errors
    if (error.code === 'EBADCSRFTOKEN') {
      console.warn(`🛡️ CSRF token validation failed from IP: ${req.ip}`);
      res.status(403).json({ error: 'Invalid CSRF token' });
      return;
    }

    if (error.message === 'Not allowed by CORS') {
      console.warn(`🛡️ CORS violation from origin: ${req.get('Origin')} - IP: ${req.ip}`);
      res.status(403).json({ error: 'CORS policy violation' });
      return;
    }

    // Use existing global error handler
    globalErrorHandler(error, req, res, next);
  };
};

//Basic Express Setup
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = getAllowedOrigins();
const corsOptions = getCorsOptions(allowedOrigins);

app.use(cors(corsOptions));
// app.options('(.*)', cors(corsOptions));

// Static file serving with security headers
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, '../uploads/'))
);

// Serve static assets
app.use('/public', express.static(path.join(__dirname, '../public')));

// Helmet security headers
app.use(getHelmetConfig(allowedOrigins));

// Additional security headers
app.use(getAdditionalSecurityHeaders());

// HTTP Parameter Pollution Protection
app.use(getHppConfig());

// Security logging middleware
app.use(getSecurityLoggingMiddleware());

// General API rate limiting
app.use(generalApiRateLimiter);

// Main API routes
app.use('/api/v1', version1Routes);

// Health check endpoints
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🚀 yourcr Backend API is running smoothly!',
    data: {
      name: 'yourcr',
      status: 'Online',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      environment: config.env || 'development',
      version: '1.0.0',
    },
    services: {
      database: 'Connected',
      security: 'Fortified',
    },
    documentation: {
      swagger: config.env !== 'production' ? '/api-docs' : 'Contact admin for documentation',
      routes: '/api/v1',
    },
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Error Handling
app.use(notFound);

// Enhanced global error handler with security logging
app.use(getSecurityErrorHandler());

export default app;
