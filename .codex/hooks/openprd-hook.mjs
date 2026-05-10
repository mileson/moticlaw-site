/* OPENPRD:GENERATED
adapter=codex
source=codex-hooks
version=0.1.0
checksum=922a3ec702862c11
*/

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const eventName = process.argv[2] || 'Unknown';
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload = {};
  try { payload = input.trim() ? JSON.parse(input) : {}; } catch {}
  const cwd = payload.cwd || process.cwd();
  const result = handle(eventName, cwd, payload);
  if (result) {
    process.stdout.write(JSON.stringify(result));
  }
});

function now() {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function findProjectRoot(start) {
  let current = path.resolve(start || process.cwd());
  for (;;) {
    if (fs.existsSync(path.join(current, '.openprd'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return path.resolve(start || process.cwd());
    }
    current = parent;
  }
}

function harnessDir(root) {
  return path.join(root, '.openprd', 'harness');
}

function ensureHarness(root) {
  const dir = harnessDir(root);
  fs.mkdirSync(dir, { recursive: true });
  const statePath = path.join(dir, 'hook-state.json');
  if (!fs.existsSync(statePath)) {
    writeJsonSync(statePath, {
      version: 1,
      active: true,
      lastEventAt: null,
      lastFingerprint: null,
      counters: {},
      recentFingerprints: {},
      suppressions: { inputLock: false },
    });
  }
  const eventsPath = path.join(dir, 'events.jsonl');
  if (!fs.existsSync(eventsPath)) {
    fs.writeFileSync(eventsPath, '');
  }
}

function readJsonSync(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonSync(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function appendEvent(root, event) {
  ensureHarness(root);
  fs.appendFileSync(path.join(harnessDir(root), 'events.jsonl'), JSON.stringify({ at: now(), ...event }) + '\n');
}

function updateHookState(root, event) {
  ensureHarness(root);
  const statePath = path.join(harnessDir(root), 'hook-state.json');
  const state = readJsonSync(statePath, {
    version: 1,
    counters: {},
    recentFingerprints: {},
    suppressions: { inputLock: false },
  });
  state.lastEventAt = now();
  state.lastEvent = event.eventName;
  state.lastFingerprint = event.fingerprint;
  state.counters[event.eventName] = (state.counters[event.eventName] || 0) + 1;
  state.recentFingerprints = state.recentFingerprints || {};
  if (event.fingerprint) {
    state.recentFingerprints[event.fingerprint] = Date.now();
  }
  for (const [fingerprint, seenAt] of Object.entries(state.recentFingerprints)) {
    if (Date.now() - Number(seenAt) > 300000) {
      delete state.recentFingerprints[fingerprint];
    }
  }
  writeJsonSync(statePath, state);
  return state;
}

function isDuplicate(root, fingerprint, windowMs = 15000) {
  const state = readJsonSync(path.join(harnessDir(root), 'hook-state.json'), {});
  const seenAt = state?.recentFingerprints?.[fingerprint];
  return Boolean(seenAt && Date.now() - Number(seenAt) < windowMs);
}

function fingerprintFor(eventName, payload, risk) {
  const tool = payload.tool_name || payload.toolName || payload.name || '';
  const inputText = JSON.stringify(payload.tool_input || payload.toolInput || payload.input || payload || {}).slice(0, 2000);
  return crypto.createHash('sha256').update(JSON.stringify({ eventName, tool, inputText, risk: risk.level })).digest('hex').slice(0, 16);
}

function payloadText(payload) {
  return JSON.stringify(payload.tool_input || payload.toolInput || payload.input || payload || {});
}

function preview(text, max = 600) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function runOpenPrd(args, cwd) {
  const command = process.env.OPENPRD_CLI || 'openprd';
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 15000,
    env: process.env,
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function recordRunHook(cwd, baseEvent, outcome) {
  const args = [
    'run',
    '.',
    '--record-hook',
    '--event',
    baseEvent.eventName,
    '--risk',
    baseEvent.risk.level,
    '--outcome',
    outcome,
  ];
  if (baseEvent.preview) {
    args.push('--preview', baseEvent.preview.slice(0, 300));
  }
  runOpenPrd(args, cwd);
}

function contextMessage(cwd) {
  const run = runOpenPrd(['run', '.', '--context'], cwd);
  if (run.ok) {
    return [
      run.stdout,
      'OpenPrd context is advisory, not an automatic instruction. First classify the current user intent.',
      'If the user asks to look, plan, analyze, review, explain impact, or list files, stay read-only and answer from evidence; do not run OpenPrd loop, task advance, discovery advance, commits, or other mutating commands.',
      'Only run execution commands such as openprd loop --run, openprd tasks --advance, openprd discovery --advance, or commit/push when the current user message explicitly asks to develop, implement, fix, continue a task, deeply research/benchmark, replicate, or commit.',
      'Before claiming implementation readiness, run openprd standards . --verify and openprd run . --verify.',
    ].filter(Boolean).join('\n');
  }
  const status = runOpenPrd(['status', '.'], cwd);
  const next = runOpenPrd(['next', '.'], cwd);
  if (!status.ok && !next.ok) {
    return 'OpenPrd harness is installed, but this turn could not read workspace state. Run openprd doctor . before claiming readiness.';
  }
  return [
    'OpenPrd harness context:',
    status.ok ? status.stdout : '',
    next.ok ? next.stdout : '',
    'Treat OpenPrd next action as advisory. Stay read-only for planning/analysis/review requests; execute only when the current user message explicitly asks for development, deep research/benchmarking, or task continuation.',
    'Verify docs/basic standards before readiness.',
  ].filter(Boolean).join('\n');
}

function shouldInjectOpenPrdContext(payload) {
  const prompt = String(payload.prompt || payload.user_prompt || payload.message || '');
  if (!prompt.trim()) {
    return false;
  }
  const normalized = prompt.toLowerCase();
  const triggers = [
    /openprd/i,
    /opens*prd/i,
    /\bprd\b/i,
    /openprd\s+(run|loop|fleet|doctor|standards|change|discovery|handoff|freeze)/i,
    /\b(fleet|standards)\b/i,
    /深度调研/,
    /深度对标/,
    /持续调研/,
    /复刻/,
    /对标/,
    /文件说明书/,
    /文件夹说明书/,
    /基础文档/,
    /docs\/basic/i,
    /standards/i,
    /handoff/i,
    /freeze/i,
  ];
  return triggers.some((pattern) => pattern.test(normalized));
}

function classifyRisk(payload) {
  const text = payloadText(payload);
  const normalized = text.toLowerCase();
  const highPatterns = [
    /git\s+push/,
    /git\s+commit/,
    /npm\s+publish/,
    /pnpm\s+publish/,
    /yarn\s+npm\s+publish/,
    /gh\s+release/,
    /rm\s+-rf/,
    /openprd\s+freeze\b/,
    /openprd\s+handoff\b/,
    /openprd\s+change\s+.*--apply/,
    /openprd\s+change\s+.*--archive/,
  ];
  const mediumPatterns = [
    /apply_patch/,
    /npm\s+install/,
    /npm\s+i\s/,
    /pnpm\s+add/,
    /yarn\s+add/,
    /bun\s+add/,
    /openprd\s+setup\b/,
    /openprd\s+update\b/,
    /openprd\s+standards\s+.*--init/,
    /openprd\s+change\s+.*--generate/,
    /openprd\s+tasks\s+.*--advance/,
    /openprd\s+discovery\s+.*--advance/,
    /openprd\s+(capture|classify|synthesize|diagram)\b/,
  ];
  if (highPatterns.some((pattern) => pattern.test(normalized))) {
    return { level: 'high', reason: 'release, history, freeze, handoff, destructive, or accepted-change action' };
  }
  if (mediumPatterns.some((pattern) => pattern.test(normalized))) {
    return { level: 'medium', reason: 'workspace mutation or dependency/configuration change' };
  }
  return { level: 'low', reason: 'read-only or local exploratory action' };
}

function extractChangeId(text) {
  const match = String(text || '').match(/--change\s+([a-zA-Z0-9._-]+)/);
  return match ? match[1] : null;
}

function runGateChecks(cwd, payload, risk) {
  const checks = [];
  const run = runOpenPrd(['run', '.', '--verify'], cwd);
  checks.push({ name: 'run-verify', ok: run.ok, output: run.stdout || run.stderr });
  const text = payloadText(payload);
  const changeId = extractChangeId(text);
  if (changeId && /openprd\s+change\s+.*--(apply|archive|validate)/i.test(text)) {
    const change = runOpenPrd(['change', '.', '--validate', '--change', changeId], cwd);
    checks.push({ name: 'change-validate', ok: change.ok, output: change.stdout || change.stderr });
  }
  return {
    ok: checks.every((check) => check.ok),
    checks,
    summary: checks.map((check) => `${check.name}: ${check.ok ? 'ok' : 'failed'}`).join(', '),
  };
}

function hookSuppressed(root) {
  const state = readJsonSync(path.join(harnessDir(root), 'hook-state.json'), {});
  const lockPath = path.join(harnessDir(root), 'input-lock.json');
  const lock = readJsonSync(lockPath, null);
  return Boolean(state?.suppressions?.inputLock || (lock && lock.active));
}

function allowHook(additionalContext = null, outputEventName = eventName) {
  const result = { continue: true };
  if (additionalContext) {
    result.hookSpecificOutput = {
      hookEventName: outputEventName,
      additionalContext,
    };
  }
  return result;
}

function blockHook(reason) {
  return {
    decision: 'block',
    reason,
    systemMessage: reason,
  };
}

function handle(eventName, cwd, payload) {
  const root = findProjectRoot(cwd);
  ensureHarness(root);
  const risk = classifyRisk(payload);
  const fingerprint = fingerprintFor(eventName, payload, risk);
  const duplicate = isDuplicate(root, fingerprint);
  const baseEvent = {
    eventName,
    risk,
    fingerprint,
    duplicate,
    preview: preview(payloadText(payload)),
  };

  if (eventName === 'SessionStart') {
    return allowHook();
  }

  if (eventName === 'UserPromptSubmit') {
    if (duplicate) {
      return allowHook();
    }
    if (!shouldInjectOpenPrdContext(payload)) {
      return allowHook();
    }
    const result = allowHook(contextMessage(root));
    appendEvent(root, { ...baseEvent, outcome: 'context-injected' });
    recordRunHook(root, baseEvent, 'context-injected');
    updateHookState(root, baseEvent);
    return result;
  }

  if (eventName === 'PreToolUse') {
    if (risk.level === 'high') {
      const gates = runGateChecks(root, payload, risk);
      appendEvent(root, { ...baseEvent, gates, outcome: gates.ok ? 'allowed-high-risk' : 'blocked-high-risk' });
      recordRunHook(root, baseEvent, gates.ok ? 'allowed-high-risk' : 'blocked-high-risk');
      updateHookState(root, baseEvent);
      if (!gates.ok) {
        return blockHook([
          'OpenPrd blocked a high-risk action because a harness gate failed.',
          gates.summary,
          ...gates.checks.filter((check) => !check.ok).map((check) => check.output).filter(Boolean),
          'Run openprd run . --context and openprd doctor .; repair the failed gate, then retry.',
        ].filter(Boolean).join('\n'));
      }
      return allowHook(`OpenPrd high-risk gate passed: ${gates.summary}.`);
    }
    if (risk.level === 'medium') {
      appendEvent(root, { ...baseEvent, outcome: 'allowed-medium-risk' });
      recordRunHook(root, baseEvent, 'allowed-medium-risk');
      updateHookState(root, baseEvent);
      return allowHook('OpenPrd detected a mutating action. Keep docs/basic, file manuals, folder README docs, and relevant OpenPrd change/task state synchronized before claiming readiness.');
    }
    return allowHook();
  }

  if (eventName === 'PostToolUse') {
    const text = payloadText(payload);
    const failed = /command not found|no such file|permission denied|failed|error|exception/i.test(text);
    if (!failed) {
      return allowHook();
    }
    appendEvent(root, { ...baseEvent, outcome: failed ? 'tool-failure-detected' : 'tool-complete' });
    recordRunHook(root, baseEvent, failed ? 'tool-failure-detected' : 'tool-complete');
    updateHookState(root, baseEvent);
    if (failed && !duplicate) {
      return allowHook('A tool command appears to have failed. Use openprd doctor ., openprd next ., and the relevant verification command to choose the repair path.');
    }
    return allowHook();
  }

  if (eventName === 'Stop') {
    appendEvent(root, { ...baseEvent, outcome: 'stop-check' });
    recordRunHook(root, baseEvent, 'stop-check');
    updateHookState(root, baseEvent);
    if (hookSuppressed(root)) {
      return allowHook();
    }
    const run = runOpenPrd(['run', '.', '--context', '--json'], root);
    if (run.ok) {
      try {
        const parsed = JSON.parse(run.stdout);
        const command = parsed?.recommendation?.command || '';
        if (command && !/openprd\s+next\s+\./.test(command)) {
          return {
            continue: true,
            systemMessage: `OpenPrd still has a hook-driven next action:\n${parsed.recommendation.title}\nSuggested command: ${command}`,
          };
        }
      } catch {}
    }
  }

  appendEvent(root, { ...baseEvent, outcome: 'noop' });
  recordRunHook(root, baseEvent, 'noop');
  updateHookState(root, baseEvent);
return allowHook();
}
