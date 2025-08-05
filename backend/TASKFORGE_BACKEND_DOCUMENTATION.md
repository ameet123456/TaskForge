# TaskForge Backend - Complete Documentation

## 📋 Project Overview
TaskForge is a comprehensive task management system with team collaboration features, built using Node.js, Express.js, and MongoDB. The system supports role-based access control, team management, project organization, and task tracking.

## 🏗️ Architecture Overview
- **Framework**: Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js (Google OAuth)
- **Authorization**: Role-based access control (Admin, Team Lead, Team Member)
- **Session Management**: Express-session with JWT

## 📁 Directory Structure
```
backend/
├── models/          # Database schemas and models
├── controller/      # Business logic and API handlers
├── middleware/      # Authentication and authorization middleware
├── routes/          # API route definitions
├── config/          # Configuration files
└── index.js         # Main application entry point
```

---

## 🗂️ DATABASE MODELS

### 1. **user_model.js** - User Management
**Schema Fields**:
- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `password` (String, required): Hashed password for authentication
- `isActive` (Boolean, default: true): Account status
- `isAdmin` (Boolean, default: false): Administrative privileges
- `timestamps`: Automatic createdAt and updatedAt fields

### 2. **team_model.js** - Team Structure
**Schema Fields**:
- `name` (String, required): Team name
- `description` (String): Team description
- `organization` (ObjectId, ref: "Organization"): Associated organization
- `teamLead` (ObjectId, ref: "User", required): Team leader
- `members` (Array of ObjectIds, ref: "User"): Team members
- `isActive` (Boolean, default: true): Team status

### 3. **team_member_model.js** - Team Membership
**Schema Fields**:
- `user` (ObjectId, ref: "User", required): User reference
- `team` (ObjectId, ref: "Team", required): Team reference
- `role` (String, enum): User role in team ('team_lead', 'team_member', 'admin')
- `isAdmin` (Boolean, default: false): Admin privileges within team
- `isActive` (Boolean, default: true): Membership status
- **Unique Index**: (user, team) combination

### 4. **project_model.js** - Project Management
**Schema Fields**:
- `name` (String, required): Project name
- `description` (String, required): Project description
- `endDate` (Date, required): Project deadline
- `team` (ObjectId, ref: "Team", required): Associated team
- `status` (String, enum): Project status ('pending', 'in_progress', 'completed')
- `createdBy` (ObjectId, ref: "User", required): Project creator
- `tasks` (Array of ObjectIds, ref: "Task"): Associated tasks

### 5. **task_model.js** - Task Management
**Schema Fields**:
- `title` (String, required): Task title
- `description` (String, required): Task description
- `state` (String, enum): Task status ('pending', 'todo', 'in-progress', 'completed', 'cancelled')
- `priority` (String, enum): Priority level ('none', 'low', 'medium', 'high', 'critical')
- `dueDate` (Date): Task deadline
- `assignedTo` (ObjectId, ref: "User", required): Task assignee
- `assignedBy` (ObjectId, ref: "User", required): Task assigner
- `teamId` (ObjectId, ref: "Team", required): Associated team
- `projectId` (ObjectId, ref: "Project", required): Associated project
- `comments` (Array): Task comments with author and timestamp

### 6. **org_model.js** - Organization Management
**Schema Fields**:
- `name` (String, required, trim): Organization name
- `createdBy` (ObjectId, ref: "User", required): Organization creator
- `admins` (Array of ObjectIds, ref: "User"): Organization administrators
- `isActive` (Boolean, default: true): Organization status

---

## 🎮 CONTROLLERS

### 1. **authController.js** - Authentication & Authorization
**Key Functions**:
- `registerUser()`: User registration with role assignment and JWT token generation
- `loginUser()`: User authentication with team memberships retrieval
- `googleAuth` & `googleCallback()`: Google OAuth authentication flow
- `logoutUser()`: Session cleanup and logout
- `getAllUsers()`: Retrieve all users (admin/team_lead only)

### 2. **taskController.js** - Task Management
**Key Functions**:
- `createTask()`: Create tasks with team membership and role validation
- `updateTask()`: Update tasks with role-based permissions (team members can only add comments)
- `deleteTask()`: Soft delete tasks (team_lead/admin only)
- `getTask()` & `getAllTasks()`: Retrieve tasks with populated user details

