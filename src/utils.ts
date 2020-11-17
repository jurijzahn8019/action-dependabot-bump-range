/* eslint-disable camelcase */
import { SemVer, coerce, diff, ReleaseType } from "semver";
import { promises as fs } from "fs";

const { readFile } = fs;
const matchPattern = /\w+\([\w-]+\):\s+bump\s+\S+\s+from\s+v?(?<from>[\d.]+)\s+to\s+v?(?<to>[\d.]+)/;

export function matchTitle(
  title: string
): { from: SemVer; to: SemVer } | undefined {
  const match = matchPattern.exec(title);
  if (match?.groups && match.groups.from && match.groups.to) {
    const res = {
      from: coerce(match.groups.from),
      to: coerce(match.groups.to),
    };
    return res.from && res.to ? { from: res.from, to: res.to } : undefined;
  }

  return undefined;
}

export function verDiff(from: SemVer, to: SemVer): ReleaseType | null {
  return diff(from, to);
}

export async function getEvent(): Promise<{
  pull_request?: { number?: number };
}> {
  return JSON.parse(
    await readFile(process.env.GITHUB_EVENT_PATH as string, "utf8")
  );
}
