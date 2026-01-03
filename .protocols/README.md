# Protocols Directory

This directory contains the operational context for specific tasks and features, following the **DeksdenFlow** methodology (adapted for Kilo Code).

## 📂 Structure

Each task or feature gets its own dedicated folder with a standardized naming convention:
`.protocols/NNNN-kratkoe-imya-zadachi/` (where NNNN is a sequential number)

Inside each protocol folder, you will find artifacts managed by the AI agents:
- `plan.md`: The high-level plan and contract.
- `context.md`: The current state of the protocol execution.
- `log.md`: A journal of work done and decisions made.
- `00-setup.md`, `XX-step-name.md`: Detailed instructions for each step.

## 🤖 AI Agent Prompts (Instructions)

The `.protocols/_prompts/` directory contains the "source code" (instructions) for the AI agents to perform different roles in the DeksdenFlow process.

| File | Purpose |
|---|---|
| [`protocol-new.md`](./_prompts/protocol-new.md) | **Start Here**. Instructions for creating a NEW protocol, planning, and setting up the workspace. |
| [`protocol-resume.md`](./_prompts/protocol-resume.md) | Instructions for **resuming** work on an existing protocol (e.g., after a session break). |
| [`protocol-review-merge.md`](./_prompts/protocol-review-merge.md) | Instructions for the **QA Reviewer** to review the work and merge it into `main`. |
| [`protocol-review-merge-resume.md`](./_prompts/protocol-review-merge-resume.md) | Instructions for **resuming** a QA review session. |

## 🚀 Workflow Summary

1.  **New Task**: Feed the content of `protocol-new.md` to the agent. It will generate the plan and create the `.protocols/NNNN-.../` folder.
2.  **Execution**: The agent follows the plan in the created folder. If the session is interrupted, use `protocol-resume.md` to restore context.
3.  **Review**: Once the task is done, feed `protocol-review-merge.md` to a new agent session (QA Reviewer) to verify and merge the changes.

## 📝 Templates

The `.protocols/_templates/` directory contains the raw templates used by the agents to generate the protocol files. These are maintained to match the structures defined in the prompts.