### 3. **teamController.js** - Team Management
**Key Functions**:
- `createTeam()`: Create teams with member management (admin only)
- `getAllTeams()` & `getTeamById()`: Retrieve teams with projects and member details
- `addUserToTeam()` & `removeUserFromTeam()`: Team membership management
- `updateTeam()` & `deleteTeam()`: Team updates and soft deletion

### 4. **projectController.js** - Project Management
**Key Functions**:
- `createProject()`: Create projects with team lead validation
- `getProject()`: Retrieve projects based on user access (admin gets all, members get team-specific)
- `getProjectById()`: Retrieve single project with populated tasks
- `editProject()`: Update project details with role-based permissions

### 5. **teamMemberController.js** - Team Membership Management
**Key Functions**:
- `updateTeamMemberRole()`: Update member roles with team lead transfer logic
- `getAllTeamMembers()` & `getSingleTeamMember()`: Retrieve team member information
- `getMyTeams()`: Get current user's team memberships
- `addUserToTeam()` & `removeUserFromTeam()`: Team membership operations

### 6. **orgController.js** - Organization Management
**Key Functions**:
- `createOrganization()`: Create organizations with admin assignment
- `getAllOrganizations()`: Retrieve organizations with pagination and search
- `getOrganizationById()`: Retrieve single organization
- `updateOrganization()`: Update organization details
- `deleteOrganization()`: Soft delete or permanent delete organizations

---

## 🛡️ MIDDLEWARE

### 1. **authMiddleware.js** - JWT Authentication
**Features**:
- Extracts JWT token from Authorization header
- Verifies token signature and expiration
- Fetches user data and team membership
- Attaches user object to request with role information

### 2. **verifyRole.js** - Role-Based Access Control
**Features**:
- Flexible role checking with multiple allowed roles
- Admin bypass when 'admin' is in allowed roles
- Role validation against user's current role
- Returns 403 Forbidden for unauthorized access

### 3. **verifyTeamAccess.js** - Team Access Validation
**Features**:
- Validates project existence and accessibility
- Checks team membership for non-admin users
- Admin bypass for all projects
- Attaches project and team member info to request

### 4. **auth.js** - Legacy Authentication (Alternative)
**Functions**:
- `isAuthenticated()`: Basic JWT token validation
- `isAdmin()`: Admin-only access control
- `isTeamLead()`: Team lead and admin access control

---

## 🛣️ ROUTES

### 1. **user_route.js** - User Authentication & Management
**Base Path**: `/api/users`
**Endpoints**:
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - OAuth callback handling
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /logout` - User logout
- `GET /` - Get all users (admin/team_lead only)

### 2. **task_route.js** - Task Management
**Base Path**: `/api/tasks`
**Endpoints**:
- `POST /` - Create tasks
- `GET /` - Get all tasks
- `GET /:id` - Get single task
- `PUT /:id` - Update tasks
- `DELETE /:id` - Delete tasks (soft delete)

### 3. **team_route.js** - Team Management
**Base Path**: `/api/teams`
**Endpoints**:
- `POST /` - Create teams (admin only)
- `GET /` - Get all teams
- `GET /:id` - Get single team
- `POST /:id/members` - Add user to team
- `DELETE /:id/members/:userId` - Remove user from team
- `PATCH /:id` - Update team
- `DELETE /:id` - Delete team (soft delete)

### 4. **team_member_route.js** - Team Membership Management
**Base Path**: `/api/team-members`
**Endpoints**:
- `GET /my-teams` - Get current user's teams
- `GET /:teamId` - Get all team members
- `GET /:teamId/:userId` - Get specific team member
- `PATCH /:teamId/:userId/role` - Update member role
- `POST /:teamId/members` - Add user to team
- `DELETE /:teamId/members/:userId` - Remove user from team

### 5. **project_route.js** - Project Management
**Base Path**: `/api/projects`
**Endpoints**:
- `POST /` - Create projects (team_lead/admin)
- `GET /` - Get projects based on access
- `GET /:id` - Get single project with tasks
- `PUT /` - Update project details

### 6. **org_route.js** - Organization Management
**Base Path**: `/api/org`
**Endpoints**:
- `POST /` - Create organizations (admin only)
- `GET /:id` - Get single organization
- `PATCH /:id` - Update organization
- `DELETE /:id` - Delete organization

---

## ⚙️ CONFIGURATION

### 1. **db.js** - Database Configuration
**Features**:
- MongoDB connection setup with optimized options
- Connection error handling and graceful degradation
- Development: `mongodb://localhost:27017/taskforge`
- Production: Environment variable `MONGODB_URI`

