# Poker Table — the web table for nights Kittu misses

One page, `index.html`, that runs a cash game on any phone's browser:
seat players, + buy-in, cash out with a chip count, busted, undo, final count
with the chip gap shown, who-pays-whom, share. When the game ends it makes a
**result link**; Kittu taps it on his iPhone, Poker Bank shows the night, and
nothing is added until he taps **Approve**.

Nothing is stored on a server. The game lives in the browser of the phone
running it (and in the links people share). No accounts, no tracking, no
outside scripts or fonts. After the first visit it works with no signal.

## The links

| Link | Made by | Opens |
|---|---|---|
| `…/poker-table/` | — | The page. Pin this one in the WhatsApp group. |
| `…/poker-table/#h=…` | Poker Bank (Table → **Hand over**) or the page's **Hand over** | "Take over the table" — the night continues on that phone |
| `…/poker-table/#r=…` | The page (**Send to Kittu for approval**) | A read-only view with **Open in Poker Bank** → `pokerbank://import#r=…` |

Every link carries a version, is compressed, and ends in a checksum. A link
cut short by a chat app or changed by hand is refused with a plain message.
The address of the page is written in two places and must match:
`PB.HOST` in `core.part.js` and `ResultLink.pagesHost` in
`PokerBankCore/Sources/PokerBankCore/ResultLink.swift`
(`https://krishnakeerthanv.github.io/poker-table/`).

## Publish it on GitHub Pages — step by step

You do this once. It takes about ten minutes. You need the GitHub account
`krishnakeerthanv` (the one that already holds `poker-bank`).

1. On your Mac, open **Safari** and go to **github.com**. Sign in.
2. Click the **+** at the top right, then **New repository**.
3. In **Repository name**, type exactly: `poker-table`
4. Choose **Public**. (GitHub Pages is free only for public repositories.
   The page holds no data — every game stays on the phone that runs it.)
5. Tick **Add a README file**. Click **Create repository**.
6. On the new repository page, click **Add file**, then **Upload files**.
7. Open **Finder** and go to `PokerBuild › _v4 › D › web` (or wherever the
   lead merged it). Drag **two** files into the browser window:
   `index.html` and `sw.js`. Nothing else is needed.
8. Scroll down and click **Commit changes**.
9. Click **Settings** (the tab with the gear, near the top of the repository).
10. In the left column, click **Pages**.
11. Under **Build and deployment → Source**, pick **Deploy from a branch**.
    Under **Branch**, pick **main** and **/ (root)**. Click **Save**.
12. Wait one or two minutes, then refresh. A box at the top says
    **Your site is live at https://krishnakeerthanv.github.io/poker-table/**.
13. Open that address on your iPhone. You should see **Run tonight's game**.
14. In the WhatsApp group, post the address and **pin** the message
    (press and hold the message → **Pin**).

If GitHub shows a different address in step 12 (for example because the
account name differs), tell Claude: the address must be changed in the two
places listed above and the app rebuilt.

### Updating the page later

Repeat steps 6–8 with the new `index.html`. Also open `sw.js`, change
the version (it is `pbt-v4-20261112` since 4.0) to a new one each time, and upload it too — that is what
makes phones that already opened the page pick up the new version.

## How the group uses it

- **Kittu leaves early:** in Poker Bank, Table → **Hand over** → share the
  link. Whoever stays opens it and taps **Take over**.
- **Kittu isn't there at all:** open the pinned link → **Start a game**.
- **Only the results are known** (a phone note like "Bhu +1100, Fred's -10000,
  Gopi nil"): **Only the results** → paste → it must add up to ₹0. Buy-ins are
  assumed and the night is flagged that way for Kittu.
- **Passing the table to another phone mid-game:** **Hand over** on the page.
- **At the end:** **Send to Kittu for approval**, post the link in the group.

## For whoever changes the code

`index.html` is assembled — do not edit it directly:

```
web/head.part.html   page shell and styles
web/core.part.js     money + link core (ported from PokerBankCore)
web/app.part.js      the screens
web/build.sh         cat head + core + app > index.html
web/sw.js            offline cache
```

After any change: `sh build.sh`, then

```
node tests/page.test.js          # core: vectors, links, corruption, size, counts
node tests/gen-vectors.js        # re-writes tests/vectors/crosscheck.json AND
                                 # PokerBankCore/Tests/.../ResultLinkVectors.swift
NODE_PATH=<dir with jsdom@24.1.3> node tests/ui.smoke.js   # full flows in a fake browser
```

then run the Core tests (`ResultLinkTests`) — they must reproduce every
vector the page wrote, transfer for transfer.
