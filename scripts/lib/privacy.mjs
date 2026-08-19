import fs from 'node:fs/promises';
import path from 'node:path';

const EXCLUDED_DIRS = new Set(['.git', 'node_modules', '.cache', 'dist', 'coverage']);
const FORBIDDEN_FILE_PATTERNS = [/(^|\/)\.env(?:\.|$)/i, /\.(?:pem|p12|pfx|key)$/i];
const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/,
  /\bsk-[A-Za-z0-9_-]{16,}/,
  /\bAKID[A-Za-z0-9]{12,}/
];
const FORBIDDEN_JSON_KEYS = new Set([
  'authorization', 'cookie', 'apiKey', 'apiSecret', 'accessToken', 'refreshToken',
  'rawInput', 'rawUserInput', 'systemPrompt', 'privateSourceText', 'modifiedText', 'clipboardText'
]);

async function listFiles(root) {
  const files = [];
  async function visit(current) {
    for (const entry of await fs.readdir(current, {withFileTypes: true})) {
      if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(fullPath);
      else if (entry.isFile()) files.push(fullPath);
    }
  }
  await visit(root);
  return files;
}

function scanJson(value, file, pointer = '$', errors = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanJson(item, file, `${pointer}[${index}]`, errors));
    return errors;
  }
  if (!value || typeof value !== 'object') return errors;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_JSON_KEYS.has(key)) errors.push(`${file}:${pointer}.${key}: forbidden public field`);
    if (['excerpt', 'sourceText'].includes(key) && typeof child === 'string' && child.length > 1200) {
      errors.push(`${file}:${pointer}.${key}: source excerpt exceeds 1200 characters`);
    }
    scanJson(child, file, `${pointer}.${key}`, errors);
  }
  return errors;
}

export async function privacyScan(root) {
  const absoluteRoot = path.resolve(root);
  const errors = [];
  for (const file of await listFiles(absoluteRoot)) {
    const relative = path.relative(absoluteRoot, file);
    if (FORBIDDEN_FILE_PATTERNS.some(pattern => pattern.test(relative))) errors.push(`${relative}: forbidden public file type`);
    const content = await fs.readFile(file);
    if (content.includes(0)) continue;
    const text = content.toString('utf8');
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(text)) errors.push(`${relative}: possible credential or private key`);
    }
    if (/\.jsonl?$/.test(relative)) {
      try {
        const records = relative.endsWith('.jsonl')
          ? text.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
          : [JSON.parse(text)];
        records.forEach(record => scanJson(record, relative, '$', errors));
      } catch (error) {
        errors.push(`${relative}: invalid JSON (${error.message})`);
      }
    }
  }
  return errors;
}
