import type { HardwareCategory, PlatformId } from './types';

export const CATEGORY_LABEL: Record<HardwareCategory, string> = {
  cpu: 'CPU',
  igpu: '核显',
  dgpu: '独显',
  apu: 'APU',
  wifi: '无线',
  ethernet: '有线',
  audio: '音频',
  storage: '存储',
  arm: 'ARM',
  bootloader: '引导器',
  system: '系统',
};

export const PLATFORM_LABEL: Record<PlatformId, string> = {
  intel: 'Intel',
  amd: 'AMD',
  nvidia: 'NVIDIA',
  broadcom: 'Broadcom',
  'intel-wifi': 'Intel 无线',
  realtek: 'Realtek',
  mediatek: 'MediaTek',
  qualcomm: 'Qualcomm',
  rockchip: 'Rockchip',
  arm: 'ARM',
  system: '系统',
};

export const FEATURE_LABEL: Record<string, string> = {
  boot: '引导',
  display: '显示',
  metal: 'Metal',
  hwDecode: '硬解',
  sleep: '睡眠',
  wifi: '无线',
  airdrop: 'AirDrop',
  audio: '音频',
  iservices: 'iServices',
};

export const FEATURE_STATE_LABEL: Record<string, string> = {
  yes: '可用',
  partial: '部分',
  no: '不可用',
  unknown: '未知',
};
