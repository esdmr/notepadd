# Getting Started

## Overview

NotePADD is a note-taking tool set which aims to integrate other commonly used tools inline with the notes.

Currently, NotePADD is available as a VS Code extension.

## Creating Your First NotePADD Notebook

::: tip NOTE
Since NotePADD has not reached v1.0, there is no prebuilt version yet.

Building NotePADD requires Node v20 or later.
:::

Clone the repository:

```sh
git clone https://github.com/esdmr/notepadd.git && cd notepadd
```

Install the dependencies:

```sh
corepack pnpm install
```

Build and install the VS Code extension.

```sh
corepack pnpm -r install-vscode-extension
```

You may have to restart VS Code.

Assuming that everything went well, you can create an empty file ending with `.np.md` to start note-taking!

## Taking Notes

Whenever you open a `*.np.md` file, NotePADD opens it in a (Jupyter) notebook-style interface.

You can write your notes in markdown cells. Press the “Stop editing cell” button (<kbd><kbd>ctrl</kbd>+<kbd>enter</kbd></kbd> by default) to see a preview of that cell.

## Using Tools

By selection the “NotePADD Directives” language, you can use one of the many commands available.

NotePADD also supports Plant UML diagrams. Simply, select the language for a cell. You will need the Plant UML extension and the compiler.

::: tip NOTE
You must run the cell to trigger the tool.

For diagrams, this will generate and embed the diagram images.
:::

## Viewing the Dashboard

You can click on the compass-shaped button in the activity bar to open the NotePADD Bridge. NotePADD will show a sidebar with information about the notebooks in the current workspace folder(s).
