#!/usr/bin/env node

/**
 * bin/pdfy.js — CLI entry point.
 *
 * Usage:
 *   npx pdfy                          # build per project's render config (default: parts + combined)
 *   npx pdfy intro                    # build one part
 *   npx pdfy intro "the landscape"    # build specific parts
 *   npx pdfy combined                 # build only the combined PDF
 *   npx pdfy intro combined           # build intro + combined
 *   npx pdfy --list                   # list available parts
 */

const path = require('path');

const PROJECT_FILE = 'project.js';
const projectPath = path.resolve(process.cwd(), PROJECT_FILE);

let project;
try {
  project = require(projectPath);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error(`No ${PROJECT_FILE} found in ${process.cwd()}`);
    process.exit(1);
  }
  throw err;
}

if (!project.parts || !project.parts.length) {
  console.error(`${PROJECT_FILE} has no parts defined.`);
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log('Parts:');
  project.parts.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}`));
  console.log(`  *  combined`);
  process.exit(0);
}

async function run() {
  if (!args.length) {
    await project.buildAll();
    return;
  }

  const wantsCombined = args.some((a) => a.toLowerCase() === 'combined');
  const partNames = args.filter((a) => a.toLowerCase() !== 'combined');

  if (!partNames.length && wantsCombined) {
    await project.buildAll(['combined']);
    return;
  }

  for (const name of partNames) {
    await project.build(name);
  }

  if (wantsCombined) {
    await project.buildCombined();
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
