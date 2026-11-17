# Vesper Brewing landing page

An interactive branding concept for six Vesper Brewing releases, with responsive navigation, buying enquiries, FAQs, and newsletter requests.

Open index.html in a browser or serve this folder with a local static HTTP server. No dependencies or build step are required.

- Select a release to update the beer details, artwork, rotating can, and buying enquiry.
- Drag or swipe the can, use its buttons, or focus it and press Left, Right, or Home.
- Open the label to inspect the artwork, switch between fitted and full-size views, and close with Escape.
- On small screens, use Menu to show the navigation. Escape closes it and returns focus to the menu button.
- Buying and trade enquiry links open an email draft addressed to vesperbrewingcanada@gmail.com. No stockist locations are invented.
- Newsletter signup validates an email address and consent before opening an email request. The visitor must send it from their email app. The page does not store addresses or confirm a subscription; an email platform is needed for automated delivery and unsubscribe management.

## Files

- index.html and styles.css define the page and responsive design.
- collection.js holds release copy and selection behaviour.
- navigation.js handles the mobile menu.
- newsletter.js prepares the email signup request.
- can-viewer.js projects the artwork around the interactive can.
- can-texture.js maps each release to its image. The original lossless WebP wraps live in assets/ and load as selected, rather than embedding every image in JavaScript.

Local browser QA files are ignored under .playwright-cli/.
