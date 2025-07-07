# RiskIt - Premium 3D Product Website

## Project Overview

The "RiskIt" website is a high-end, fully-interactive digital storefront designed for a single premium product, in this case, a beverage. Its main goal is to create a memorable and engaging user experience that goes far beyond a typical e-commerce site. It uses advanced 3D graphics and fluid animations to make the product feel tangible and exciting.

---

## Technology Stack (What it's built with)

This project uses a modern, high-performance tech stack to achieve its effects:

*   **Framework:** **Next.js 15** (using the App Router). This provides a fast, server-optimized foundation, which is great for performance and SEO.
*   **Language:** **TypeScript**. This adds strong type-safety to the code, making it more robust, easier to maintain, and less prone to bugs.
*   **3D Graphics:**
    *   **Three.js:** The core engine for all 3D rendering.
    *   **React Three Fiber:** A powerful library that allows us to build complex Three.js scenes declaratively within React components. This is the heart of all the 3D can models and animations.
*   **Styling:**
    *   **Tailwind CSS:** Used for all styling. It allows for rapid and consistent design using utility classes.
    *   **ShadCN UI:** A library of beautifully designed and accessible UI components (Buttons, Cards, Forms, etc.) built on top of Tailwind CSS. This ensures the user interface is both professional and easy to use.
*   **Animations:** The project features several layers of animation:
    *   **Component Animations:** Handled by **Framer Motion** (which is integrated into ShadCN UI) for smooth UI transitions.
    *   **3D Scene Animations:** Custom animation logic written directly in JavaScript and Three.js controls how the 3D objects move, rotate, and react to user input (like scrolling or mouse movement).
*   **Forms & Backend Logic:**
    *   **Next.js Server Actions:** Used to handle form submissions securely on the server without needing to build separate API endpoints.
    *   **Resend:** Integrated for email delivery. When a user submits the "Feedback" or "Newsletter" form, a server action uses Resend to send a formatted email directly to your inbox.
    *   **Zod:** Used for data validation to ensure that form submissions (like emails) are in the correct format before being processed.

---

## Functionalities & Key Features

Here is a list of the website's main functions:

1.  **Fully Interactive 3D Homepage:**
    *   The main scene features a row of 8 different 3D cans. These cans subtly react to the user's mouse movements.
    *   As the user scrolls down the page, the central can grows larger and rotates, creating a dynamic focal point that connects the different marketing sections.

2.  **Dynamic 3D Models:**
    *   The 3D can models are not static. The labels, featuring the "RiskIt" logo and flavor name, are dynamically generated with code. This means you can easily change flavor names or colors in a single configuration file (`src/lib/flavors.ts`) and the 3D models will update automatically.

3.  **Seamless Animated Transitions:**
    *   **"Flavor Explosion" Transition:** When a user clicks a flavor from the carousel, the 3D can model dissolves into a cloud of particles that then fly across the screen and transition the user to the checkout page.
    *   **"Immersive Pour" Experience:** When a user clicks a can on the main scene, they are taken to a unique page that features a full-screen, cinematic animation of the can being opened and poured into a glass, complete with realistic liquid, foam, and bubble effects.

4.  **Functional Contact & Newsletter Forms:**
    *   The website includes two fully working forms.
    *   All submissions are handled securely on the server and are delivered to an email address of your choice via the Resend service.
    *   Input is validated to prevent errors and spam.

5.  **E-commerce Ready Checkout Page:**
    *   A dedicated `/checkout` page that displays a large 3D preview of the selected product flavor.
    *   The flavor can be changed directly on this page, and the 3D model updates instantly.
    *   The page is structured and ready for a payment processor (like Stripe) to be integrated to handle real sales.

6.  **Fully Responsive Design:**
    *   The entire website, including the complex 3D scenes, is designed to work flawlessly on all device sizes.
    *   On mobile, the navigation collapses into a sleek, slide-out menu for a clean and user-friendly experience.