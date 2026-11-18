# Atajo (English summary)

**A personal operating system for Claude Code, designed in Spanish: it remembers who you are, keeps you focused on your 3 priorities, and never does anything sensitive without your "yes".**

- **Who it is for:** students, salespeople, professionals and small business owners. No coding required.
- **What you get in 10 minutes:** answer 4 questions and get your weekly plan. From then on, every time you open Claude Code in the folder, it knows who you are and where you left off.
- **Cost:** Atajo is free and open source (MIT). You need a paid Claude plan, from USD 20 a month.

The kit, its skills and its messages are in Spanish; this page is a short summary. Full documentation: [README.md](README.md).

<img src="docs/img/red-ejemplo.png" alt="Atajo's network view with sample data: the person in the center, their 3 priorities around them, and their tasks, decisions and skills connected" width="100%">

## Install in 3 steps

1. Have Claude Code with a paid Claude plan (Pro or higher; the free plan does not include Claude Code).
2. Paste one command.
   - Windows (PowerShell): `irm https://raw.githubusercontent.com/davidricardobc/atajo/main/scripts/instalar.ps1 | iex`
   - macOS or Linux: `curl -fsSL https://raw.githubusercontent.com/davidricardobc/atajo/main/scripts/instalar.sh | bash`
3. Open it: `cd ~/atajo`, run `claude`, accept the folder trust prompt, and type `/arranque`.

git and Node.js are optional. Without git, the installer downloads the zip. Without Node, the automatic hooks are off and everything works manually with `/retomar`. The installer needs no admin rights and installs nothing outside its folder.

## What you get in 10 minutes

`/arranque` asks 4 questions, one at a time (who you are, what you want in 90 days, what is due this week, which repetitive task eats your time) and returns your weekly plan: priorities with dates and success signals, this week's actions in order, what is parked, your first automation candidate, and three ready-to-paste requests for your next step. A short guide covers the first week: [docs/primera-semana.md](docs/primera-semana.md) (Spanish).

## First 5 uses

Paste these inside Claude Code, in the Atajo folder, after `/arranque` (in Spanish or English):

1. **Student, exam weeks:** "I have exams in three subjects in the next two weeks and I work part-time. Plan my study days, tell me what comes first and what goes to the parking lot."
2. **Student or new graduate, job search:** "Interview me about my three best projects and write three achievements with real numbers, nothing invented, for my resume."
3. **Salesperson, end of week:** "These are the five clients I owe a follow-up: [paste the list]. Tell me who to write first, draft each message, and send nothing until I say yes."
4. **Business owner, quotes:** "I build every quote by hand. Interview me and leave me a reusable quote template with my prices and terms."
5. **Business owner, a hard decision:** "A client wants a 20% discount. Ask me what you need, help me decide, and log the decision and why in my decision log."

To put several agents to work at once (`/equipo`): "Tomorrow I meet with a bakery. Build the team and prepare me for the meeting."

## How it works

- **One coordinating agent.** Claude Code reads `CLAUDE.md` (kit rules) and `perfil/manual.md` (your rules) at startup.
- **14 skills** as plain-text procedures. Four to start: `/arranque` (weekly plan in 4 questions), `/retomar` (where you left off), `/red` (your system as a network of neurons in a local page) and `/leveling` (one improvement per week). `/equipo` builds a team of agents (researcher, builder, writer and reviewer) that work at the same time, and you approve what goes out. The rest cover interviews, audits, client diagnosis, three-option proposals, security review with Colombia's data protection law, a single publishing gate and Codex delegation.
- **Memory in files.** Profile, priorities and the resume point live in Markdown files you can read and edit. Your data is git-ignored, so kit updates never touch it.
- **You approve.** Publishing, paying, deleting or messaging third parties always requires an explicit yes. A PreToolUse hook asks before push or deploy commands and blocks reads of secret files.

Design decisions and security layers: [docs/arquitectura.md](docs/arquitectura.md) (Spanish).

## FAQ

- **What does it cost?** Atajo is free. Your Claude plan is what you pay, from USD 20 a month (Pro).
- **Does my data leave my computer?** Your files stay on your computer. Claude reads what it needs to answer, as in any Claude Code session. Atajo has no server or database.
- **How is it different?** It starts with 4 questions in about 3 minutes and hands you your weekly plan before any other setup.
- **What it does not do:** publish, pay, delete or message anyone without your yes. It is not legal or accounting advice.

## Credits

Made with Atajo · github.com/davidricardobc/atajo · © 2026 David Bajonero · [MIT License](LICENSE). Ideas from the open-source community are credited in [CREDITOS.md](CREDITOS.md).
