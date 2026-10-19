import type { Status } from '../constants/theme';

const MS_DAY = 24 * 60 * 60 * 1000;

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_DAY);
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export type FilterState = {
  due: Date;
  daysLeft: number; // ঋণাত্মক হলে মেয়াদ শেষ
  totalDays: number;
  usedPercent: number;
  remaining: number; // ০–১, বারে কতটা জ্বলবে
  status: Status;
};

export function getFilterState(installedISO: string, months: number, now = new Date()): FilterState {
  const installed = new Date(installedISO);
  const due = addMonths(installed, months);
  const daysLeft = daysBetween(now, due);
  const totalDays = Math.max(1, daysBetween(installed, due));
  const used = Math.min(100, Math.max(0, Math.round(((totalDays - daysLeft) / totalDays) * 100)));

  let status: Status = 'ok';
  if (daysLeft < 0) status = 'expired';
  else if (daysLeft <= 30) status = 'soon';

  // মেয়াদ শেষ হলেও একটা লাল দাগ জ্বলে থাকে
  const remaining = status === 'expired' ? 0.04 : Math.max(0.04, daysLeft / totalDays);

  return { due, daysLeft, totalDays, usedPercent: used, remaining, status };
}
