## What changed

Briefly describe the change and the route or tool it touches.

## Tool checklist

- [ ] `logic.ts` is framework-free, with no DOM, storage, or network access.
- [ ] Unit tests cover valid, invalid, Unicode, and limit cases.
- [ ] No `Math.random()` for ids, picks, shuffles, dice, or winners.
- [ ] No network request from tool logic or UI.
- [ ] Keyboard path, labels, and result announcements work.
- [ ] Mobile 360px has no horizontal page scroll.
- [ ] Title, description, canonical, H1, and JSON-LD are unique and valid.
- [ ] Content is real: how-to, limits, privacy, and 8 to 10 FAQs.
- [ ] Related tools resolve and are added to the registry.
- [ ] No em dashes: `npm run check:copy` passes.

## Porting checklist (only when code or data is reused)

```
Source:
  repo:
  file:
  function/lines:
Destination:
Status: Copy / Port / Rewrite
License notice updated: yes/no
Pure module (no solid, no DOM, no fetch): yes/no
Known-answer test added: yes/no
No-network test passes: yes/no
Bundle impact (gzip):
```

- [ ] Recorded in `PORTING.md`.
- [ ] Notice added to `THIRD_PARTY_NOTICES.md` in the same change.
- [ ] Header comment names the source and license.

## Verification

- [ ] `npm run verify`
- [ ] `npm run preview` and checked the route in a browser
- [ ] Both light and dark themes checked
