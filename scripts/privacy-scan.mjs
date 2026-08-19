#!/usr/bin/env node
import {privacyScan} from './lib/privacy.mjs';

const root = process.argv[2] || '.';
const errors = await privacyScan(root);
if (errors.length) {
  console.error(`Privacy scan failed with ${errors.length} issue(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Privacy scan passed: ${root}`);
