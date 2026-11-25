# Vesper Brewing landing page

An interactive branding concept for six Vesper Brewing releases, with responsive navigation, buying enquiries, FAQs, and newsletter requests.

Open index.html in a browser or serve this folder with a local static HTTP server. No dependencies or build step are required.

- Select a release to update the beer details, original can mockup, artwork, and buying enquiry.
- Each can is a transparent WebP exported from the supplied Assignment 9 PSD mockup. Its photographic shell stays fixed while the original full label wraps around it. Drag or swipe the label, use the arrow buttons, or focus the can and use Left / Right arrow keys. The center circle or Home returns the label to the front.
- Open the label to inspect the artwork, switch between fitted and full-size views, and close with Escape.
- On small screens, use Menu to show the navigation. Escape closes it and returns focus to the menu button.
- Buying and trade enquiry links open an email draft addressed to vesperbrewingcanada@gmail.com. No stockist locations are invented.
- Newsletter signup validates an email address and consent before opening an email request. The visitor must send it from their email app. The page does not store addresses or confirm a subscription; an email platform is needed for automated delivery and unsubscribe management.

## Files

- index.html and styles.css define the page and responsive design.
- javascript/collection.js holds release copy and selection behaviour.
- javascript/navigation.js handles the mobile menu.
- javascript/newsletter.js prepares the email signup request.
- javascript/can-viewer.js projects the rotating label onto the original can silhouette and reuses its surface lighting. The full wrap uses uniform angular coordinates and preserves the source artwork's aspect ratio, so lettering stays consistent without vertical stretching or switching between a flat photo and a curved label. Rendering runs only on interaction or resize, respects reduced motion, provides error feedback, and protects against stale images when switching releases quickly. Browsers without canvas retain the static PSD export.
- javascript/can-texture.js maps each release to its label artwork. Original label wraps and optimized transparent can exports live in assets/ and load as selected.
- styles.css provides shared color, typography, spacing, control, and motion tokens, plus responsive layouts and keyboard focus states.
- assets/vesper-mark.svg contains the original monogram paths extracted directly from `asgn 4/ry-garcia-assignment4-cheatsheet.ai`. The header shows only the monogram; the header, footer, and favicon use the vector directly, without raster contrast filters.

Browser QA artifacts belong in the ignored .playwright-cli/ folder and are not required to run the site. No Playwright dependency is included.
