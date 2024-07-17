# Digital Accessibility Reporting Tool

This tool is used to check if websites comply with the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/).

## 🍾 Miro

We're using a [Miro Board](https://miro.com/app/board/uXjVKOZ4DNM=/) to keep track of the progress and add all requirements and decisions.

## 🔨 Codebase

The Backend and the Frontend are written in [TypeScript](https://www.typescriptlang.org/) and run on [Node.js](https://nodejs.org/en). For better developer experience [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) are used.

### 🏛️ Backend

- [Express.js](https://expressjs.com/de/): Used to provide an API for the Frontend.
- [Playwright](https://playwright.dev/): Used to create the screenshot of the given website.
- [IBM's Accessibility Checker](https://www.npmjs.com/package/accessibility-checker): Used to check that a source complies with the WCAG.
- [Cheerio.js](https://cheerio.js.org/): Used for crawling all the URLs of a domain.

### 🏡 Frontend

- [React](https://de.react.dev/): Used to build the UI.
- [Tailwind CSS](https://tailwindcss.com/): Used for the stying.

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
