# AI Product Flow

Use for chat, content generation, document analysis, automation, and AI-assisted tools.

Steps:

1. Give the user a clear input surface: prompt, file, parameters, or template.
2. Provide examples or starter prompts.
3. Show processing, streaming, or progress truthfully.
4. Present output with copy, edit, regenerate, save, and feedback actions.
5. Keep history and version recovery visible when useful.

Required states:

- First-run empty prompt
- Processing
- Streaming or progress
- Error and retry
- Empty result
- Output ready
- Usage limit

Rules:

- Do not fake long thinking states.
- Generated content must remain easy to read.
- Copy, regenerate, and feedback actions need icons and accessible labels.

