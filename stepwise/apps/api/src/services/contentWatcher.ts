import fs from "fs";
import path from "path";
import { CHALLENGES_ROOT, syncChallengeDirectory } from "@repo/db";

interface WatchedChallenge {
  challengeDir: string;
  manifestPath: string;
}

export class ContentWatcher {
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly watchedFiles = new Set<string>();
  private rootWatcher?: fs.FSWatcher;

  constructor(
    private readonly challengesRoot = CHALLENGES_ROOT,
    private readonly debounceMs = 250,
  ) {}

  start() {
    if (!fs.existsSync(this.challengesRoot)) {
      console.warn(`[ContentWatcher] challenges root not found: ${this.challengesRoot}`);
      return;
    }

    this.refreshManifestWatchers();
    this.rootWatcher = fs.watch(this.challengesRoot, () => {
      this.refreshManifestWatchers();
    });

    console.log(`[ContentWatcher] watching ${this.challengesRoot}`);
  }

  stop() {
    this.rootWatcher?.close();
    this.rootWatcher = undefined;

    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();

    for (const manifestPath of this.watchedFiles) {
      fs.unwatchFile(manifestPath);
    }

    this.watchedFiles.clear();
  }

  private refreshManifestWatchers() {
    for (const challenge of this.listChallenges()) {
      if (this.watchedFiles.has(challenge.manifestPath)) continue;

      this.watchedFiles.add(challenge.manifestPath);
      fs.watchFile(
        challenge.manifestPath,
        { interval: 300 },
        (current, previous) => {
          if (current.mtimeMs === previous.mtimeMs) return;
          this.scheduleSync(challenge);
        },
      );
    }
  }

  private listChallenges(): WatchedChallenge[] {
    return fs
      .readdirSync(this.challengesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const challengeDir = path.resolve(this.challengesRoot, entry.name);
        const manifestPath = path.resolve(challengeDir, "challenge.json");

        return fs.existsSync(manifestPath)
          ? [{ challengeDir, manifestPath }]
          : [];
      });
  }

  private scheduleSync(challenge: WatchedChallenge) {
    const existingTimer = this.timers.get(challenge.manifestPath);
    if (existingTimer) clearTimeout(existingTimer);

    this.timers.set(
      challenge.manifestPath,
      setTimeout(() => {
        this.timers.delete(challenge.manifestPath);
        void this.sync(challenge);
      }, this.debounceMs),
    );
  }

  private async sync(challenge: WatchedChallenge) {
    try {
      const result = await syncChallengeDirectory(challenge.challengeDir);
      const publishedNote = result.skippedPublishedSnapshot
        ? " (published snapshot preserved)"
        : "";

      console.log(
        `[ContentWatcher] synced ${result.id} v${result.version} (${result.stepCount} steps)${publishedNote}`,
      );
    } catch (err) {
      console.error(
        `[ContentWatcher] failed to sync ${challenge.manifestPath}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}

export function shouldStartContentWatcher() {
  if (process.env.STEPWISE_CONTENT_WATCHER === "1") return true;
  if (process.env.STEPWISE_CONTENT_WATCHER === "0") return false;
  return process.env.NODE_ENV === "development";
}
