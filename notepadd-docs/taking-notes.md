# Taking Notes

## Overview

NotePADD lets you take textual notes. You can also use special markings to format your text, using a language called Markdown.

## Paragraphs

Paragraphs are blocks of text separated by an empty line.

```md
Paragraph 1

Paragraph 2
```

> Paragraph 1
>
> Paragraph 2

## Headings

Headings are lines starting with 1 or up to 6 number signs (`#`) followed by a space.


::: tip NOTE
Level 1 headings represent the document title and should only appear once in a document.

Levels 2–6 may appear any number of times, but should be well-structured. (Do not use a level 3 heading immediately after a level 1 one.)
:::

```md
# Title

## Section

### Subsection

#### Sub-subsection

##### Sub-sub-subsection (LaTeX `\paragraph`)

###### Sub-sub-sub-subsection (LaTeX `\subparagraph`)
```

## Unordered Lists

Items of unordered lists start with either a hyphen-minus (`-`), a plus (`+`), or an asterisk (`*`), followed by a space.

::: tip NOTE
Nested lists and non-initial lines should be indented by two spaces.
:::

```md
- Apple
  - Tree Apple
  - Ground Apple (Potato)
- Tomato
```

> - Apple
>   - Tree Apple
>   - Ground Apple (Potato)
> - Tomato

## Ordered Lists

Items of ordered lists start with a number, followed by a full stop symbol (`.`) and a space.

::: tip NOTE
The number of the first item in a list represents the starting index. Lists not starting with one are not supported in some viewers.
:::

::: tip NOTE
Nested lists and non-initial lines should be indented by three spaces.
:::

```md
1. Install dependencies
   1. Install Node.js
   2. Install Rust
2. Build the Wasm file
3. Bundle the frontend
```

> 1. Install dependencies
>    1. Install Node.js
>    2. Install Rust
> 2. Build the Wasm file
> 3. Bundle the frontend

## Tables

Tables start with a heading row, followed by a heading separator, and then by the table rows.

Table columns are separated by the vertical bar symbol (`|`). Additionally, table rows usually start and end with the vertical bar symbol.

::: tip NOTE
You can optionally specify column alignments by placing colon symbols (`:`) in the heading separator.
:::

```md
| index | name | description   |
| ----: | :--: | :------------ |
|     0 |  A   | First letter  |
|     1 |  B   | Second letter |
```

> | index | name | description   |
> | ----: | :--: | :------------ |
> |     0 |  A   | First letter  |
> |     1 |  B   | Second letter |

## Code Blocks

Code Blocks can be written in two different ways:

### Indented Code Blocks

All lines should start with four spaces.

::: tip NOTE
You cannot specify the language this way.
:::

```md
    This is a
    code block

    continued.
```

>     This is a
>     code block
>
>     continued.

### Fenced Code Blocks

