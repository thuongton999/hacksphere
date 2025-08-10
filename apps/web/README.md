# HackSphere AI - Hackathon Management Platform

## Overview

HackSphere AI is a comprehensive full-stack hackathon management platform built to streamline the organization and participation in hackathon events. The platform provides role-based functionality for participants, mentors, judges, organizers, and sponsors, featuring team formation, project submissions, judging workflows, mentorship booking, and community interaction. The application leverages modern web technologies with a focus on user experience through a clean, professional design system and responsive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and developer experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **Styling**: TailwindCSS with a custom design system featuring defined color palette, typography, and spacing scales
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Authentication**: Replit Auth with OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with role-based access control
- **File Uploads**: Integration with Google Cloud Storage and Uppy for file handling

### Database Architecture
- **Primary Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Database migrations managed through Drizzle Kit
- **Connection**: Neon serverless driver with WebSocket support for edge environments

### Data Models
- **Users**: Role-based system (participant, mentor, judge, organizer, sponsor) with profile management
- **Events**: Complete hackathon lifecycle management with status tracking
- **Teams**: Dynamic team formation with member management and project tracking
- **Submissions**: Project submission system with file attachments and metadata
- **Judgments**: Scoring system for project evaluation
- **Sessions**: Event scheduling and mentor booking system
- **Community**: Discussion posts and announcements

### Authentication & Authorization
- **Provider**: Replit Auth for seamless integration with the platform
- **Session Storage**: Secure session management with PostgreSQL backend
- **Role-Based Access**: Middleware-enforced permissions based on user roles
- **Security**: HTTP-only cookies with secure flags for session management

### File Storage & Management
- **Cloud Provider**: Google Cloud Storage for scalable file storage
- **Upload Interface**: Uppy dashboard for drag-and-drop file uploads
- **File Types**: Support for project files, documentation, and media assets
- **Access Control**: Secure file access with proper authorization checks

### Development & Deployment
- **Development Server**: Vite dev server with hot module replacement
- **Build Process**: Optimized production builds with code splitting
- **Environment**: Replit-optimized with integrated development tools
- **Type Checking**: Full TypeScript coverage across frontend, backend, and shared modules

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (PostgreSQL serverless)
- **File Storage**: Google Cloud Storage
- **Authentication**: Replit Auth (OpenID Connect)

### Frontend Libraries
- **UI Framework**: React with TypeScript
- **Component Library**: Radix UI primitives and shadcn/ui
- **State Management**: TanStack Query for server state
- **Styling**: TailwindCSS with custom design tokens
- **Icons**: Lucide React for consistent iconography
- **File Uploads**: Uppy ecosystem (core, dashboard, drag-drop, AWS S3 integration)

### Backend Services
- **Web Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with Neon adapter
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Authentication**: Passport.js with OpenID Connect strategy
- **Validation**: Zod for runtime type validation

### Development Tools
- **Build Tool**: Vite with React plugin
- **Package Manager**: npm with lockfile for reproducible builds
- **Replit Integration**: Custom plugins for development environment optimization
- **Code Quality**: TypeScript compiler for static analysis