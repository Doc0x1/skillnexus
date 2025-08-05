# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillNex.us is a React-based typing practice application designed to help users develop muscle memory for Linux/Windows commands. The application simulates a terminal environment where users can practice typing various command sets including Linux commands (beginner, intermediate, advanced), pentesting commands, and guided walkthroughs.

## Development Commands

### Standard React Scripts
- `npm start` - Runs the development server on http://localhost:3000
- `npm run build` - Creates production build in `build/` folder
- `npm test` - Runs the test suite in watch mode
- `npm run eject` - Ejects from Create React App (irreversible)

### Development Workflow
- `npm install` - Install dependencies after cloning
- The app uses hot reloading in development mode
- Debug mode can be enabled with `REACT_APP_DEBUG=true` environment variable

## Architecture Overview

### Core Application Structure
The app follows a standard React component hierarchy:

**Main Components:**
- `App.tsx` - Root component managing global state and routing between desktop/mobile views
- `Terminal.tsx` - Core terminal simulation component with dragging functionality
- `TextInput.tsx` - Handles user input with real-time command validation
- `XFCEMenuBar.tsx` - Desktop environment simulation
- `SelectTestModal.tsx` - Command set selection interface
- `ResultModal.tsx` - Test completion results display

### State Management
- Uses React hooks for local state management
- Key state includes:
  - `selectedCommandSet` - Currently active command set
  - `isTestRunning` - Test execution status
  - `results` - Test completion history
  - `entries` - All available command sets loaded from commands.json

### Data Structure
- `commands.json` - Central configuration file containing all command sets
- Each command set has: name, value (ID), type (category), and commands array
- Command structure: `{ command: string, description: string }`
- Types defined in `src/types/commandSet.ts`

### Key Features
- **Terminal Simulation**: Draggable terminal window with authentic styling
- **Real-time Validation**: Character-by-character input validation with mistake tracking
- **Multiple Command Sets**: Organized by difficulty (beginner/intermediate/advanced) and category
- **Responsive Design**: Desktop-optimized with mobile redirect
- **Performance Metrics**: Accuracy calculation and timing
- **Command History**: Shows previous commands during test execution

### Styling System
- **Tailwind CSS** for utility-first styling
- **PostCSS** with autoprefixer for vendor prefixes  
- Custom CSS for terminal-specific styling in component CSS files
- XFCE desktop environment aesthetic

### Component Communication
- Props drilling for passing state between components
- Event handlers passed down for user interactions
- Modal system for overlays (test selection, results)

## Command Set Management

### Adding New Command Sets
1. Edit `src/commands.json`
2. Follow the existing structure with unique keys
3. Include: name, value (kebab-case ID), type (category), commands array
4. Commands need both `command` and `description` properties

### Command Categories
- `Linux-Commands` - Basic to advanced Linux terminal commands
- `Pentesting-Commands` - Security testing tools and techniques
- `Box-Walkthroughs` - Step-by-step guided penetration testing scenarios

## Testing Strategy
The project uses Create React App's built-in testing setup with Jest and React Testing Library. Run tests with `npm test` for watch mode.

## Deployment Notes
- Static site optimized for GitHub Pages or similar hosting
- Production build outputs to `build/` directory
- All assets are in `public/` directory including background image
- Uses environment variables with `REACT_APP_` prefix