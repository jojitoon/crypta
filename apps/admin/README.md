# Crypta Admin Panel

A comprehensive admin interface for managing users and courses in the Crypta learning platform.

## Features

### User Management

- View all users with their stats and achievements
- Search and filter users by name, email, or role
- Promote/demote users to/from admin status
- Delete users (with confirmation)
- View user statistics (points, courses created, achievements)

### Course Management

- View all courses with detailed information
- Search and filter courses by title, description, category, level, or status
- Publish/unpublish courses
- Delete courses (with confirmation)
- View course statistics (enrollments, completions, lessons)

### Dashboard Overview

- Platform statistics (users, courses, lessons, enrollments)
- Recent activity tracking
- Quick action buttons
- Admin-only access control

## Setup

1. **First Time Setup**
   - Navigate to the admin panel
   - Click "Create Account" to register the first admin user
   - After registration, sign in with your credentials
   - Click "Make First User Admin" to grant admin privileges

2. **Regular Access**
   - Sign in with your admin credentials
   - Access is restricted to users with `isAdmin: true`

## Usage

### Managing Users

1. Navigate to the "Users" tab
2. Use the search bar to find specific users
3. Filter by role (All, Admin, Regular User)
4. Click "Make Admin" or "Remove Admin" to change user roles
5. Click "Delete" to remove users (requires confirmation)

### Managing Courses

1. Navigate to the "Courses" tab
2. Use the search bar to find specific courses
3. Filter by status (All, Published, Unpublished) and level (Beginner, Intermediate, Advanced)
4. Click "Publish" or "Unpublish" to change course status
5. Click "Delete" to remove courses (requires confirmation)

### Viewing Statistics

- The "Overview" tab shows platform-wide statistics
- Recent activity shows the last 7 days of user engagement
- Quick action buttons provide easy navigation

## Security

- Admin access is controlled by the `isAdmin` field in the user document
- All admin functions require authentication and admin privileges
- User deletion cascades to remove all related data (progress, stats, achievements, courses)
- Course deletion cascades to remove all related data (lessons, quizzes, enrollments)

## Development

The admin panel is built with:

- Next.js 15 with App Router
- Convex for backend functions and real-time data
- Tailwind CSS for styling
- Sonner for toast notifications
- Convex Auth for authentication

### Key Files

- `app/page.tsx` - Main admin page with authentication logic
- `components/AdminDashboard.tsx` - Main dashboard with navigation
- `components/UserManagement.tsx` - User management interface
- `components/CourseManagement.tsx` - Course management interface
- `components/AdminStats.tsx` - Statistics overview
- `packages/backend/convex/admin.ts` - Admin-specific Convex functions

## API Functions

### Admin Functions (`packages/backend/convex/admin.ts`)

- `getAllUsers` - Get all users with stats
- `getAllCourses` - Get all courses with details
- `updateUserAdminStatus` - Toggle user admin status
- `deleteUser` - Delete user and all related data
- `updateCourseStatus` - Publish/unpublish courses
- `deleteCourse` - Delete course and all related data
- `getAdminStats` - Get platform statistics
- `makeFirstUserAdmin` - Make first user admin (setup only)

All functions include admin access validation and proper error handling.
