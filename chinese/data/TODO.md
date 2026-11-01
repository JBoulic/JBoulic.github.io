TODO: order prompts by priority order, in case I run out.

Style:
- [x] Character view - made modal card always centered in the middle of the screen on both phone and laptop. Scrolling is contained strictly inside the modal card (`.modal-body`). Fixed phone zero-margin bug by preventing backdrop scrolling and using safe-area insets.
- [x] Light mode backdrop: replaced dark gray/black backdrop with soft frosted translucent light backdrop (`--modal-backdrop` in light mode with blur).
- [x] Pagination: dynamically calculates character count per page based on viewport dimensions so character grid fits without page scrolling. Includes minimum floor (30 characters) and debounced resize recalculation.

Contents:
- [x] anatomy & origin: filled in etymological origin stories and character anatomies for all previously blank characters across the deck (0 remaining empty).
- [ ] anatomy & origin: can continue expanding stories for generic phonetic/semantic entries over time.
- [x] Spoken & Slang: expanded from 31 to 56 entries with high-frequency everyday spoken vocabulary and modern life terms (扫码, 充电宝, 支付宝, 导航, 快递, 顺便, 蛮...的, 哇塞, 摸鱼, 社死, 凡尔赛, 扎心, 吃瓜, 种草, 拔草, 破防, 也是醉了, 安排, 剁手, 接地气, 堵车, 靠边停, 结账, 刷视频, 蹭饭).
- [ ] translation nuances: if some translations aren't accurate, get LLM to improve the translation, I trust the models, much better than humans/old translators. Feel free to add some notes (along with the translation) to explain nuances. 8000 cards to go through seems like a lot but it's probably fine with an LLM even with a 200K context window. Otherwise do it iteratively, by batches across multiple prompts.

Features:
- [x] Audio: added native Chinese speech synthesis (`window.speechSynthesis`, zh-CN at natural 0.88x learning speed). Added speaker button and shortcut 'A' / 'P' on cards, audio button on character modal hero, audio on idioms, and audio on slang words and example sentences.
- [x] 成语 (Idioms): created new tab with 532 curated Chinese idioms (pinyin, literal translations, figurative meanings, historical/fable origins, categories, deck cross-references, and native audio).
- [x] "Back" button in character modal: added navigation history stack and `← Back` button in modal header, plus keyboard shortcut (`Backspace` or `Alt+Left`) to step back through previously inspected characters.
