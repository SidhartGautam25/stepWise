import Module from "module";
import path from "path";

type ResolveFilename = (
  request: string,
  parent: NodeModule | null | undefined,
  isMain: boolean,
  options?: unknown,
) => string;

type ModuleResolver = typeof Module & {
  _resolveFilename: ResolveFilename;
};

let aliasesRegistered = false;

export function registerWorkspaceAliases() {
  if (aliasesRegistered) {
    return;
  }

  aliasesRegistered = true;

  const moduleResolver = Module as ModuleResolver;
  const originalResolveFilename = moduleResolver._resolveFilename;
  const aliases: Record<string, string> = {
    "@repo/challenge-sdk": path.resolve(
      __dirname,
      "../../challenge-sdk/src/index.ts",
    ),
  };

  moduleResolver._resolveFilename = function (
    request,
    parent,
    isMain,
    options,
  ): string {
    const alias = aliases[request];

    if (alias) {
      return originalResolveFilename.call(this, alias, parent, isMain, options);
    }

    return originalResolveFilename.call(
      this,
      request,
      parent,
      isMain,
      options,
    );
  };
}
