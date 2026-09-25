# Search Providers

![Demo](https://github.com/user-attachments/assets/9404292c-9093-478e-827f-551920dae0ef)

## How It Works

1. Open OmniWarp.
2. Type what you want to search for.
3. Scroll down to the **Search Providers** section in the command palette.
4. Select a provider (for example, **Google** or **DuckDuckGo**) and press **Enter** (or click it).
5. OmniWarp automatically hides and opens the search results in your default web browser.

---

## Built-in Providers

OmniWarp includes two pre-configured search providers out of the box:

| Provider       | Default URL                               | Reorder? | Show / Hide? | Edit / Delete? |
|:---------------|:------------------------------------------|:--------:|:------------:|:--------------:|
| **Google**     | `https://www.google.com/search?q={query}` |   Yes    |     Yes      |       No       |
| **DuckDuckGo** | `https://duckduckgo.com/?q={query}`       |   Yes    |     Yes      |       No       |

Built-in providers are ready to use immediately. While they cannot be renamed, edited, or deleted, you can change their
order or hide them from the search results anytime.

---

## Smart Features

### 1. Automatic Query Detection on Paste

When you paste a search results URL from your browser into the **URL Template** field, OmniWarp automatically finds your
search term in the URL and replaces it with `{query}`.

OmniWarp recognizes common search parameters across the web (`q`, `query`, `search`, `search_query`, `k`, `keyword`,
`term`, `text`, `s`, `searchTerm`, `field-keywords`, etc.).

> **Tip:** If you are migrating custom search engines from browsers that use `%s` as the query placeholder, you can
> paste or type `%s` — OmniWarp will automatically convert it to `{query}`.

### 2. Automatic Website Name Detection

When typing or pasting a URL, OmniWarp automatically fetches the website's title, cleans off extra slogans and taglines,
and suggests a clean brand name (such as "GitHub", "YouTube", or "Amazon").

If you already typed a name yourself before pasting, OmniWarp keeps your custom name and will not overwrite it.

### 3. Automatic Icon Fetching & Live Preview

OmniWarp automatically retrieves the website's official favicon and shows a live preview at the top of the dialog.

- **High Quality:** OmniWarp prioritizes vector (SVG) and high-resolution icons so they look sharp on modern screens.
- **Cached Locally:** Icons are saved locally on your computer, so they load instantly every time you use OmniWarp, even
  when offline.
- **Fallback:** If a website does not provide an accessible icon, a neutral globe icon is displayed.

---

## Managing Providers

The **Settings > Search Providers** tab gives you full control over how search providers appear and behave:

| Action              | Control              | How It Works                                                                                                                                    |
|:--------------------|:---------------------|:------------------------------------------------------------------------------------------------------------------------------------------------|
| **Global On / Off** | Header Switch        | Master switch to enable or disable all search providers in the command palette. When turned off, the table is dimmed and controls are disabled. |
| **Reorder**         | **Up / Down** Arrows | Moves a provider up or down in the list. The top-to-bottom order in the table matches the order in the command palette.                         |
| **Show / Hide**     | **Eye** Icon         | Toggles visibility for an individual provider without deleting it. Click the open eye to hide it; click the crossed eye to show it again.       |
| **Add Provider**    | **+** Button         | Opens the dialog to add a new search provider.                                                                                                  |
| **Edit Provider**   | **Pencil** Icon      | Opens the edit dialog to modify a custom provider's name or URL. *(Available for custom providers only)*                                        |
| **Delete Provider** | **Trash** Icon       | Permanently removes a custom provider and its saved icon. *(Available for custom providers only)*                                               |
