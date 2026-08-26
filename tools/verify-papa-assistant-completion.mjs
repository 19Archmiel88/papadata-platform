import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const checklistFiles = [
  "docs/papa-assistant/papa-asystent-kontekst-produktowy.md",
  "docs/spec/papa-assistant-completion-checklist.md",
].filter((file) => fs.existsSync(path.join(root, file)));

const requiredTermsInChecklist = [
  "Papa Asystent",
  "Laboratorium",
  "AssistantShell",
  "EvidencePanel",
  "ContextBasket",
  "ArtifactRegion",
  "DecisionQueue",
  "ReportJob",
  "AIRefusal",
  "AI Action",
  "approval",
  "revalidation",
  "audit",
  "recovery",
];

const requiredStoryTitles = [
  "40 Laboratorium Papa Asystenta/AssistantShell",
  "40 Laboratorium Papa Asystenta/InlineAssistant",
  "40 Laboratorium Papa Asystenta/ContextBasket",
  "40 Laboratorium Papa Asystenta/EvidencePanel",
  "40 Laboratorium Papa Asystenta/ArtifactTable",
  "40 Laboratorium Papa Asystenta/Recommendation",
  "40 Laboratorium Papa Asystenta/DecisionQueue",
  "90 Przepływy/AssistantContext",
  "90 Przepływy/ReportJob",
  "90 Przepływy/AIRefusal",
];

const forbiddenPatterns = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\bplaceholder\b/i,
  /\bmock only\b/i,
  /\bcoming soon\b/i,
  /\bnot implemented\b/i,
  /\bstub\b/i,
  /\bBLOCKED\b/i,
];

const scannedDirs = [
  "apps/web/src/features/papa-assistant",
  "apps/web/src/storybook-next/stories/40-papa-assistant",
  "apps/web/src/storybook-next/stories/90-papa-assistant-flows",
];

const requiredSourceFiles = [
  "apps/web/src/features/papa-assistant/assistantTypes.ts",
  "apps/web/src/features/papa-assistant/papaAssistantData.ts",
  "apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx",
  "apps/web/src/features/papa-assistant/papa-assistant-experience.css",
  "apps/web/src/features/papa-assistant/papaAssistantModel.test.ts",
  "apps/web/src/features/papa-assistant/index.ts",
  "apps/web/src/screens/papa/PapaScreen.tsx",
  "apps/web/src/shell/app-shell/shellData.ts",
  "apps/web/src/shell/app-shell/shellRuntime.ts",
];

const requiredComponents = [
  "AssistantShell",
  "ContextSummary",
  "ModeSwitcher",
  "Conversation",
  "ToolActivity",
  "EvidencePanel",
  "ArtifactRegion",
  "Composer",
  "OperationStatus",
  "InlineAssistant",
  "ContextBasket",
  "Recommendation",
  "DecisionQueue",
  "ReportJob",
  "AIRefusal",
  "ArtifactTable",
];

const requiredModelTerms = [
  "quickBrief",
  "interpretation",
  "diagnosis",
  "decision",
  "report",
  "actionPlan",
  "ready",
  "partial",
  "stale",
  "restricted",
  "empty",
  "error",
  "no access",
  "wysoka",
  "ograniczona",
  "niewystarczająca",
  "queued",
  "generating",
  "expired",
  "proposed",
  "needsReview",
  "approved",
  "rejected",
  "deferred",
  "invalidated",
  "executing",
  "succeeded",
  "failed",
  "partiallySucceeded",
  "compensated",
  "insufficient_evidence",
  "insufficient_data",
  "out_of_scope",
  "missing_capability",
  "prompt_injection_detected",
  "forbidden_operation",
  "cost_or_limit_exceeded",
  "approval_required",
  "approval",
  "revalidation",
  "audit",
  "recovery",
  "MCP",
  "PDF",
  "CSV",
  "Odpowiada Papa Asystent AI",
  "Rekomendacja wygenerowana przez AI",
  "Raport wygenerowany przez Papa Asystenta AI",
];

let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(fullPath(relativePath), "utf8");
}

function walk(relativeDir) {
  const absolute = fullPath(relativeDir);

  if (!fs.existsSync(absolute)) {
    return [];
  }

  const entries = fs.readdirSync(absolute, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const current = path.join(absolute, entry.name);
    const relative = path.relative(root, current);

    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist" ||
      entry.name === "storybook-static" ||
      entry.name === ".runtime" ||
      entry.name === "coverage"
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...walk(relative));
      continue;
    }

    if (/\.(ts|tsx|js|jsx|md|mdx|mjs|json|css)$/.test(entry.name)) {
      files.push(relative);
    }
  }

  return files;
}

