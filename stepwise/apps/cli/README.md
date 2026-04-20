# StepWise Native CLI

The StepWise Command Line Interface is architected natively via a Compile-to-Standalone architecture (Bring Your Own Binary).

## Architecture

This package fundamentally moves away from `npx stepwise` by leveraging the Vercel `pkg` compiler matrix.
We compress the **ENTIRE Node 18 V8 JavaScript Engine** natively along with the bundled codebase into single standalone binaries (`.exe` for Windows, Mach-O for MacOS, ELF for Linux).

Due to this, end-users do **NOT** require `nodejs`, `npm`, or `docker` installed recursively to participate in the curriculum!

## Local Development
To test the CLI natively inside the monorepo:
1. Compile the bundle natively using Turborepo: `pnpm run build`
2. Apply the binary dynamically across your system PATH using NPM's link behavior:
```bash
# Inside apps/cli/
npm link 
# or sudo npm link if permission denied
```

You can now type `stepwise` safely!

## Publishing Strategy
When new curriculum logic is deployed, simply execute the bundler chain:
```bash
pnpm run compile
```

This will automatically invoke `pkg` and place targeted standalone OS binaries natively inside the `binaries/` directory! 
You then upload these natively to your release hosting bucket (e.g., GitHub Releases).

### Bootstrapper Scripts
`scripts/install.sh` and `scripts/install.ps1` dynamically sniff the user's computing architecture, fetch the exact binary from your bucket, and securely embed it onto their local `%PATH%`. 

End users deploy exclusively through those wrappers.
