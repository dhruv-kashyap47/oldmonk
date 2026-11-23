import { TOOL_CATEGORIES, type ToolCategory, type ToolMeta } from "./types";
import { meta as jsonFormatter } from "./json-formatter/meta";
import { meta as jsonValidator } from "./json-validator/meta";
import { meta as jsonMinifier } from "./json-minifier/meta";
import { meta as regexTester } from "./regex-tester/meta";
import { meta as jwtDecoder } from "./jwt-decoder/meta";
import { meta as base64 } from "./base64/meta";
import { meta as urlEncoder } from "./url-encoder/meta";
import { meta as uuidGenerator } from "./uuid-generator/meta";
import { meta as timestampConverter } from "./timestamp-converter/meta";
import { meta as diffChecker } from "./diff-checker/meta";
import { meta as fancyText } from "./fancy-text-generator/meta";
import { meta as cursiveText } from "./cursive-text-generator/meta";
import { meta as symbols } from "./symbols/meta";
import { meta as instagramFonts } from "./instagram-fonts/meta";
import { meta as randomNumber } from "./random-number-generator/meta";
import { meta as randomNamePicker } from "./random-name-picker/meta";
import { meta as spinWheel } from "./spin-wheel/meta";
import { meta as diceRoller } from "./dice-roller/meta";
import { meta as pomodoroTimer } from "./pomodoro-timer/meta";
import { meta as countdownTimer } from "./countdown-timer/meta";
import { meta as typingSpeed } from "./typing-speed-test/meta";
import { meta as reactionTime } from "./reaction-time-test/meta";
import { meta as memoryTest } from "./memory-test/meta";
import { meta as clickSpeed } from "./click-speed-test/meta";

/**
 * Registry of shipped tools, in curated catalog order.
 *
 * Entries are added only when the tool works and has real content, so a route
 * in this array always resolves. Planned tools live in Plan.md and Task.md
 * until then; nothing here may point at an unbuilt page.
 */
export const tools: readonly ToolMeta[] = [
  jsonFormatter,
  jsonValidator,
  jsonMinifier,
  regexTester,
  jwtDecoder,
  base64,
  urlEncoder,
  uuidGenerator,
  timestampConverter,
  diffChecker,
  fancyText,
  cursiveText,
  symbols,
  instagramFonts,
  randomNumber,
  randomNamePicker,
  spinWheel,
  diceRoller,
  pomodoroTimer,
  countdownTimer,
  typingSpeed,
  reactionTime,
  memoryTest,
  clickSpeed,
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const COPY_LIMITS = {
  /** SEO title without the brand suffix, leaves room for " | oldmonk". */
  title: { min: 1, max: 50 },
  /** Meta description, Plan.md §5.7. */
  description: { min: 120, max: 165 },
  /** One-line catalog copy. */
  summary: { min: 1, max: 120 },
} as const;

export interface RegistryIssue {
  readonly slug: string;
  readonly message: string;
}

function isToolCategory(value: string): value is ToolCategory {
  return (TOOL_CATEGORIES as readonly string[]).includes(value);
}

function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function checkLength(
  issues: RegistryIssue[],
  slug: string,
  field: keyof typeof COPY_LIMITS,
  value: string,
): void {
  const { min, max } = COPY_LIMITS[field];
  if (value !== value.trim()) {
    issues.push({ slug, message: `${field} must not have leading or trailing whitespace.` });
  }
  if (value.length < min || value.length > max) {
    issues.push({
      slug,
      message: `${field} must be ${min} to ${max} characters, got ${value.length}.`,
    });
  }
}

function checkList(
  issues: RegistryIssue[],
  slug: string,
  field: string,
  values: readonly string[],
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (value.length === 0) {
      issues.push({ slug, message: `${field} must not contain an empty entry.` });
    }
    if (seen.has(value)) {
      issues.push({ slug, message: `${field} contains "${value}" twice.` });
    }
    seen.add(value);
  }
}

/**
 * Structural validation for the registry. Related-slug resolution is checked
 * separately by `findMissingRelated` so the registry can grow one tool at a
 * time without failing the build.
 */
