import fs from 'node:fs/promises';

function typeMatches(value, expected) {
  if (expected === 'null') return value === null;
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expected === 'integer') return Number.isInteger(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === expected;
}

function stableValue(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableValue).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableValue(value[key])}`).join(',')}}`;
}

export function validateValue(value, schema, path = '$') {
  const errors = [];
  if (!schema || typeof schema !== 'object') return [`${path}: schema must be an object`];

  if (Object.hasOwn(schema, 'const') && stableValue(value) !== stableValue(schema.const)) {
    errors.push(`${path}: must equal ${JSON.stringify(schema.const)}`);
  }

  if (schema.enum && !schema.enum.some(item => stableValue(item) === stableValue(value))) {
    errors.push(`${path}: must be one of ${schema.enum.map(item => JSON.stringify(item)).join(', ')}`);
  }

  const expectedTypes = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  if (expectedTypes.length && !expectedTypes.some(type => typeMatches(value, type))) {
    errors.push(`${path}: expected ${expectedTypes.join(' or ')}`);
    return errors;
  }

  if (value === null) return errors;

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${path}: longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${path}: does not match ${schema.pattern}`);
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) errors.push(`${path}: invalid date-time`);
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: above maximum ${schema.maximum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: requires at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: allows at most ${schema.maxItems} items`);
    if (schema.uniqueItems) {
      const normalized = value.map(stableValue);
      if (new Set(normalized).size !== normalized.length) errors.push(`${path}: items must be unique`);
    }
    if (schema.items) value.forEach((item, index) => errors.push(...validateValue(item, schema.items, `${path}[${index}]`)));
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const field of schema.required || []) {
      if (!Object.hasOwn(value, field)) errors.push(`${path}.${field}: is required`);
    }
    if (schema.additionalProperties === false) {
      for (const field of Object.keys(value)) {
        if (!Object.hasOwn(schema.properties || {}, field)) errors.push(`${path}.${field}: additional property is not allowed`);
      }
    }
    for (const [field, childSchema] of Object.entries(schema.properties || {})) {
      if (Object.hasOwn(value, field)) errors.push(...validateValue(value[field], childSchema, `${path}.${field}`));
    }
  }

  return errors;
}

export async function readJson(path) {
  return JSON.parse(await fs.readFile(path, 'utf8'));
}

export async function validateFile(dataPath, schemaPath) {
  const [data, schema] = await Promise.all([readJson(dataPath), readJson(schemaPath)]);
  return validateValue(data, schema);
}
