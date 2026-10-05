@AGENTS.md


---

## 🧰 Fleet Claude global
Ce projet bénéficie de mon arsenal global (`~/.claude/`) : **74 skills** + **42 agents** (dev, frameworks, data, devops, animation, marketing, contrôle qualité). Catalogue complet : `~/.claude/skills/INDEX.md`.
- Utiliser proactivement le skill / l'agent adapté à la tâche (ne pas repartir de zéro).
- **Boucle de contrôle avant livraison** : auto-revue `code-review-self` → agent `code-reviewer` (+ `security-auditor` si auth/entrées/données) → `quality-gatekeeper` (verdict GO/NO-GO).
- House style : réponses en français, a11y/perf/sécurité par défaut, vérifier avant d'affirmer « c'est fait ».