function isHeadingCheckbox(line) {
  return /^\s*(?:\*\*)?\s*#{1,6}\s*\[[ xX]\]\s+/.test(line);
}

function isUncheckedHeadingCheckbox(line) {
  return /^\s*(?:\*\*)?\s*#{1,6}\s*\[\s\]\s+/.test(line);
}

function isCheckedHeadingCheckbox(line) {
  return /^\s*(?:\*\*)?\s*#{1,6}\s*\[[xX]\]\s+/.test(line);
}

if (checklistFiles.length === 0) {
  fail("Brakuje docs/papa-assistant/papa-asystent-kontekst-produktowy.md albo docs/spec/papa-assistant-completion-checklist.md");
}

let checklistText = "";

for (const file of checklistFiles) {
  const content = read(file);
  checklistText += `\n\n${content}`;
  const lines = content.split(/\r?\n/);

  const trackedCheckboxes = lines
    .map((line, index) => ({ line, index: index + 1 }))
    .filter(({ line }) => isHeadingCheckbox(line));

  if (trackedCheckboxes.length === 0) {
    pass(`${file}: brak heading-checkboxów Papa Asystenta do sprawdzania`);
    continue;
  }

  const unchecked = trackedCheckboxes.filter(({ line }) =>
    isUncheckedHeadingCheckbox(line),
  );

  if (unchecked.length > 0) {
    for (const item of unchecked) {
      fail(`${file}:${item.index} niezakończony punkt: ${item.line.trim()}`);
    }
  } else {
    pass(`${file}: wszystkie heading-checkboxy mają [x]`);
  }

  const checked = trackedCheckboxes.filter(({ line }) =>
    isCheckedHeadingCheckbox(line),
  );

  for (const item of checked) {
    const block = [];

    for (let i = item.index; i < lines.length; i += 1) {
      if (i !== item.index && isHeadingCheckbox(lines[i])) {
        break;
      }

      block.push(lines[i]);
    }

    const blockText = block.join("\n");

    if (!/Evidence:/i.test(blockText)) {
      fail(`${file}:${item.index} punkt [x] bez Evidence`);
    }

    if (!/Test:|Verification:/i.test(blockText)) {
      fail(`${file}:${item.index} punkt [x] bez Test/Verification`);
    }
  }
}

for (const term of requiredTermsInChecklist) {
  if (!checklistText.includes(term)) {
    fail(`Checklist/AGENTS nie zawiera wymaganego terminu: ${term}`);
  }
}

const allScannedFiles = scannedDirs.flatMap(walk);

for (const file of requiredSourceFiles) {
  if (!fs.existsSync(fullPath(file))) {
    fail(`Brakuje wymaganego pliku implementacji: ${file}`);
  } else {
    pass(`Plik implementacji istnieje: ${file}`);
  }
}

const assistantFiles = Array.from(new Set([
  ...allScannedFiles,
  ...requiredSourceFiles,
]));

const assistantSourceText = assistantFiles.map(read).join("\n\n");

for (const component of requiredComponents) {
  const componentPattern = new RegExp(`export function ${component}\\b`);
  if (!componentPattern.test(assistantSourceText)) {
    fail(`Brakuje eksportowanego komponentu: ${component}`);
  } else {
    pass(`Komponent istnieje: ${component}`);
  }
}

for (const term of requiredModelTerms) {
  if (!assistantSourceText.includes(term)) {
    fail(`Implementacja Papa Asystenta nie zawiera wymaganego terminu/stanu: ${term}`);
  }
}

for (const file of assistantFiles) {
  const content = read(file);

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      fail(`${file}: znaleziono zakazany placeholder/fallback: ${pattern}`);
    }
  }
}

const storyFiles = allScannedFiles.filter((file) =>
  /\.(stories|story)\.(ts|tsx|js|jsx|mdx)$/.test(file),
);

const storyText = storyFiles.map(read).join("\n\n");

for (const title of requiredStoryTitles) {
  if (!storyText.includes(title)) {
    fail(`Brakuje Storybook story: ${title}`);
  } else {
    pass(`Storybook story istnieje: ${title}`);
  }
}

if (failed) {
  console.error("\nPapa Asystent completion gate: RED");
  process.exit(1);
}

console.log("\nPapa Asystent completion gate: GREEN");
process.exit(0);
