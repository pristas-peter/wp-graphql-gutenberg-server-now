const {
  blockTypes,
  batch,
  formatError,
  ServerError,
} = require("wp-graphql-gutenberg-server-core");
const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  let browser = null;
  try {
    if (req.method !== "POST") {
      throw new ServerError("Wrong HTTP method", 400);
    }

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const pathname = `/${req.query.name}`;

    switch (pathname) {
      case "/batch":
        res.json(await batch({ browser, ...req.body }));
        break;
      case "/block-types":
        res.json(await blockTypes({ browser, ...req.body }));
        break;
      default:
        throw new ServerError(`Unknown resource '${pathname}'`);
    }
  } catch (error) {
    res.status(error.status || 500);
    res.json(formatError({ error }));
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
