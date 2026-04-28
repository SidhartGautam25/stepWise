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

  getTester(input: TesterSelectionInput): Tester {
    const registration = this.findRegistration(input);

    if (!registration) {
      const available = Array.from(this.testers.keys()).join(", ") || "none";
      throw new Error(
        `No tester registered for runtime "${input.runtime}" and challenge type "${input.challengeType}". Available testers: ${available}`,
      );
    }

    return registration.create();
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
