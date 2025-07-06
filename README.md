# RiskIt - Premium 3D Product Website Template

RiskIt is a stunning, modern, and highly interactive Next.js website template designed for showcasing premium products. It leverages the power of 3D graphics and fluid animations to create an unforgettable user experience that captures attention and drives engagement.

This template is perfect for startups, beverage companies, cosmetic brands, or anyone looking to present their product with a bold, high-end digital presence.

![RiskIt Website Screenshot](https://i.postimg.cc/k47N5d0D/riskit-screenshot.png)

## Features

- **Immersive 3D Graphics:** Built with Three.js and React Three Fiber to create beautiful, interactive 3D models of your product.
- **Engaging Animations:** Fluid animations for page transitions, scrolling interactions, and UI elements that make the site feel alive.
- **8 Unique Flavor Showcases:** Easily configurable product variations, each with its own color scheme and 3D model.
- **Fully Responsive Design:** Looks and works great on all devices, from large desktops to mobile phones.
- **Built-in Forms:** Includes fully functional "Contact/Feedback" and "Newsletter Signup" forms powered by Resend for easy email integration.
- **High-Performance Tech Stack:** Built with Next.js App Router for optimal performance and SEO.
- **Easy to Customize:** Styled with Tailwind CSS and ShadCN UI for quick and easy visual changes.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **3D Rendering:** [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) (built into ShadCN) & GSAP (for some 3D scenes)
- **Forms:** [Resend](https://resend.com/) for email delivery
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and customization.

### Prerequisites

- Node.js (v18 or later)
- npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/riskit-template.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd riskit-template
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

To use the contact and newsletter forms, you need to set up environment variables.

1. Create a new file named `.env.local` in the root of your project.
2. Add the following variables to the `.env.local` file:

   ```env
   # Get your API key from https://resend.com
   RESEND_API_KEY="your_resend_api_key_goes_here"

   # The email address where you want to receive form submissions
   FORM_TO_EMAIL="your_email@example.com"
   ```
   
   You will need to sign up for a free Resend account to get your API key.

### Running the Development Server

Once the dependencies are installed and environment variables are set, you can run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Customization

### Changing Flavors and Colors

You can easily change the product flavors and their associated colors by editing the `src/lib/flavors.ts` file. The 3D models and animations will automatically update to reflect your changes.

### Customizing Text and Images

All page content can be found within the `src/app/` directory, primarily in `src/app/page.tsx`. You can edit the text and image paths there directly.

### Styling

To change the core color scheme (background, primary colors, etc.), edit the theme variables in the `src/app/globals.css` file. Component-level styles can be adjusted using Tailwind CSS utility classes directly in the TSX files.
