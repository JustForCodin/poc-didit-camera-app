---
stepsCompleted: [1, 2]
inputDocuments:
  - docs/prd.md
  - docs/00_context/project_brief.md
workflowType: 'ux-design'
lastStep: 2
project_name: 'poc-didit-camera-app'
user_name: 'Oleksii'
date: '2025-12-11'
---

# UX Design Specification poc-didit-camera-app

**Author:** Oleksii
**Date:** 2025-12-11

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

poc-didit-camera-app is an internal testing platform that transforms vision AI backend evaluation from guesswork into systematic, data-driven decision-making. The app enables a small team of testers (< 10) to discover which prompt + backend combinations produce consistent, reliable results across multiple vision AI providers (DiditCamera, Gemini Vision, Anthropic Claude) before integration into Sprout.

The core insight: **prompt stability matters more than raw backend performance.** Testers need to find prompts that work reliably across different visual scenarios (room tidiness, sink cleanliness, book cover detection) with consistent 95%+ accuracy. The app achieves this through dual-capture (real-time frame analysis + video recording), collaborative benchmarking (shared session data across team), and rapid iteration workflows.

### Target Users

**Internal Testing Team (< 10 testers)**

- **Technical Profile:** QA engineers familiar with the tech stack, comfortable with technical concepts like confidence scores, latency metrics, and API backends
- **Core Need:** Discover prompt formulations that produce stable, consistent results (95%+ accuracy) rather than just selecting "the best backend"
- **Testing Context:** Physically moving through spaces (rooms, kitchens, etc.) with iPhone, pointing camera at test scenarios, capturing visual proof-of-concept data
- **Key Behaviors:** Running many rapid test sessions (< 2 minutes each), comparing results across backends, iterating on prompt variations, collaborating on findings

**Success Definition:** Testers can confidently recommend backend + prompt combinations backed by empirical data showing consistent performance across scenarios.

### Key Design Challenges

1. **Prompt Discovery as Core Workflow**
   - The main challenge isn't "which backend is best" but "which prompt + backend combination produces consistent, reliable results"
   - Users need frictionless workflows to test the same prompt across all three backends, then iterate on prompt variations
   - History and comparison views must make prompt performance patterns immediately visible for pattern recognition

2. **Real-Time Feedback During Physical Movement**
   - Testers physically move around spaces while holding iPhone, pointing camera at test scenarios
   - Clear, glanceable feedback is critical while camera is at arm's length
   - One-handed operation likely required since testers hold phone and potentially manipulate test environment

3. **Rapid Iteration Cycles for High Testing Velocity**
   - Testers need to complete many sessions quickly (< 2 minutes per session target)
   - Switching backends and retrying with modified prompts must be frictionless (minimal taps)
   - Review and accuracy marking should be fast to maintain testing momentum and avoid bottlenecks

### Design Opportunities

1. **Prompt-Centric Comparison & Pattern Recognition**
   - Create comparison views that group sessions by prompt, showing backend performance side-by-side
   - Make prompt history searchable and reusable so successful prompts can be easily replicated
   - Visual indicators for "stable prompts" that consistently produce good results across backends
   - Help testers spot patterns: "This prompt works for room tidiness but fails for sink detection"

2. **iPhone-Optimized Mobile Testing Experience**
   - Thumb-friendly controls optimized for one-handed operation while moving
   - Large, clear visual feedback during recording (legible from arm's length while pointing camera)
   - Smart defaults that minimize taps between test runs to maximize testing velocity
   - Camera-first interface that keeps testing workflow front and center

3. **Collaborative Intelligence & Aggregate Insights**
   - Aggregate views showing prompt success rates by scenario type across all team sessions
   - Quick filtering to surface high-performing prompt + backend combinations from shared data
   - Team-wide pattern recognition: leverage collective testing to identify what works
   - Real-time session sharing enables learning from teammates' discoveries
