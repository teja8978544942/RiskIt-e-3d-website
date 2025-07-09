
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

## How to Get Your Code onto GitHub (From a Cloud Editor)

The easiest way to upload your project is by using the editor's built-in Source Control panel. This will connect directly to your GitHub account.

### **Part 1: Commit Your Files**

1.  **Open the Source Control Panel:** On the far left of the editor, click the icon that looks like a branching road. This is the "Source Control" panel.
2.  **Write a Commit Message:** At the top of the panel, you will see a text box labeled "Message". Type a short description here, like `Initial project commit`.
3.  **Commit the Files:** Click the **Commit** button. This saves a snapshot of your project's current state.

### **Part 2: Publish to GitHub**

1.  **Publish the Branch:** After you commit, a new button will appear called **Publish Branch**. Click it.
2.  **Sign in to GitHub:** A new browser tab or pop-up may appear asking you to sign in to your GitHub account and authorize the application. Follow the on-screen instructions to grant permission.
3.  **Choose a Repository Name:** You will be prompted to choose a name for your new repository on GitHub. You can keep the suggested name or change it.
4.  **Select Public or Private:** Choose to create a **Public** repository so that you can share it in your resume and portfolio.
5.  **Wait for Upload:** The editor will now upload all your files to the newly created repository on GitHub. Once it's finished, you're done! Your code is now live on your GitHub profile.

---

## How to Deploy

The best way to deploy this Next.js application is with **Vercel**, the company that created Next.js.

1.  Push your code to a public GitHub repository using the aformentioned steps.
2.  Go to [vercel.com](https://vercel.com/) and sign up with your GitHub account.
3.  Import your GitHub repository into Vercel.
4.  Add your `RESEND_API_KEY` and `FORM_TO_EMAIL` as Environment Variables in the Vercel project settings.
5.  Click **Deploy**. Vercel will automatically build and deploy your site, providing you with a live URL to add to the top of this README.
