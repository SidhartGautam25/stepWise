# StepWise Architecture Overview - Stable Version Two

## Overview
StepWise is a comprehensive educational platform for coding challenges, utilizing a monorepo structure with Turborepo for efficient management. This document outlines the architecture of Stable Version Two, detailing data flow, database schema, component designs, and system interconnections. It also compares this version to the previous design as documented in the architecture_diagram.md and architecture_review.md files.

## Previous Design Reference
Based on the architecture_diagram.md and architecture_review.md from the planning phase:
- The previous design emphasized a modular monorepo with apps (CLI, Web, API) and packages (DB, Auth, etc.)
- Key suggestions included improving data flow efficiency, enhancing interactive components, and strengthening CLI capabilities
- Focus was on zero-setup distribution and rich educational experiences

Stable Version Two implements most of these suggestions while introducing improvements in scalability and user experience.

## Data Flow Architecture

### High-Level Data Flow
1. **User Authentication**: Web app → API → Auth package → DB
2. **Challenge Initialization**: CLI → API → DB (seeded challenge data)
3. **Code Execution**: CLI → Challenge Runner → Tester packages → Result back to API/DB
4. **Progress Tracking**: API aggregates user progress from DB for Web dashboard
5. **Interactive Learning**: Web app dynamically imports from Lesson Content package

### Detailed Workflow
- **Setup Phase**: Student runs `stepwise init <challenge>`. CLI fetches challenge manifest from API, which queries DB for metadata and file paths.
- **Development Phase**: Student codes locally. Interactive engine provides visual aids via Web app.
- **Testing Phase**: `stepwise test` triggers Challenge Runner, which executes tests in sandboxed environment and reports results to API.
- **Progression**: API updates UserProgress and Attempt tables based on test outcomes.

## Database Schema

The database uses PostgreSQL (hosted on Neon) with Prisma ORM for type-safe queries.

### Core Models
- **User**: Basic user info, password hash, attempts, progress
- **Challenge**: Metadata for challenges (id, version, title, language, etc.), linked to steps and versions
- **ChallengeVersion**: Immutable snapshots for version control
- **ChallengeStep**: Individual steps within challenges (id, key, title, position, prompt path)
- **Attempt**: Records of test executions (user, challenge, step, status, outcome, result JSON)
- **UserProgress**: Tracks completion status per user-challenge pair

### Key Relationships
- User → Attempts (1:many)
- Challenge → Steps (1:many), Versions (1:many), Attempts (1:many)
- ChallengeStep → Attempts (1:many)
- Attempt links to User, Challenge, Version, Step

### Data Seeding
Challenges are seeded from local JSON manifests in the `challenges/` directory, ensuring DB contains metadata while content remains on disk for performance.

## Interactive Engine Design

### Architecture
The Interactive Engine follows a strict data-driven pattern:
- **Input**: JSON configuration objects (IllustrationConfig)
- **Processing**: renderIllustration function selects appropriate React components
- **Output**: Interactive UI with animations and user interactions

### Key Components
- **GitCommitGraph**: Visualizes commit history and branching
- **GitStagingArea**: Shows workspace → staging → repo flow
- **StepSimulator**: Demonstrates message passing between actors
- **InteractiveBuckets**: Allows dragging items between zones

### Role in Workflow
- Provides visual mental models for abstract concepts
- Enhances Web dashboard with dynamic, interactive illustrations
- Bridges gap between static documentation and lived experiences
- Imported dynamically based on challenge/step IDs from DB

## CLI Design and Role

### Architecture
- **Compilation**: Uses Vercel `pkg` to bundle Node.js V8 engine + TypeScript code into standalone binaries
- **Distribution**: Zero-setup binaries for Windows (.exe), macOS (Mach-O), Linux (ELF)
- **Execution**: Static await import() dispatcher patterns
- **Testing**: Proxies to API for results, pulls challenge structure locally

### Workflow Integration
- **Init Command**: Fetches challenge data from API, sets up local workspace
- **Test Command**: Spawns Challenge Runner, executes tests, submits results to API
- **Progress Sync**: Communicates with API to update user progress and attempts

### Key Features
- No dependency on installed Node.js/npm for end users
- Secure binary distribution via bootstrapper scripts
- Plugin system for extensible testers via environment variables

## System Interconnections

### App-to-Package Dependencies
- **Web App**: Consumes DB, Auth, Types, Interactive Engine, Lesson Content
- **API App**: Uses DB, Auth, Challenge Runner (indirectly via results)
- **CLI App**: Depends on Challenge Runner, Types; communicates with API
- **Worker App**: Handles background processing (if implemented)

### Data Flow Integration
- DB acts as central source of truth
- API serves as stateless router between clients and DB
- CLI and Web sync via API for consistent state
- Interactive Engine and Lesson Content provide rich UI enhancements

### Authentication Flow
- JWT tokens issued by API/Auth package
- Stored in browser cookies (Web) and file cache (CLI)
- Validated on protected routes

## Comparison to Previous Version

### Implemented Suggestions
- **Modular Architecture**: Fully implemented with clear separation of concerns
- **Zero-Setup CLI**: Achieved via pkg compilation to standalone binaries
- **Rich Interactive Components**: Interactive Engine provides comprehensive visual aids
- **Versioned Challenges**: ChallengeVersion model allows immutable snapshots
- **Comprehensive DB Schema**: Supports attempts, progress, and metadata tracking

### Improvements in Stable Version Two
- **Enhanced Scalability**: Better indexing on DB queries (user-challenge indexes)
- **Improved Data Flow**: Clearer separation between metadata (DB) and content (disk)
- **Stronger Type Safety**: Prisma-generated types throughout the stack
- **Plugin Architecture**: Tester registry allows external plugin loading
- **Immutable Versions**: ChallengeVersion prevents breaking changes in attempts

### Areas for Further Improvement
- **Real-time Collaboration**: Add WebSocket support for live coding sessions
- **Advanced Analytics**: Implement detailed learning analytics and recommendations
- **Multi-language Support**: Expand beyond Node.js to Python, Rust, etc.
- **Offline Mode**: Allow full offline operation with local DB sync
- **AI-Powered Hints**: Integrate ML for intelligent code suggestions

## Conclusion
Stable Version Two represents a mature, production-ready implementation of the StepWise platform, successfully addressing most architectural concerns from the planning phase while establishing a solid foundation for future enhancements. The modular design ensures maintainability, while the focus on user experience through interactive components and zero-setup CLI creates an accessible learning environment.</content>
<parameter name="filePath">/home/sidharthg/sid/project/mineProject/stepWise/plan/stable_version_two/stepwise_architecture.md