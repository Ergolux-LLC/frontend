This Vite-based application is designed to look and behave like a traditional multipage website, but under the hood, it functions as a single-page application (SPA). It is served from a minimal index.html file and powered entirely by a large JavaScript bundle that manages routing, rendering, and interactivity.

Once the initial load occurs, there are no further full-page network requests. Navigation within the site is handled via the History API, allowing the browser’s URL to change as the user navigates without reloading the page. All subsequent views are rendered dynamically on the client side, giving the appearance of navigating between real pages while actually avoiding page reloads.

Authentication is managed through server-side cookies. The login page is publicly accessible and handles user credentials. Upon successful login, an HTTP-only cookie is set by the server, which is then used to authenticate access to all protected content. No tokens are stored in the client; all authentication state is server-managed.

A central script, named pageMaker, is responsible for generating and injecting all content into the DOM. It supports two modes of operation:

    Single-page Mode: The navigation bar, content area, and footer are rendered together as a single cohesive unit.

    Multipart Page Mode: The interface is modular; pageMaker can update specific regions—such as replacing just the content area while preserving navigation and footer, or updating multiple sections independently.

This modular rendering system enables efficient UI updates while maintaining a consistent layout and user experience.

A dynamic script loader complements this setup. It is immediately capable of handling the login process by loading only the minimal scripts and styles required for authentication. After login, it begins preloading all remaining scripts, stylesheets, and static assets for the entire site in the background. This includes all JavaScript modules, CSS files, and any additional dependencies that may be needed for other pages.

The script loader’s purpose is to ensure that by the time a user navigates to a new area of the application, all necessary assets are already present in the browser. This proactive approach eliminates runtime fetch delays and ensures instant page transitions across the entire application. Together with the pageMaker system and SPA-style routing, this makes the site feel fast, responsive, and seamless.
