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

## How to Add Your Code to GitHub

If you have created a new, empty repository on GitHub, the most reliable way to upload your project is by using the GitHub website's upload feature.

**Step-by-Step Guide:**

1.  **Open Your Repository:**
    Go to your repository page on GitHub. It will look something like this:
    `https://github.com/teja8978544942/RiskIt-e-3d-website`

2.  **Find the Upload Link:**
    On the main page of your empty repository, find the sentence that says:
    "Get started by creating a new file or **uploading an existing file**."
    Click on the blue link that says **"uploading an existing file"**.

3.  **Upload Your Files and Folders:**
    You are now on the upload page. In the center of the page, there is a link that says **"choose your files"**.
    
    *   Click on **"choose your files"**. This will open your computer's file browser.
    *   Navigate to your project's main folder (it is named `studio`).
    *   First, select the entire **`src`** folder and click "Upload". GitHub will automatically upload all the files and folders inside it.
    *   Next, click "Upload files" again on the GitHub page.
    *   This time, select all of the following configuration files from your project's main folder. You can hold down `Ctrl` (on Windows) or `Cmd` (on Mac) to select multiple files at once:
        *   `package.json`
        *   `tailwind.config.ts`
        *   `next.config.ts`
        *   `README.md`
        *   `components.json`
        *   `tsconfig.json`
    *   Click "Open" to add them to the upload queue.

4.  **Commit Your Changes:**
    *   Once all your files and the `src` folder are listed on the page, scroll down to the bottom.
    *   You will see a "Commit changes" box. You can type a message like `Initial project upload`.
    *   Click the final green **"Commit changes"** button.

After this, all of your project code will be in your GitHub repository, ready to be shared on your resume.

---

## How to Deploy

The best way to deploy this Next.js application is with **Vercel**, the company that created Next.js.

1.  Push your code to a public GitHub repository using the aformentioned steps.
2.  Go to [vercel.com](https://vercel.com/) and sign up with your GitHub account.
3.  Import your GitHub repository into Vercel.
4.  Add your `RESEND_API_KEY` and `FORM_TO_EMAIL` as Environment Variables in the Vercel project settings.
5.  Click **Deploy**. Vercel will automatically build and deploy your site, providing you with a live URL to add to the top of this README.
