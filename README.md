# CR Tour - Tennis Tournament Management System

CR Tour is a comprehensive web application designed for managing tennis tournaments, tracking player rankings, and facilitating match witnessing. It provides a platform for players to join tournaments, record match results, and climb the global leaderboard.

## 🌟 Key Features

-   **Tournament Management:** Create, join, and manage tennis tournaments with location support via Google Maps.
-   **Match Witnessing:** Unique system where players can request witnesses to verify match results, ensuring fair play.
-   **Global Leaderboard:** Real-time ranking system based on tournament performance points.
-   **Stamina System:** Dynamic stamina mechanic to manage player activity and participation limits.
-   **User Profiles:** Detailed player profiles with match history, win rates, and statistics.
-   **Admin Dashboard:** Powerful tools for system management, including point reranking and safe backfilling.

## 🛠️ Tech Stack

-   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Database:** [PostgreSQL](https://www.postgresql.org/)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
-   **Icons:** [Lucide React](https://lucide.dev/)

## 🌐 Ecosystem & Third-Party Services

This project leverages a robust ecosystem of tools and services:

-   **Infrastructure:**
    -   [Vercel](https://vercel.com): Frontend hosting and serverless function deployment.
    -   **Database:**
        -   [SQLite](https://www.sqlite.org/): Lightweight database for local development.
        -   [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech) or [Supabase](https://supabase.com)): Recommended for production deployment.
-   **Maps & Location:**
    -   [Leaflet](https://leafletjs.com/): Open-source JavaScript library for mobile-friendly interactive maps.
    -   [OpenStreetMap](https://www.openstreetmap.org/): Free and open geographic data provider.
-   **Core Libraries:**
    -   [NextAuth.js](https://next-auth.js.org/): Complete open-source authentication solution.
    -   [Prisma](https://www.prisma.io/): Next-generation Node.js and TypeScript ORM.
    -   [React Hook Form](https://react-hook-form.com/): Performant, flexible and extensible forms.
    -   [Zod](https://zod.dev/): TypeScript-first schema declaration and validation library.
-   **UI & Styling:**
    -   [Shadcn UI](https://ui.shadcn.com): Reusable components built with Radix UI and Tailwind CSS.
    -   [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework.
    -   [Lucide React](https://lucide.dev): Beautiful & consistent icon library.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A PostgreSQL database instance (local or cloud-hosted like Supabase/Neon)

## 🚀 Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd tennis-tournament
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

    # NextAuth Configuration
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key-change-this"

    # Google Maps API (Optional, for map features)
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
    ```

4.  **Database Setup:**
    Run the Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

    _Note: If you encounter issues, try `npx prisma db push`._

5.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

The application is optimized for deployment on [Vercel](https://vercel.com).

1.  **Push to GitHub:** Ensure your project is pushed to a GitHub repository.
2.  **Import to Vercel:** Log in to Vercel and import your repository.
3.  **Configure Environment Variables:**
    -   In the Vercel project settings, go to **Environment Variables**.
    -   Add all the variables from your `.env` file (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
4.  **Deploy:** Click **Deploy**. Vercel will automatically build and deploy your application.

### Build Command

The standard Next.js build command is used:

```bash
npm run build
```

## 📂 System Architecture

-   **`src/app`:** Contains the App Router pages and API routes.
    -   `actions/`: Server Actions for data mutations (matches, tournaments, admin).
    -   `api/`: Backend API endpoints (auth, etc.).
-   **`src/components`:** Reusable UI components (buttons, cards, dialogs).
-   **`src/lib`:** Utility functions and shared configurations (Prisma client, utils).
-   **`prisma/`:** Database schema (`schema.prisma`) and migrations.

## 🛡️ Admin Features

Admins have access to a dedicated dashboard (`/admin`) for:

-   **Rerank System:** Resetting all user points for a new season.
-   **Backfill Points:** safely recalculating points for tournaments completed after a rerank.
-   **User Management:** Viewing and managing user accounts.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
