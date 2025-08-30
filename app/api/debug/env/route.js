import { NextResponse } from 'next/server';

export async function GET() {
  // Get all environment variables
  const allEnvVars = process.env;
  
  // Filter out sensitive information (only show first 8 characters)
  const sanitizedEnvVars = {};
  Object.keys(allEnvVars).forEach(key => {
    const value = allEnvVars[key];
    if (value && (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') || key.includes('TOKEN'))) {
      // Sanitize sensitive values
      sanitizedEnvVars[key] = value.length > 8 ? `${value.substring(0, 8)}...` : '***';
    } else {
      sanitizedEnvVars[key] = value || 'NOT SET';
    }
  });

  // Check R2-specific configuration
  const r2Config = {
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? 'SET' : 'NOT SET',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'NOT SET',
  };

  const missingR2Vars = Object.keys(r2Config).filter(key => r2Config[key] === 'NOT SET');

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    r2Configuration: {
      status: missingR2Vars.length === 0 ? 'CONFIGURED' : 'MISSING_VARIABLES',
      variables: r2Config,
      missing: missingR2Vars,
      configured: missingR2Vars.length === 0
    },
    allEnvironmentVariables: sanitizedEnvVars,
    note: 'Sensitive values are truncated for security. Remove this endpoint in production.'
  });
}