Three or more backticks (`` ` ``) should be placed before and after the code block on its own line.

::: tip NOTE
The backticks at the start may be followed by a language identifier to enable syntax highlighting.
:::

````md
```js
console.log('Hello, World!');
```
````

> ```js
> console.log('Hello, World!');
> ```

## Block Quotes

All lines inside a block quote start with a greater than sign (`>`) and an optional space.

::: tip NOTE
Multiple greater than signs represent nested block quotes.
:::

```md
Reply to bob@example.com

> Reply to alice@example.com
>
> > This is my changes
> > ~Alice
>
> LGTM
> ~Bob

Please sign off on the commit, too.
~Mgmt
```

> Reply to bob@example.com
>
> > Reply to alice@example.com
> >
> > > This is my changes
> > > ~Alice
> >
> > LGTM
> > ~Bob
>
> Please sign off on the commit, too.
> ~Mgmt

## Thematic Breaks

Thematic Breaks are made of three or more hyphen-minuses (`-`).

```md
… and so they went on.

---

On the way, they saw an Elephant…
```


> … and so they went on.
>
> ---
>
> On the way, they saw an Elephant…

## Mathematics

You can write LaTeX-style equations. Not all viewers support rendering this.

```md
If we square $p_x$ and $p_y$ and add them together,
we shall get the square of its distance from the origin,

$$ \left\lVert p \right\rVert^2 = p_x^2 + p_y^2 \text{.} $$
```

> If we square $p_x$ and $p_y$ and add them together,
> we shall get the square of its distance from the origin,
>
> $$ \left\lVert p \right\rVert^2 = p_x^2 + p_y^2 \text{.} $$

## Footnotes

You can define a footnote anywhere by placing its content after `[^number]: ` and placing `[^number]` wherever it should appear.

::: tip NOTE
Non-initial lines should be indented by four spaces.
:::

::: warning
Footnote definitions are isolated inside each cell. So, a footnote definition should appear in the same cell as its usage.
:::

```md
This was widely regarded as a bad move[^1].

[^1]: *The Restaurant at the End of the Universe* by Douglas Adams.
```

## LTR Blocks

To mark a block as predominantly left-to-right, wrap it with the `:::ltr`+`:::` container directive.

<div dir="rtl" lang="fa">

```md
این پاراگراف RTL است.

:::ltr
This paragraph is LTR.
:::

این پاراگراف نیز RTL است.
```

> این پاراگراف RTL است.
>
> <div dir="ltr">
>
> This paragraph is LTR.
>
> </div>
>
> این پاراگراف نیز RTL است.

</div>

## RTL Blocks

To mark a block as predominantly right-to-left, wrap it with the `:::rtl`+`:::` container directive.

```md
This paragraph is LTR.

:::rtl
این پاراگراف RTL است.
:::

This paragraph is also LTR.
```

> This paragraph is LTR.
>
> <div dir="rtl">
>
> این پاراگراف RTL است.
>
> </div>
>
> This paragraph is also LTR.

## Emphases (Italics)

To emphasize (usually through italic typeface) some text, wrap it in a single pair of asterisks (`*`) or underlines (`_`).

```md
Okay, but what *does* it need?
```

> Okay, but what *does* it need?

## Strong Emphases (Bolds)

To strongly emphasize (usually through bold font weight) some text, wrap it in two pairs of asterisks (`*`) or underlines (`_`).

```md
Drinks and foods are **not** allowed past this sign.
```

> Drinks and foods are **not** allowed past this sign.

## Line Breaks

To introduce a line break, end it with two spaces or a backslash (` \ `).

```md
And this line will\
break at this\
point.
```

> And this line will\
> break at this\
> point.

## Deletions

To mark some text as deleted (usually through strike-through), wrap it in two pairs of tildes (`~`).

```md
This product is ~~available~~ sold out.
```

> This product is ~~available~~ sold out.

## Hyperlinks

Hyperlinked text are wrapped in square brackets (`[]`) and followed by the target URL in parentheses (`()`).

```md
[Example Website](https://example.com/)
```

> [Example Website](https://example.com/)

## Images

Images are made of an exclamation mark (`!`) followed by a hyperlink.

::: tip NOTE
The hyperlink text acts as the alternative text for the image.
:::

```md
If you see ![World Wide Web Consortium logo](https://www.w3.org/assets/logos/w3c/w3c-no-bars.svg), you have taken a wrong turn somewhere.

![Speech of Foxes, Visualized](https://fox.invalid/speech.png)
```

> If you see ![World Wide Web Consortium logo](https://www.w3.org/assets/logos/w3c/w3c-no-bars.svg), you have taken a wrong turn somewhere.
>
> ![Speech of Foxes, Visualized](https://fox.invalid/speech.png)

## Inline Codes

Inline codes are wrapped in one or more pairs of backticks (`` ` ``).

```md
Go to `/usr/lib` and delete `libvirus.so.1`.
```

> Go to `/usr/lib` and delete `libvirus.so.1`.

## LTR Isolates

To isolate some left-to-right text, wrap it with the `:ltr` text directive.

<div dir="rtl" lang="fa">

```md
خط «Restart Now» 2 بار تکرار می‌شود. (Wrong direction)

خط «:ltr[Restart Now]» 2 بار تکرار می‌شود. (Correct)
```

> خط «Restart Now» 2 بار تکرار می‌شود. (Wrong direction)
>
> خط «<span dir="ltr">Restart Now</span>» 2 بار تکرار می‌شود. (Correct)

</div>

## RTL Isolates

To isolate some right-to-left text, wrap it with the `:rtl` text directive.

```md
The line “الان Restart کنید” would repeat twice. (Wrong direction)

The line “:rtl[الان Restart کنید]” would repeat twice. (Correct)
```

> The line “الان Restart کنید” would repeat twice. (Wrong direction)
>
> The line “<span dir="rtl">الان Restart کنید</span>” would repeat twice. (Correct)
