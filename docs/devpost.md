# tabenote — Devpost submission

Inspiration と What it does は本人の原稿。以下は 2026-08-17 に追記した分。

## How we built it

Expo and React Native, TypeScript all the way through, one codebase that ships to iOS and to the web as a static export.

The app works offline by default. All 438 ingredients ride inside the bundle, and everything you do with them — stars, notes, saved combinations — stays on the device. There is no account because there is nothing to sync.

The pentagon is hand-drawn in SVG rather than pulled from a chart library. It has one job: put your selection and the season's tendency on the same shape, readable in about a second, without a legend. A library would have given me axes and gridlines I'd then spend a week removing.

The seasons turned out to be the interesting part. TCM's five seasons don't sit on a calendar — the fifth, *doyo*, is the eighteen days before each of the four seasonal turning points, so it appears four times a year and cuts the others short. Those turning points are solar terms: the moments the sun's apparent ecliptic longitude crosses a multiple of 15°. I compute them from Meeus' solar position formulas instead of shipping a lookup table, which means the app is right in any year and there's no table to go stale. Accuracy lands within a minute or two, and the app only needs the date.

The twenty-four seasonal scenes on the home screen are drawn procedurally — a sky gradient, a ridgeline, some particles — instead of twenty-four illustrations. The rights are clean and the download doesn't grow.

There is exactly one server component: a Cloudflare Worker in front of Claude Sonnet 5 that turns your selection and the current solar term into menu ideas. It checks the subscription against RevenueCat before it will spend a token, and returns 402 otherwise. Subscriptions run through RevenueCat and StoreKit; builds go out through EAS to TestFlight.

The rule layer — flavors, thermal nature, seasons, solar terms, suggestions — is about 700 lines of pure functions with 77 unit tests behind it. The rules *are* the product, so that's the part that gets tested.

## Challenges we ran into

**The data didn't exist.** There is no machine-readable yakuzen dataset. All 438 entries were transcribed by hand from a print reference — thermal nature, five flavors, meridian affinity, category, one at a time. It is the least glamorous part of the project and easily the most important.

**Deciding what not to build.** Every instinct says score the meal. Give it a number, show a streak, congratulate the user. But a score implies there's a right answer, and the source material says plainly there isn't — balance is one option, not the goal. Taking the score out was harder than putting it in would have been, and it changed the suggestion engine: it can propose what's missing, but it can't imply you were wrong.

**Staying out of medicine.** The moment an app connects an ingredient to a symptom, it's a health product, and the framework I'm working from is full of that language. The line I settled on is that the app never writes effects. It shows classification — this is warming, this is bitter, this reaches these meridians — and the notes are yours to write. That constraint runs everywhere: the ingredient index, the suggestions, the AI prompt.

**Making something Japanese work in English.** My last app failed at this. This time the UI ships in both languages from the same string table, tested for stray Japanese characters. I still haven't finished it — ingredient names are Japanese-only right now, and that's the biggest hole in the app.

**Doing all of it alone.** Data entry, the astronomy, the drawing, the billing integration, the legal pages, the store submission. The unglamorous half of shipping — provisioning profiles, review screenshots, a lockfile that pointed at a registry only my dev machine could resolve — took about as long as the part anyone would call building.

## Accomplishments that we're proud of

The pentagon reads instantly. You pick four ingredients and the shape tells you something true about the meal before you've read a word.

The solar terms are computed from the sun's position, not hardcoded. It's more work than a date table for something almost nobody will notice, but it means the app is correct rather than approximately correct, and it will still be correct in 2040.

438 ingredients, transcribed by hand, including the ones nobody will ever cook.

And the thing that isn't there: no score, no streak, no 100/100. The app describes and suggests, and then it stops.

## What we learned

The framework is centuries old and doesn't need improving. My job was to make it visible, not smarter. Every time I tried to add cleverness on top — weighting, ranking, scoring — the result was worse and less honest than showing the classification and getting out of the way.

Restraint is a feature you have to defend repeatedly, because it looks like something missing.

Localization is a data-model decision, not a translation task. I found that out by building the string table before the data, and I'm still paying for the ingredient names.

Shipping alone means the interesting work is maybe half the calendar. The other half is certificates, screenshots, store metadata, and legal pages — and none of it can be skipped.

## What's next for tabenote

**English ingredient names.** The interface is bilingual but the ingredients aren't, which limits the app to people who read Japanese food words. This is the next thing I build.

**Android.** The codebase is already there; it's a store account and a build profile away.

**The notebook, over time.** Saved combinations are currently a list. They're also a record of how someone actually eats across a year of seasons, and that's a more interesting thing to show back to them.

**More of the year in the app.** Twenty-four solar terms means twenty-four moments worth writing about, and right now the seasonal text is thinner than the data behind it.
