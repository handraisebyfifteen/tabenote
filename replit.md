# Traditional Chinese Medicine (TCM) Food System

## Overview

This is a Traditional Chinese Medicine (TCM) focused food and ingredient database application that helps users understand the therapeutic properties of foods according to TCM principles. The application provides a comprehensive system for categorizing ingredients by their nature (hot, warm, neutral, cool, cold), flavors (sweet, sour, bitter, spicy, salty), associated elements (wood, fire, earth, metal, water), and meridians, while also offering seasonal recommendations based on the 24 solar terms.

The system combines TCM theory with practical food selection, allowing users to search ingredients, analyze food combinations, learn about the five elements theory, and get personalized recommendations based on seasonal cycles. It's designed as an educational and practical tool for those interested in TCM dietary therapy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom design system including TCM-specific color variables
- **Component Structure**: Modular components with dedicated pages for different features (search, elements, seasons, combinations, education)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with route-based organization
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Middleware**: Custom logging, JSON parsing, and error handling

### Data Storage Solutions
- **Current Implementation**: In-memory storage using Maps for development and testing
- **Database Ready**: Drizzle ORM configured for PostgreSQL with comprehensive schema definitions
- **Schema Design**: 
  - Ingredients table with TCM properties (nature, flavor, element, meridians, effects)
  - Seasons table for 24 solar terms with associated recommendations
  - Combinations table for analyzing ingredient interactions
  - Support for nutritional data, contraindications, and compatibility information

### Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Interface-Based Storage**: Storage abstraction allows easy switching between implementations
- **Component Composition**: UI built with reusable, composable components
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas

### Key Features
- **Ingredient Database**: Comprehensive TCM ingredient properties and effects
- **Search and Filtering**: Advanced search with multiple filter criteria
- **Five Elements Theory**: Interactive diagram and educational content
- **Seasonal Recommendations**: 24 solar terms calendar with seasonal food suggestions
- **Combination Analysis**: Tool for analyzing ingredient compatibility and effects
- **Educational Content**: Structured learning modules for TCM theory

## External Dependencies

### Database and ORM
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **@neondatabase/serverless**: Serverless PostgreSQL driver for production deployment

### Frontend Libraries
- **React Ecosystem**: React, React DOM, TypeScript
- **UI Components**: Extensive Radix UI component collection for accessible primitives
- **State Management**: TanStack React Query for server state synchronization
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Forms**: React Hook Form with Zod resolvers for form validation
- **Utilities**: Class variance authority, clsx for conditional styling

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript for type safety
- **Development Experience**: Replit-specific plugins for development environment integration
- **Asset Management**: Custom alias configuration for clean imports

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Development Runtime**: tsx for TypeScript execution in development
- **Build Tools**: esbuild for production bundling
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Utilities**: nanoid for ID generation, date-fns for date manipulation

### TCM-Specific Features
- **Comprehensive Data Model**: Support for TCM properties including nature, flavor, element, meridians
- **Seasonal Integration**: 24 solar terms system with seasonal recommendations
- **Educational Framework**: Structured content for learning TCM principles
- **Compatibility Analysis**: System for analyzing ingredient synergies and conflicts