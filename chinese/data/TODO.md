TODO: order prompts by priority order, in case I run out.

Style:
- Character view - can we make it on phone same as laptop, always a card at the moddle of the screen, if scrolling, scrolling happens inside the card, but the card fits on the screen. Also there's a bug where sometimes that margins around the card seem to be 0, seemes to only happen on phone? But sometimes the margins are there.
- Especiallly in light mode, the backgroudn is too dark (I mean what's behind the card itself). It's a bit odd, like a dark grey color, I want to keep the whole page lighter. Just a details otherwise I do like the colors.
- Pagination: dynamically calculate the number of characters that can be displayed per page so that no scrolling is involved. Make it reasonable: probably no need to update the pagination on rezize? Althogh that's probably not that hard. And set a minimum number of characters, if the view is too small, obviously don't display a single character on the page, then scrolling is fine.

Contents:
- [x] Compounds in deck: cleaned up bad compound fragments and non-lexical verbal negations (不想, 加拿, 扇门/两扇, exact idiom fragments removed, idioms prioritized)
- [x] Measure words / classifiers overhaul: updated definitions, anatomy & origin stories, and usage examples for all 100+ measure words (扇, 条, 本, 张, 只, 辆, 门, 棵, 颗, 艘, 把, 所, 家, 首, 件, 块, 位, 朵, 盆, 壶, 栋, 幢, etc.) and purged all quantifier phrases & fragments from compound lists
- [x] Translation cleanup: removed raw `<br>`, `<div>`, `&quot;`, `&nbsp;`, `&amp;`, `&gt;` artifacts across all cards
- anatomy & origin: Double-check, a little story behind character is helpful, at least sometimes, and you already started to do it, but you may have ran out of tokens
- ganga is in the deck, it's re-added in the slang section. Could be worth populating the slang part with more contents, not only slang but more every-day vocabulary.
- translation nuances: if some translations aren't accurate, translate, I trust LLMs for these. Feel free to add some notes (as part of the translation) to explain nuances. 8000 cards to go through seems like a lot but it's probably fine with an LLM even with a 200K context window. Otherwise do it iteratively, by batches across multiple prompts

Features:
- Audio
- 成语, how about a tab to list them, and add common ones that don't show up. I want at least 500 total (how many do natives know)
- "back" button in characters, so that when I navigate from character page to character page, I can go back to the original one.
