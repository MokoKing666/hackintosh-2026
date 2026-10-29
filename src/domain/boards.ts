import type { BoardRecord } from './types';

/**
 * 主板只记录与黑苹果相关的信息：芯片组、插槽、已知坑。
 * 不做「某块板一定可用」的承诺——同芯片组不同厂商的 ACPI 差异很大。
 */
export const BOARDS: readonly BoardRecord[] = [
  {
    id: 'board-z490',
    name: 'Z490（ATX，LGA1200）',
    chipset: 'Z490',
    socket: 'LGA1200',
    vendor: 'intel',
    note: '10 代最稳的一档，USB 与电源管理资料最多',
    evidenceIds: ['E-DORTANIA-TAHOE'],
  },
  {
    id: 'board-b460',
    name: 'B460 / H410（mATX，LGA1200）',
    chipset: 'B460',
    socket: 'LGA1200',
    vendor: 'intel',
    note: '够用，注意部分型号的 CFG Lock 无法关闭',
    evidenceIds: ['E-DORTANIA-TAHOE'],
  },
  {
    id: 'board-b660',
    name: 'B660 / H610（mATX，LGA1700）',
    chipset: 'B660',
    socket: 'LGA1700',
    vendor: 'intel',
    note: '12~14 代常用，需自行处理 CFG Lock 与 Resizable BAR',
    evidenceIds: ['E-DORTANIA-TAHOE'],
  },
  {
    id: 'board-z790',
    name: 'Z790（ATX，LGA1700）',
    chipset: 'Z790',
    socket: 'LGA1700',
    vendor: 'intel',
    note: 'BIOS 选项齐全，适合 13/14 代超频平台',
    evidenceIds: ['E-DORTANIA-TAHOE'],
  },
  {
    id: 'board-z890',
    name: 'Z890（ATX，LGA1851）',
    chipset: 'Z890',
    socket: 'LGA1851',
    vendor: 'intel',
    note: 'Core Ultra 200S 专用，黑苹果案例极少',
    evidenceIds: ['E-XEGFX'],
  },
  {
    id: 'board-b550',
    name: 'B550（mATX，AM4）',
    chipset: 'B550',
    socket: 'AM4',
    vendor: 'amd',
    note: 'Zen3 主力，MSI 部分型号需 IOPCIFamily 补丁',
    evidenceIds: ['E-AMD-VANILLA'],
  },
  {
    id: 'board-b650',
    name: 'B650（mATX，AM5）',
    chipset: 'B650',
    socket: 'AM5',
    vendor: 'amd',
    note: 'Zen4 入门，DDR5 内存兼容性需实测',
    evidenceIds: ['E-AMD-VANILLA'],
  },
  {
    id: 'board-x670e',
    name: 'X670E（ATX，AM5）',
    chipset: 'X670E',
    socket: 'AM5',
    vendor: 'amd',
    note: '通道多，但 USB 控制器多也意味着端口映射更麻烦',
    evidenceIds: ['E-AMD-VANILLA'],
  },
  {
    id: 'board-trx40',
    name: 'TRX40（ATX，sTRX4）',
    chipset: 'TRX40',
    socket: 'sTRX4',
    vendor: 'amd',
    note: '线程撕裂者平台，可关 PAT patch 提升 GPU 性能',
    evidenceIds: ['E-AMD-VANILLA'],
  },
  {
    id: 'board-arm',
    name: '整机（ARM 无主板可选）',
    chipset: 'SoC',
    socket: 'SoC',
    vendor: 'arm',
    note: 'ARM 方案的机型由项目锁定，不存在自行换板的可能',
    evidenceIds: ['E-SNAPINTOSH'],
  },
] as const;

export const BOARD_BY_ID = new Map(BOARDS.map((b) => [b.id, b]));
