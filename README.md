# Skillgenix Career Development Platform

An advanced AI-powered career development platform that provides comprehensive, personalized career guidance through intelligent skill mapping and interactive development tools, with a focus on user engagement and dynamic learning experiences.

## Technology Stack

- **Frontend**: React.js with TypeScript and professional design system
- **Backend**: Node.js with Express
- **Database**: MongoDB with robust data collection and cleanup scripts
- **AI Integration**: OpenAI GPT-4o for career analysis
- **Skills Frameworks**: SFIA 9 and DigComp 2.2 framework mapping
- **UI/UX**: Responsive web design with mobile-first approach
- **PDF Generation**: Professional report generation with visualizations
- **Authentication**: Secure user authentication and role-based access control

## Project Structure

- `client/`: React frontend application
  - `src/components/`: UI components
    - `career-pathway/`: Career pathway analysis feature (**PROTECTED**)
    - `dashboard/`: User dashboard components
    - `learning-resources/`: Learning resources feature
    - `ui/`: Shared UI components
  - `src/pages/`: Application pages/routes
  - `src/hooks/`: Custom React hooks
  - `src/lib/`: Utility functions and services

- `server/`: Node.js backend
  - `db/`: Database models and connection
  - `routes/`: API routes
  - `services/`: Backend services
  - `middleware/`: Express middleware

- `shared/`: Shared types and utilities

- `scripts/`: Database and maintenance scripts

## Protected Features

Some features in this project are marked as protected and should not be modified without specific approval. These features have been thoroughly tested and are critical to the platform's operation.

Currently protected features:
- **Career Pathway Analysis** (see PROTECTED_FEATURES.md for details)

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Access the application at http://localhost:5000

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: MongoDB connection string
- `OPENAI_API_KEY`: API key for OpenAI integration
- `JWT_SECRET`: Secret for JWT token generation

## Notes for Developers

- Refer to PROTECTED_FEATURES.md before making changes to protected components
- Always run tests before submitting changes
- Follow the existing code style and patterns
- Document any API changes