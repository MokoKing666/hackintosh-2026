import { z } from 'zod';
import { EVIDENCE } from './evidence';
import { HARDWARE } from './hardware';
import { PROJECTS, DEAD_PROJECTS } from './projects';
import { CLAIMS, CORRECTIONS } from './claims';
import { ARM_ROUTES, TIMELINE } from './arm';

const verdict = z.enum([
  'verified',
  'conditional',
  'experimental',
  'unverified',
  'incompatible',
  'unknown',
]);
const osVersion = z.enum(['10.13', '11', '12', '13', '14', '15', '15.2', '26', '26.7', '27']);
const evidenceId = z.string().regex(/^E-[A-Z0-9-]+$/);
const claimId = z.string().regex(/^C-\d{3}$/);

const osRange = z.object({
  min: osVersion.optional(),
  max: osVersion.optional(),
  beta: z.boolean().optional(),
  note: z.string().optional(),
});

const requirement = z.object({
  text: z.string().min(1),
  evidenceIds: z.array(evidenceId).min(1),
});

const feature = z.enum(['yes', 'partial', 'no', 'unknown']);

export const hardwareSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(1),
  vendor: z.enum([
    'intel',
    'amd',
    'nvidia',
    'broadcom',
    'intel-wifi',
    'realtek',
    'mediatek',
    'qualcomm',
    'rockchip',
    'arm',
    'system',
  ]),
  category: z.enum([
    'cpu',
    'igpu',
    'dgpu',
    'apu',
    'wifi',
    'ethernet',
    'audio',
    'storage',
    'arm',
    'bootloader',
    'system',
  ]),
  platform: z.enum([
    'intel',
    'amd',
    'nvidia',
    'broadcom',
    'intel-wifi',
    'realtek',
    'mediatek',
    'qualcomm',
    'rockchip',
    'arm',
    'system',
  ]),
  verdict,
  os: osRange,
  summary: z.string().min(4),
  requirements: z.array(requirement),
  limitations: z.array(requirement),
  features: z.record(z.string(), feature),
  evidenceIds: z.array(evidenceId).min(1),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const projectSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(1),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  url: z.string().url(),
  category: z.enum([
    'bootloader',
    'kext',
    'gpu',
    'wireless',
    'peripheral',
    'toolchain',
    'amd',
    'arm',
    'community',
    'virtualization',
  ]),
  description: z.string().min(2),
  stars: z.number().int().nonnegative(),
  pushedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'slow', 'stale', 'dead']),
  codeOpen: z.enum(['full', 'partial', 'none']),
  reproducibility: z.enum(['verified', 'single-report', 'demo-only', 'unknown']),
  createdYear: z.number().int().min(2000).max(2030),
  evidenceIds: z.array(evidenceId).min(1),
});

export const claimSchema = z.object({
  id: claimId,
  statement: z.string().min(8),
  scope: z.string().min(2),
  evidenceIds: z.array(evidenceId).min(1),
  needsVerification: z.boolean(),
});

const KNOWN_EVIDENCE = new Set(EVIDENCE.map((e) => e.id));

function assertEvidence(ids: readonly string[], where: string): void {
  for (const id of ids) {
    if (!KNOWN_EVIDENCE.has(id)) throw new Error(`${where} 引用了不存在的证据 ${id}`);
  }
}

/**
 * 运行时数据校验：在应用启动时执行一次。
 * 目的不是替代测试，而是让「数据写错」在开发阶段立刻炸出来，而不是渲染出空表格。
 */
export function validateDomain(): void {
  const problems: string[] = [];

  HARDWARE.forEach((h, i) => {
    const r = hardwareSchema.safeParse(h);
    if (!r.success)
      problems.push(`HARDWARE[${i}] ${h.id}: ${r.error.issues[0]?.message ?? 'invalid'}`);
    try {
      assertEvidence(h.evidenceIds, `HARDWARE ${h.id}`);
      h.requirements.forEach((q) => assertEvidence(q.evidenceIds, `HARDWARE ${h.id} requirement`));
      h.limitations.forEach((q) => assertEvidence(q.evidenceIds, `HARDWARE ${h.id} limitation`));
    } catch (err) {
      problems.push((err as Error).message);
    }
  });

  PROJECTS.forEach((p, i) => {
    const r = projectSchema.safeParse(p);
    if (!r.success)
      problems.push(`PROJECTS[${i}] ${p.id}: ${r.error.issues[0]?.message ?? 'invalid'}`);
    try {
      assertEvidence(p.evidenceIds, `PROJECTS ${p.repo}`);
    } catch (err) {
      problems.push((err as Error).message);
    }
  });

  CLAIMS.forEach((c, i) => {
    const r = claimSchema.safeParse(c);
    if (!r.success)
      problems.push(`CLAIMS[${i}] ${c.id}: ${r.error.issues[0]?.message ?? 'invalid'}`);
    try {
      assertEvidence(c.evidenceIds, `CLAIMS ${c.id}`);
    } catch (err) {
      problems.push((err as Error).message);
    }
  });

  CORRECTIONS.forEach((x) => assertEvidence(x.evidenceIds, `CORRECTIONS ${x.id}`));
  DEAD_PROJECTS.forEach((d) => assertEvidence(d.evidenceIds, `DEAD ${d.id}`));
  ARM_ROUTES.forEach((a) => assertEvidence(a.evidenceIds, `ARM ${a.id}`));
  TIMELINE.forEach((t) => assertEvidence(t.evidenceIds, `TIMELINE ${t.id}`));

  const ids = new Set(HARDWARE.map((h) => h.id));
  if (ids.size !== HARDWARE.length) problems.push('HARDWARE 存在重复 id');
  const pids = new Set(PROJECTS.map((p) => p.id));
  if (pids.size !== PROJECTS.length) problems.push('PROJECTS 存在重复 id');

  if (problems.length) {
    throw new Error(
      `领域数据校验失败（${problems.length} 处）：\n${problems.slice(0, 12).join('\n')}`,
    );
  }
}