export function validateTools(entries: readonly ToolMeta[]): RegistryIssue[] {
  const issues: RegistryIssue[] = [];
  const seenSlugs = new Set<string>();

  for (const tool of entries) {
    const { slug } = tool;

    if (!SLUG_PATTERN.test(slug)) {
      issues.push({
        slug,
        message: "slug must be lowercase letters and digits, separated by single hyphens.",
      });
    }
    if (seenSlugs.has(slug)) {
      issues.push({ slug, message: "slug is used by more than one tool." });
    }
    seenSlugs.add(slug);

    if (!isToolCategory(tool.category)) {
      issues.push({ slug, message: `category "${tool.category}" is not a known category.` });
    }

    checkLength(issues, slug, "title", tool.title);
    checkLength(issues, slug, "description", tool.description);
    checkLength(issues, slug, "summary", tool.summary);

    checkList(issues, slug, "topics", tool.topics);
    checkList(issues, slug, "keywords", tool.keywords);
    checkList(issues, slug, "related", tool.related);

    if (tool.related.includes(slug)) {
      issues.push({ slug, message: "related must not include the tool itself." });
    }

    if (tool.specs) {
      const labels = new Set<string>();
      for (const spec of tool.specs) {
        if (spec.label.trim().length === 0 || spec.value.trim().length === 0) {
          issues.push({ slug, message: "specs must not contain an empty label or value." });
        }
        if (labels.has(spec.label)) {
          issues.push({ slug, message: `specs contains the label "${spec.label}" twice.` });
        }
        labels.add(spec.label);
      }
    }

    if (!isIsoDate(tool.added)) {
      issues.push({ slug, message: "added must be a real ISO date, YYYY-MM-DD." });
    }
    if (!isIsoDate(tool.updated)) {
      issues.push({ slug, message: "updated must be a real ISO date, YYYY-MM-DD." });
    }
    if (isIsoDate(tool.added) && isIsoDate(tool.updated) && tool.updated < tool.added) {
      issues.push({ slug, message: "updated must not be earlier than added." });
    }
  }

  return issues;
}

/** Related slugs that no shipped tool resolves. The build link check must see none. */
export function findMissingRelated(entries: readonly ToolMeta[]): RegistryIssue[] {
  const known = new Set(entries.map((tool) => tool.slug));
  const issues: RegistryIssue[] = [];
  for (const tool of entries) {
    for (const related of tool.related) {
      if (!known.has(related)) {
        issues.push({ slug: tool.slug, message: `related slug "${related}" does not exist.` });
      }
    }
  }
  return issues;
}

const issues = validateTools(tools);
if (issues.length > 0) {
  const detail = issues.map((issue) => `${issue.slug}: ${issue.message}`).join("\n");
  throw new Error(`Tool registry is invalid:\n${detail}`);
}

const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export function getTool(slug: string): ToolMeta | undefined {
  return toolBySlug.get(slug);
}

/**
 * Tools in one category, preserving the curated registry order. `entries`
 * defaults to the shipped registry and is injectable for tests.
 */
export function getToolsByCategory(
  category: ToolCategory,
  entries: readonly ToolMeta[] = tools,
): readonly ToolMeta[] {
  return entries.filter((tool) => tool.category === category);
}

/** Shipped tools that belong to a topic cluster, such as "json". */
export function getToolsByTopic(
  topic: string,
  entries: readonly ToolMeta[] = tools,
): readonly ToolMeta[] {
  return entries.filter((tool) => tool.topics.includes(topic));
}

export function countTools(category: ToolCategory, entries: readonly ToolMeta[] = tools): number {
  let count = 0;
  for (const tool of entries) {
    if (tool.category === category) count += 1;
  }
  return count;
}

/** Related tools that exist, in the order the meta lists them. */
export function resolveRelated(
  tool: ToolMeta,
  entries: readonly ToolMeta[] = tools,
): readonly ToolMeta[] {
  const resolved: ToolMeta[] = [];
  for (const slug of tool.related) {
    const related = entries.find((entry) => entry.slug === slug);
    if (related) resolved.push(related);
  }
  return resolved;
}