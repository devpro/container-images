/**
 * Data service — single place to swap the source.
 *
 * Right now: reads from data/dashboard.yaml at build/request time.
 * To switch to a DB later, replace the body of each function with
 * your DB query (Prisma, Drizzle, raw fetch, etc.) while keeping
 * the return types identical.
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// ── Types (shared with the UI) ────────────────────────────────────────────────

export type AccentColor = "blue" | "green" | "red" | "purple";
export type ServiceStatus = "operational" | "degraded" | "down";
export type ActivityType = "ok" | "info" | "warn" | "error";

export interface Metric {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  accent: AccentColor;
}

export interface Service {
  name: string;
  status: ServiceStatus;
  uptime: string;
  latency: string;
}

export interface Activity {
  time: string;
  event: string;
  type: ActivityType;
}

export interface RequestVolume {
  hours: number[];
  peak: string;
  avg: string;
}

export interface DashboardData {
  metrics: Metric[];
  services: Service[];
  activity: Activity[];
  requestVolume: RequestVolume;
}

// ── YAML loader (server-only) ─────────────────────────────────────────────────

function loadYaml(): DashboardData {
  const filePath = path.join(process.cwd(), "data", "dashboard.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  return yaml.load(raw) as DashboardData;
}

// ── Public API ────────────────────────────────────────────────────────────────
// Each function is async so swapping to `await db.query(...)` is a one-liner.

export async function getMetrics(): Promise<Metric[]> {
  return loadYaml().metrics;
}

export async function getServices(): Promise<Service[]> {
  return loadYaml().services;
}

export async function getActivity(): Promise<Activity[]> {
  return loadYaml().activity;
}

export async function getRequestVolume(): Promise<RequestVolume> {
  return loadYaml().requestVolume;
}

/** Convenience: fetch everything in one shot. */
export async function getDashboardData(): Promise<DashboardData> {
  return loadYaml();
}
