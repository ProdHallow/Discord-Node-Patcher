#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const patcherPath = path.join(root, 'Discord_voice_node_patcher.ps1');
const readmePath = path.join(root, 'README.md');
const indexPath = path.join(root, 'discord_voice', 'index.js');

const BITRATE_BPS = 400000;
const BITRATE_HEX = '0x61A80';

const EXPECTED_PATCH_PATTERNS = [
  {
    name: 'EmulateBitrateModified',
    regex: /PatchBytes\(Offsets::EmulateBitrateModified,\s*"\\x80\\x1A\\x06",\s*3\)/,
  },
  {
    name: 'SetsBitrateBitrateValue',
    regex: /PatchBytes\(Offsets::SetsBitrateBitrateValue,\s*"\\x80\\x1A\\x06\\x00\\x00",\s*5\)/,
  },
  {
    name: 'DuplicateEmulateBitrateModified',
    regex: /PatchBytes\(Offsets::DuplicateEmulateBitrateModified,\s*"\\x80\\x1A\\x06",\s*3\)/,
  },
  {
    name: 'EncoderConfigInit1',
    regex: /PatchBytes\(Offsets::EncoderConfigInit1,\s*"\\x80\\x1A\\x06\\x00",\s*4\)/,
  },
  {
    name: 'EncoderConfigInit2',
    regex: /PatchBytes\(Offsets::EncoderConfigInit2,\s*"\\x80\\x1A\\x06\\x00",\s*4\)/,
  },
];

const EXPECTED_SAFETY_PATTERNS = [
  {
    name: 'post-patch bitrate byte verification',
    regex: /Post-patch verification: enforce 400000 bps bytes at every bitrate patch site\./,
  },
  {
    name: 'ReadU32LE helper',
    regex: /auto ReadU32LE = \[\]\(uint32_t offset, uint32_t& value\) -> bool/,
  },
  {
    name: 'post-patch bitrate integer equality check',
    regex: /setBitrateValue != 400000 \|\| encoderInit1Value != 400000 \|\| encoderInit2Value != 400000/,
  },
  {
    name: 'partial read guard',
    regex: /if \(bytesRead != \(DWORD\)fileSize\.QuadPart\)/,
  },
  {
    name: 'partial write guard',
    regex: /if \(bytesWritten != \(DWORD\)fileSize\.QuadPart\)/,
  },
];

const README_EXPECTED_PATTERNS = [
  /80 1A 06 \(400kbps\)/,
  /80 1A 06 00 00/,
  /80 1A 06 00 \(400kbps default\)/,
  /\\x80\\x1A\\x06.*400kbps/,
];

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    failures.push(`Unable to read ${path.basename(filePath)}: ${error.message}`);
    return '';
  }
}

const patcher = safeRead(patcherPath);
const readme = safeRead(readmePath);
const indexJs = safeRead(indexPath);

check(/Bitrate\s*=\s*400;/.test(patcher), 'PowerShell config bitrate is not set to 400 kbps.');
check(/400000\s*=\s*0x61A80/.test(patcher), 'Patcher source comment no longer documents 400000 = 0x61A80.');

for (const expected of EXPECTED_PATCH_PATTERNS) {
  check(expected.regex.test(patcher), `Missing or incorrect patch bytes for ${expected.name}.`);
}
for (const expected of EXPECTED_SAFETY_PATTERNS) {
  check(expected.regex.test(patcher), `Missing runtime safety check: ${expected.name}.`);
}

check(!/\\x00\\xD0\\x07/.test(patcher), 'Incorrect 512 kbps byte pattern found in patcher source.');
check(!/\b00 D0 07\b/.test(readme), 'README still references 00 D0 07 (512 kbps) as 400 kbps.');
for (const expectedRegex of README_EXPECTED_PATTERNS) {
  check(expectedRegex.test(readme), `README is missing expected 400 kbps byte notation (${expectedRegex}).`);
}

check(/const FORCED_AUDIO_BITRATE = 400000;/.test(indexJs), 'index.js does not define FORCED_AUDIO_BITRATE = 400000.');
check(/encodingVoiceBitRate\s*=\s*FORCED_AUDIO_BITRATE/.test(indexJs), 'encodingVoiceBitRate is not force-set.');
check(/encodingVoiceBitrate\s*=\s*FORCED_AUDIO_BITRATE/.test(indexJs), 'encodingVoiceBitrate is not force-set.');
check(/const hasInlineValue = parts\.length > 1;/.test(indexJs), 'CLI parser regression: hasInlineValue guard not found.');
check(!/if \(options\.encodingVoiceBitrate\)/.test(indexJs), 'Conditional bitrate assignment reintroduced in index.js.');

if (failures.length > 0) {
  console.error('\n[FAIL] 400kbps verification failed:\n');
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log('[PASS] 400kbps verification passed.');
console.log(`       Target bitrate: ${BITRATE_BPS} bps (${BITRATE_HEX})`);
console.log(
  `       Checked ${EXPECTED_PATCH_PATTERNS.length} binary patch sites, `
  + `${EXPECTED_SAFETY_PATTERNS.length} runtime safety guards, docs, and JS transport patching.`,
);
