# Project Directory Summary

## Root Files

- **package.json**: Defines project metadata, dependencies (React, Tailwind, testing libraries, etc.), scripts for running/building/testing, and browser compatibility settings.
- **package-lock.json**: Auto-generated file that locks the exact versions of dependencies for reproducible installs.
- **tailwind.config.js**: Tailwind CSS configuration, specifying which files to scan for class usage and allowing theme/plugin customization.
- **README.md**: Documentation for setup, available scripts, and links to React and Create React App documentation.
- **.gitignore**: Specifies files/folders to be ignored by git (node_modules, build, .env, logs, etc.).

## src/

- **FullScreenCenter.jsx**: Simple React component that displays a centered "Hello world!" message with Tailwind styling.
- **App.js**: Main application component. Sets up routing (login, register, welcome, tasks, task details, etc.), loading spinner, and authentication logic.
- **api.js**: Configures an Axios instance for API requests, attaches auth tokens, and handles global API errors.
- **index.css**: Imports Tailwind's base, components, and utilities for global styling.
- **logo.svg**: SVG logo (React logo) used in the UI.
- **setupTests.js**: Sets up Jest DOM matchers for React testing.
- **reportWebVitals.js**: Utility to measure and report web performance metrics using the web-vitals library.
- **index.js**: Entry point. Renders the App component and starts web vitals reporting.
- **App.test.js**: Basic test to check if the "learn react" link renders in the App.
- **App.css**: App-specific CSS for layout, header, logo animation, and link styling.

### src/pages/
- **Welcome.jsx**: Displays a welcome message and user info after login; redirects to login if not authenticated.
- **Signin.jsx**: Registration form for new users, including role selection (user, team lead, admin, team member). Handles form state, validation, and API call to register.
- **Login.jsx**: Login form for users, supports manual and Google OAuth login, stores user/token in localStorage, and redirects on success.
- **authUtils.js**: Utility functions for authentication: checking if a user is authenticated and logging out.

### src/components/
- **TaskCart.jsx**: Displays detailed information about a single task, including status, priority, due date, and allows editing or deleting the task. Fetches task data from the API.
- **TaskList.jsx**: Fetches and displays a list of tasks, with options to add, edit, delete, or assign tasks. Handles loading and error states.
- **TaskForm.jsx**: Form for creating or editing a task. Handles form state, validation, fetching teams and members, and submitting to the API.

---

This summary covers all files in the project except for node_modules and public, providing a high-level overview of their purpose and functionality. 