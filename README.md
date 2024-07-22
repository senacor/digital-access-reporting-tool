# ⛑️ Digital Accessibility Reporting Tool

This tool is used to check if websites comply with the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/).

## 🍾 Miro

We're using a [Miro Board](https://miro.com/app/board/uXjVKOZ4DNM=/) to keep track of the progress and add all requirements and decisions.

## 🔨 Codebase

The Backend and the Frontend are written in [TypeScript](https://www.typescriptlang.org/) and run on [Node.js](https://nodejs.org/en). For better developer experience [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) are used.

### Important files/folders:

- _[backend/](./backend/)_: Contains all server-related files. For more information about the Backend, continue [here](./backend/README.md).
- _[frontend/](./frontend/)_: Contains all client-related files. For more information about the Frontend, continue [here](./frontend/README.md).
- _[screenshots/](./screenshots/)_: Contains the screenshots created by the report generation.
- _[.achecker.yml](./.achecker.yml)_: Contains the configuration for the [IBM's Accessibility Checker](https://www.npmjs.com/package/accessibility-checker)

### 🏃🏻‍♂️‍➡️ How to run the tool

You'll need to install [Node.js (>= 18.19.0)](https://nodejs.org/en) and then run the following commands afterward.

1. To set up everything before the first run just do one of the following steps:

   1. Install the node modules via
      ```
        npm install
      ```
      followed by
      ```
        npx playwright install
      ```
      which installs the headless browsers for Playwright, so it can take screenshots.
   2. Or simply use the predefined command from the [package.json](package.json) which executes both of the previous commands
      ```
        npm run setup
      ```

2. With the following command, you'll start the Frontend on port 3000 ([localhost:3000](localhost:3000)) and the Backend on port 42069 ([localhost:42069](localhost:42069)).
   ```
     npm run dev
   ```

Now you're good to go.

**Note, if you're a developer:**
When saving code changes applying to files in the

- _backend_ folder, the Backend server will automatically restart.
- _frontend_ folder, the Frontend server will automatically perform a hot module reload (Reloading the browser page but also keeping the state of the application like user inputs or loaded data).

If you want to know more about how this works and what other scripts are available, have a look at `scripts` part in the [package.json](package.json).
