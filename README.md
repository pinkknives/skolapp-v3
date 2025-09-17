# Skolapp v3

Modern Progressive Web App for school management with accessibility, design system, and performance optimization.

## Features

- 🎨 **Design System**: Comprehensive design tokens and component library
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 📱 **Progressive Web App**: Installable, offline-capable
- ⚡ **Performance**: Optimized for speed and efficiency
- 🔒 **Privacy**: GDPR compliant
- 🌍 **Responsive**: Works on all devices
- 🎭 **Animations**: Subtle, modern interactions
- 📋 **Plan Management**: Integrated with Spec Kit
- ✅ **Task Management**: Comprehensive task tracking

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: Custom component library with class-variance-authority
- **Animations**: Framer Motion
- **PWA**: next-pwa with comprehensive caching
- **TypeScript**: Full type safety
- **Performance**: Bundle analysis and optimization

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/pinkknives/skolapp-v3.git

# Navigate to the project directory
cd skolapp-v3

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run analyze` - Analyze bundle size

## Design System

### Design Tokens

The design system includes comprehensive tokens for:

- **Colors**: Primary, neutral, semantic colors with dark mode support
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation system
- **Motion**: Animation durations and easing functions
- **Breakpoints**: Responsive design breakpoints

### Components

Core components include:

- **Button**: Multiple variants with accessibility support
- **Card**: Flexible content container
- **Input**: Form input with validation states
- **Typography**: Semantic text components
- **Layout**: Navbar, Footer, Container, Section

## Accessibility

- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Reduced motion preferences
- Focus management
- Semantic HTML

## Performance

- Code splitting and lazy loading
- Image optimization
- Service worker caching
- Bundle analysis
- Performance budgets
- Core Web Vitals optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The app can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS
- Docker

For PWA features to work properly, ensure HTTPS is enabled in production.

## Spec Kit Integration

The application integrates with Spec Kit for:

- Plan management and curriculum planning
- Task assignment and tracking
- Progress monitoring
- Standards alignment

Integration points are located in `/src/components/spec-kit/`.