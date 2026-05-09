# 09 - Prompt Packs

## Goal

Prompt packs turn planning documents and tasks into precise instructions for AI
coding tools.

## Examples

- Laravel
- React
- React Native Expo
- Flutter
- Next.js
- .NET
- WordPress
- Supabase
- Firebase

## Rules

1. One prompt should not build the whole system.
2. Each prompt should map to a task or reviewable unit of work.
3. Each prompt should define allowed and forbidden files.
4. Each prompt should include validation or manual check steps.
5. Each prompt should state what must not be changed.
6. Each prompt should have acceptance criteria.

## Runtime

```bash
kvdf prompt-pack list
kvdf prompt-pack show react-native-expo
kvdf prompt-pack compose react --task task-001
kvdf prompt-pack compose react-native-expo --task task-mobile-001
```