### 2. **passportConfig.js** - Passport.js Configuration
**Features**:
- Google OAuth strategy setup
- Automatic user creation for new Google users
- JWT token generation for authenticated users
- User serialization and deserialization

**Environment Variables Required**:
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: OAuth callback URL
- `JWT_SECRET`: JWT token signing secret

---

## 🚀 MAIN APPLICATION (index.js)

### Application Setup
```javascript
// Core dependencies
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
```

### Middleware Configuration
```javascript
// JSON body parser
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
```

### Route Registration
```javascript
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/projects", projectRoutes);
```

### Error Handling
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Something went wrong!" 
    });
});
```

---

## 🔐 SECURITY FEATURES

### Authentication & Authorization
- **JWT Token Validation**: Secure token verification with 24-hour expiration
- **Google OAuth Integration**: Social login with automatic user creation
- **Role-Based Access Control**: Admin, Team Lead, Team Member roles
- **Team Membership Validation**: Users can only access their team resources

### Data Protection
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Request body and parameter validation
- **CORS Protection**: Cross-origin request control
- **Session Security**: Encrypted session storage
- **Error Sanitization**: Safe error responses without sensitive data

---

## 📊 API RESPONSE PATTERNS

### Success Responses
```javascript
// Single resource
{ success: true, data: resourceObject }

// Multiple resources
{ success: true, data: [resourceArray] }

// With pagination
{
  success: true,
  data: resources,
  pagination: { currentPage, totalPages, totalItems, itemsPerPage }
}
```

### Error Responses
```javascript
// 400 - Bad Request
{ success: false, message: "Validation error message" }

// 401 - Unauthorized
{ message: "Unauthorized: No token" }

// 403 - Forbidden
{ message: "Only team leads or admins can perform this action" }

// 404 - Not Found
{ message: "Resource not found" }

// 500 - Server Error
{ success: false, message: "Server error" }
```

---

## 🔧 ENVIRONMENT SETUP

### Required Environment Variables
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskforge

# Authentication
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/users/auth/google/callback
```

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

---

## 📈 KEY FEATURES

### Core Functionality
1. **User Management**: Registration, login, profile management
2. **Team Management**: Create, update, delete teams with member management
3. **Project Management**: Organize tasks within projects
4. **Task Management**: Full CRUD operations with comments and status tracking
5. **Organization Management**: Multi-tenant organization support
6. **Role Management**: Dynamic role assignment and updates

### Advanced Features
- **Soft Deletes**: Data preservation with isActive flags
- **Pagination**: Efficient handling of large datasets
- **Search Functionality**: Organization search with filters
- **Comment System**: Task comments with author tracking
- **Status Tracking**: Comprehensive status management for tasks and projects
- **Priority Management**: Task priority levels with enum validation

---

## 🔄 DATABASE RELATIONSHIPS

### One-to-Many Relationships
- **User → Tasks**: One user can create/assign multiple tasks
- **Team → Projects**: One team can have multiple projects
- **Project → Tasks**: One project can contain multiple tasks
- **Organization → Teams**: One organization can have multiple teams

### Many-to-Many Relationships
- **Users ↔ Teams**: Through TeamMember model with roles
- **Users ↔ Organizations**: Through admin arrays

### Referential Integrity
- All ObjectId references use proper population
- Cascade operations handled in controllers
- Soft deletes preserve referential integrity

---

*This documentation provides a comprehensive overview of the TaskForge backend system. The application is designed with scalability, security, and maintainability in mind, following RESTful API patterns and implementing proper authentication and authorization mechanisms.* 