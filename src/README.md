# RiskIt - Premium 3D Product Website

[**Live Demo**](https://your-deployment-link-here.com)

## Project Overview

The "RiskIt" website is a high-end, fully-interactive digital storefront designed for a single premium product, in this case, a beverage. Its main goal is to create a memorable and engaging user experience that goes far beyond a typical e-commerce site. It uses advanced 3D graphics and fluid animations to make the product feel tangible and exciting.

---

## Getting Started

To run this project on your local machine, follow these steps:

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY-NAME.git
    cd YOUR-REPOSITORY-NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add the following, which are required for the contact forms to work:
    ```
    # Your Resend API key from https://resend.com
    RESEND_API_KEY=your_key_here
    
    # The email address you want to receive submissions at
    FORM_TO_EMAIL=your_email@example.com
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The website will be available at `http://localhost:9002`.

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

---

## How to Push to GitHub (Step-by-Step)

To get this project on your GitHub profile, follow these steps in your terminal. **Run these commands one by one.**

1.  **Initialize Git:** This sets up your project to be a Git repository. This project uses `master` as the default branch name.
    ```bash
    git init -b master
    ```

2.  **Add All Files:** This prepares all of your project files for the first save.
    ```bash
    git add .
    ```

3.  **Save Your Files (Commit):** This creates a snapshot of your project.
    ```bash
    git commit -m "Initial commit of the RiskIt website"
    ```

4.  **Connect to Your GitHub Repository:** This links your local project to the empty repository you created on GitHub.
    ```bash
    git remote add origin https://github.com/teja8978544942/RiskIt-e-3d-website.git
    ```
    *   **Note:** If you get an error that says `remote origin already exists`, it means you've tried this step before. That's okay. Just continue to the next step.

5.  **Push Your Code to GitHub:** This is the final step to upload your files.
    ```bash
    git push -u origin master
    ```

### **Authentication (If You Get an Error)**

When you run `git push`, the terminal should ask for your username and password. **You must use a [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) as your password.**

If the command fails with an `Authentication failed` error without even asking for your password, use this workaround:

1.  **First, make sure your Personal Access Token is copied to your clipboard.**

2.  **Next, remove the old remote URL:**
    ```bash
    git remote remove origin
    ```

3.  **Then, add a new one with your token embedded in it.**
    *   **Important:** Replace `<YOUR-TOKEN-HERE>` with your actual Personal Access Token.
    ```bash
    git remote add origin https://teja8978544942:<YOUR-TOKEN-HERE>@github.com/teja8978544942/RiskIt-e-3d-website.git
    ```

4.  **Now, try pushing again.** This time, it should work without asking for a password.
    ```bash
    git push -u origin master
    ```

---

## How to Deploy

The best way to deploy this Next.js application is with **Vercel**, the company that created Next.js.

1.  Push your code to a public GitHub repository using the steps above.
2.  Go to [vercel.com](https://vercel.com/) and sign up with your GitHub account.
3.  Import your GitHub repository into Vercel.
4.  Add your `RESEND_API_KEY` and `FORM_TO_EMAIL` as Environment Variables in the Vercel project settings.
5.  Click **Deploy**. Vercel will automatically build and deploy your site, providing you with a live URL to add to the top of this README.
