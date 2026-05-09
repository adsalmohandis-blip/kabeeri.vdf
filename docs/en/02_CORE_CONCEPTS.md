# 02 - Core Concepts

## Meta-Framework

Kabeeri VDF is not a code framework like Laravel, React, or Expo. It is a
meta-framework that governs how a project idea becomes structured documents,
scoped tasks, AI prompts, reviews, acceptance records, dashboards, handoff, and
release decisions.

## Vibe Developer

A vibe developer uses AI to build software and may not be a traditional senior
engineer. Kabeeri helps by turning natural intent into clear questions, small
tasks, safe prompts, and reviewable outputs.

## Workspace

The `.kabeeri/` folder is the local source of truth for runtime state: tasks,
apps, workstreams, sessions, tokens, costs, policy results, dashboards, and
handoff records.

## Skeleton

A skeleton is the initial project structure created by a generator. It should
contain useful folders, README guidance, and questionnaires instead of many
empty placeholder files.

## Folder Questionnaire

A folder questionnaire explains why a folder exists, what kind of information
is needed, and what AI may generate after the owner answers the questions.

## Prompt Pack

A prompt pack is a stack-specific set of AI implementation prompts. Each prompt
should complete one small task or reviewable group of changes.

## Task Tracking

Task tracking records work from proposed or approved scope through execution,
review, verification, rejection, or reopening.

## Acceptance Checklist

An acceptance checklist verifies that output is not merely present, but correct,
safe, understandable, and usable.

## Extension Layer

The extension layer keeps future or optional capabilities separate from the
stable core so experimental ideas do not pollute the main workflow.
