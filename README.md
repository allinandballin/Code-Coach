# Code Coach

Code Coach is an AI-assisted coding tutor for beginners. Each language starts with three built-in lessons that explain what code does, why it is useful, and when to use it. Learners answer a quick check, then explain their thinking or write a small code example for AI feedback before a lesson counts as complete. After the built-in path, the AI can create the next lesson and keep extending that language course.

Learners can choose Python, C++, C#, Java, JavaScript, or Solidity. The starter path moves from output, to variables, to decisions or comparisons, and AI-created lessons can extend it. Progress is saved separately for each language. The prototype includes a runnable Python `print()` playground; examples in the other languages are read-only. Solidity lessons are educational and do not deploy contracts.

## Run locally

Requirements: Node.js 18 or newer.

1. Open a terminal in the repository folder.
2. Install nothing; the prototype uses Node's built-in modules.
3. Set `OPENAI_API_KEY` in your terminal environment (in PowerShell: `$env:OPENAI_API_KEY = "your-key"`).
4. Run `npm start` and open `http://127.0.0.1:4179`.

The local server keeps the key on the server. In the original workspace, it also reads the allowed OpenAI settings from the parent `.env.local` file for convenience. Do not put API keys in browser code or commit them to GitHub.

## Deploy to Netlify

1. In Netlify, choose **Add new site → Import an existing project** and connect the `allinandballin/Code-Coach` GitHub repository.
2. Leave the base directory blank (repository root). No build command is needed; the site is static HTML, CSS, and JavaScript.
3. In the Netlify site's environment variables, add `OPENAI_API_KEY` with your secret key. Optionally set `OPENAI_TEXT_MODEL` or `OPENAI_MODEL`; the default is `gpt-4.1-mini`.
4. Deploy. `netlify.toml` publishes the repository root, registers the `netlify/functions` folder, and routes `/api/coach` to the serverless function.

Never commit the API key. If it is accidentally exposed, revoke it and create a replacement.

## Learning experience and current limits

- Explanations, multiple-choice comprehension checks, hints, guided game-planning prompts, and learner reflection.
- Delayed recall prompts after the learner returns.
- AI feedback on free-response answers and AI-generated exercises constrained to approved examples.
- Progress and reflections are saved in the current browser's local storage.
- Only the Python `print()` playground executes learner code; other languages need dedicated safe runners before they can be interactive.

This is an early prototype. Before opening it broadly to children, add learner accounts or guardian controls as appropriate, privacy and data-retention policies, moderation, and durable server-side rate limiting. The Netlify function includes a basic per-instance request limit, which is not a complete production abuse-control system.

## Nextwave AI

The tutoring request layer is separated from the lesson interface. Nextwave AI can be connected later as an alternative or broker for generating feedback and exercises.
