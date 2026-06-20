/**
 * @file config/environment.js
 * @description Operational Configuration Gatekeeper and Fail-Early Validation Module.
 * Audits system properties on initial startup against strict property masks to prevent schema contamination (NFR3.2).
 */

import dotenv from 'dotenv';

// Read values from the root .env file straight into process context memory
dotenv.config();

/**
 * @function validateEnvironmentVariables
 * @description Compiles process properties against defined systemic structural rules.
 * Throws clean, descriptive errors early to block execution if variables are contaminated or missing.
 * @returns {Object} Heavily vetted and validated process environmental map.
 * @target NFR3.2: Input validation engines and strict property masks
 */
const validateEnvironmentVariables = () => {
  const rules = [
    {
      key: 'PORT',
      required: true,
      defaultValue: '5000',
      validator: (val) => !isNaN(Number(val)),
      errorMessage: 'The PORT variable allocation parameter must be a valid numerical sequence index string.'
    },
    {
      key: 'MONGO_URI',
      required: true,
      validator: (val) => val && (val.startsWith('mongodb://') || val.startsWith('mongodb+srv://')),
      errorMessage: 'The MONGO_URI connection driver string must represent a valid, active MongoDB connection URL.'
    },
    {
      key: 'JWT_SECRET',
      required: true,
      validator: (val) => val && val.length >= 16,
      errorMessage: 'The JWT_SECRET entropy depth metrics must span a minimum length threshold of 16 characters.'
    },
    {
      key: 'GROQ_API_KEY',
      required: true,
      validator: (val) => val && val.length >= 20,
      errorMessage: 'The GROQ_API_KEY must be a valid API token (minimum 20 characters).'
    },
    {
      key: 'GROQ_BASE_URL',
      required: false,
      defaultValue: 'https://api.groq.com/openai/v1',
      validator: (val) => val && val.startsWith('https://'),
      errorMessage: 'The GROQ_BASE_URL must be a valid HTTPS endpoint.'
    }
  ];

  const cleanConfig = {};

  for (const rule of rules) {
    let rawValue = process.env[rule.key];

    // Fall back to the default value if the parameter is missing but optional
    if (!rawValue && rule.required) {
      if (rule.defaultValue) {
        rawValue = rule.defaultValue;
      } else {
        throw new Error(
          `\n❌ [ENV BOOT FAULT]: Critical property [${rule.key}] is missing inside your root .env file.\nTarget Action: Stop and configure this parameter.`
        );
      }
    }

    // Execute the strict structural evaluation criteria test
    if (rawValue && rule.validator && !rule.validator(rawValue)) {
      throw new Error(
        `\n❌ [ENV VALUE VIOLATION]: The property [${rule.key}] failed configuration constraints.\nRule Restriction: ${rule.errorMessage}\nReceived raw value: "${rawValue}"`
      );
    }

    // Map evaluated attributes securely to the clean configuration map output
    cleanConfig[rule.key] = rule.key === 'PORT' ? Number(rawValue) : rawValue;
  }

  console.log('⚡ [Config Gateway]: Environmental validation rules evaluated successfully. Integrity verified.');
  return cleanConfig;
};

// Execute validation immediately upon module ingestion to prevent contaminated bootstrapping
const ENVIRONMENT = validateEnvironmentVariables();

export default ENVIRONMENT;