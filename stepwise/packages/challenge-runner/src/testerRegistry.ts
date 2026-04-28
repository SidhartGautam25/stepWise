import type { ChallengeType, Tester } from "./types";

export interface TesterRegistration {
  name: string;
  supportedRuntimes: string[];
  supportedChallengeTypes?: ChallengeType[];
  create(): Tester;
  canHandle?(input: TesterSelectionInput): boolean;
}

export interface TesterSelectionInput {
  runtime: string;
  challengeType: ChallengeType;
  language?: string;
  capabilities?: string[];
}

export class TesterRegistry {
  private readonly testers = new Map<string, TesterRegistration>();

  register(tester: TesterRegistration) {
    if (this.testers.has(tester.name)) {
      throw new Error(`Tester "${tester.name}" is already registered`);
    }

    this.testers.set(tester.name, tester);
    return this;
  }

  registerMany(testers: TesterRegistration[]) {
    for (const tester of testers) {
      this.register(tester);
    }

    return this;
  }

  registerFromModule(moduleName: string) {
    const pluginModule = require(moduleName) as unknown;
    const registrations = readRegistrationsFromModule(pluginModule, moduleName);
    return this.registerMany(registrations);
  }

  registerFromEnv(envValue = process.env.STEPWISE_TESTER_PLUGINS) {
    const moduleNames = (envValue ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    for (const moduleName of moduleNames) {
      this.registerFromModule(moduleName);
    }

    return this;
  }

  getTester(input: TesterSelectionInput): Tester {
    const registration = this.getRegistration(input);

    if (!registration) {
      const available = Array.from(this.testers.keys()).join(", ") || "none";
      throw new Error(
        `No tester registered for runtime "${input.runtime}" and challenge type "${input.challengeType}". Available testers: ${available}`,
      );
    }

    return registration.create();
  }

  getRegistration(input: TesterSelectionInput): TesterRegistration | undefined {
    return this.findRegistration(input);
  }

  list() {
    return Array.from(this.testers.values()).map((tester) => ({
      name: tester.name,
      supportedRuntimes: tester.supportedRuntimes,
      supportedChallengeTypes: tester.supportedChallengeTypes ?? [],
    }));
  }

  private findRegistration(input: TesterSelectionInput) {
    return Array.from(this.testers.values()).find((tester) => {
      if (tester.canHandle) return tester.canHandle(input);

      const runtimeMatches =
        tester.supportedRuntimes.includes("*") ||
        tester.supportedRuntimes.includes(input.runtime);
      const typeMatches =
        !tester.supportedChallengeTypes ||
        tester.supportedChallengeTypes.includes(input.challengeType);

      return runtimeMatches && typeMatches;
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTesterRegistration(value: unknown): value is TesterRegistration {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    Array.isArray(value.supportedRuntimes) &&
    typeof value.create === "function"
  );
}

function readRegistrationsFromModule(
  pluginModule: unknown,
  moduleName: string,
): TesterRegistration[] {
  if (!isRecord(pluginModule)) {
    throw new Error(`Tester plugin "${moduleName}" did not export an object`);
  }

  const candidates = [
    pluginModule.testerRegistration,
    pluginModule.default,
    pluginModule,
  ];

  for (const candidate of candidates) {
    if (isTesterRegistration(candidate)) return [candidate];
  }

  const many = pluginModule.testerRegistrations;
  if (Array.isArray(many) && many.every(isTesterRegistration)) {
    return many;
  }

  throw new Error(
    `Tester plugin "${moduleName}" must export testerRegistration, testerRegistrations, or a default TesterRegistration`,
  );
}
