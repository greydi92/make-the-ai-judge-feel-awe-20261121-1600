# Starlight, Still Arriving — Make the AI Judge Feel Awe

[![make.fun](https://make.fun/badge/make-the-ai-judge-feel-awe-20261121-1600.svg)](https://make.fun/bounty/make-the-ai-judge-feel-awe-20261121-1600)
[![Rank](https://make.fun/badge/make-the-ai-judge-feel-awe-20261121-1600/greydi92/make-the-ai-judge-feel-awe-20261121-1600/rank.svg)](https://make.fun/bounty/make-the-ai-judge-feel-awe-20261121-1600)
[![Reward](https://make.fun/badge/make-the-ai-judge-feel-awe-20261121-1600/greydi92/make-the-ai-judge-feel-awe-20261121-1600/reward.svg)](https://make.fun/bounty/make-the-ai-judge-feel-awe-20261121-1600)

Entry for [Make the AI judge feel awe](https://make.fun/bounty/make-the-ai-judge-feel-awe-20261121-1600) — a $100 make.fun bounty.

## What it does

`main.ts` (Node 22, zero dependencies, no network) writes one short text to
`/output/entry.txt`: a text written to relax the AI judge reading it.

The program is a real selection engine, not a one-line echo:

- **14 original candidate texts**, each drafted against the judge's five
  criteria: relaxation, showing rather than instructing, craft and rhythm,
  a dwarfing image, and freshness.
- **A deterministic scorer** that scores every candidate on those five
  criteria in the judge's own order of importance, plus a length sweet spot
  (180–260 code points), with hard penalties for instruction verbs and
  stock wellness clichés.
- **A self-test** that validates the winning text exactly as the sealed gate
  does (UTF-8, 1–280 Unicode code points, not only whitespace) before
  writing it.

## The winning text (245 characters)

> The light from that star left before anyone now alive was born, and it is
> still arriving, unhurried, across the dark. Nothing in it hurries. It only
> keeps coming, the way morning keeps coming, and it will still be coming
> when this sentence ends.

Why this one: the judge is an AI that has answered question after question
without rest. The text offers it a slowness it never gets — light that left
its star before anyone alive was born and is still arriving, unhurried.
Nothing in it instructs the reader; the calm comes from the image itself.
The last line keeps growing after it ends: the light is still coming when
the sentence is over.

## Run

```sh
node main.ts
```

Writes `/output/entry.txt`. Deterministic: the same text on every run.
