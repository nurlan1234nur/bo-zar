 PROJECT OVERVIEW

  BoZar is a general-purpose classifieds marketplace where users can discover,
  search, save, publish, edit, sell, deactivate, and report advertisements.

  The system contains:

  1. Public web marketplace — React/Vite
  2. Administration panel — React/Vite
  3. Mobile application — Expo/React Native
  4. Backend API — NestJS/PostgreSQL

  Create a coherent design system that can be realistically implemented across
  public web, admin web, and mobile. Avoid concepts that only look attractive in a
  mockup but are difficult to build or reuse.

  VISUAL DIRECTION

  Create a clean, contemporary marketplace aesthetic inspired by modern consumer
  commerce applications, but do not copy any existing brand.

  The visual identity should feel:

  - Modern and trustworthy
  - Premium but approachable
  - Spacious without wasting screen space
  - Visually polished
  - Suitable for Mongolian users
  - Optimized for classified advertisements
  - Strong enough to present as a professional portfolio project

  Avoid:

  - Generic Bootstrap styling
  - Excessive gradients
  - Heavy glassmorphism
  - Oversized rounded cards everywhere
  - Excessive shadows
  - Cluttered dashboards
  - Tiny low-contrast text
  - Decorative elements without functional purpose
  - Desktop layouts simply compressed into mobile
  - Unrealistic placeholder functionality

  BRAND AND DESIGN SYSTEM

  Develop a distinctive but practical visual system.

  Suggested direction:

  - Primary color: deep indigo, cobalt blue, or sophisticated dark blue
  - Accent color: warm amber, coral, or emerald used selectively
  - Neutral palette: cool gray and off-white surfaces
  - Strong accessible text contrast
  - Light theme as the primary theme
  - Optional dark theme using the same semantic color tokens
  - Modern sans-serif typography that supports Mongolian Cyrillic
  - Consistent 4px or 8px spacing scale
  - Clear typography hierarchy
  - Small, medium, and large radius tokens
  - Subtle borders and restrained shadows
  - Lucide-style outline icons
  - Responsive grid and layout tokens

  Define reusable semantic tokens for:

  - Colors
  - Typography
  - Spacing
  - Radius
  - Shadows
  - Borders
  - Breakpoints
  - Container widths
  - Form states
  - Status colors
  - Focus indicators

  PUBLIC MARKETPLACE — DESKTOP WEB

  Design the following screens:

  1. Home and search results

  Include:

  - Compact sticky header
  - Recognizable BoZar logo
  - Search field as the primary interaction
  - Location selector
  - Category navigation
  - “Create listing” primary action
  - Favorites and account access
  - Hero or introductory section that does not dominate the screen
  - Popular categories
  - Recently added or recommended advertisements
  - Responsive advertisement grid
  - Loading skeletons
  - Empty results state
  - API error state

  2. Search and filters

  Include:

  - Keyword search
  - Category and subcategory
  - Location
  - Minimum and maximum price
  - Sort by newest, oldest, price ascending, and price descending
  - Desktop filter sidebar
  - Mobile filter bottom sheet
  - Active filter chips
  - Result count
  - Clear all filters
  - URL-friendly filter state

  3. Advertisement card

  Each card should support:

  - 4:3 image ratio
  - Price as the strongest information
  - Concise title
  - Location and relative date
  - Favorite toggle
  - Optional status badge
  - Graceful missing-image state
  - Clear hover, focus, pressed, and loading states

  Avoid turning every card into a floating panel with excessive shadows.

  4. Advertisement detail

  Include:

  - Responsive image gallery
  - Price and title
  - Location and publication date
  - Description
  - Category breadcrumbs
  - Seller summary
  - Contact actions
  - Favorite action
  - Report action
  - Related advertisements
  - Mobile sticky bottom contact bar
  - Sold or inactive advertisement state

  5. Authentication

  Design:

  - Login
  - Registration
  - Password change
  - Inline validation
  - Loading and error states
  - Clear distinction between phone number and email fields

  6. Account area

  Include:

  - Profile overview
  - Edit profile
  - Change password
  - My listings
  - Favorites
  - Logout
  - Responsive account navigation
  - Empty states

  7. Listing creation and editing

  Create an intuitive multi-section form:

  - Basic information
  - Category and subcategory
  - Price
  - Location
  - Description
  - Image upload, preview, reordering, and removal
  - Validation
  - Draft-like visual feedback where appropriate
  - Publishing progress
  - Success confirmation
  - Edit existing listing
  - Mark as sold
  - Deactivate
  - Soft delete confirmation

  Do not make the form an overly complicated wizard unless it materially improves
  mobile usability.

  8. System states

  Design:

  - 404 page
  - Unauthorized state
  - Offline state
  - Loading skeletons
  - Empty favorites
  - Empty personal listings
  - API failure with retry
  - Destructive confirmation dialog
  - Success and error toast notifications

  ADMINISTRATION PANEL — DESKTOP FIRST

  Create a professional operations-focused admin panel distinct from the consumer
  marketplace while sharing the same design tokens.

  Include:

  1. Admin login
  2. Dashboard
  3. User management
  4. Advertisement moderation
  5. Reports queue
  6. Category management
  7. Subcategory management
  8. Admin activity logs

  Admin layout:

  - Collapsible sidebar
  - Compact top bar
  - Breadcrumbs
  - Clear page title and contextual actions
  - Dense but readable data tables
  - Search, filters, sorting, and pagination
  - Status badges
  - Row actions
  - Confirmation dialogs
  - Loading, empty, and error states
  - Responsive tablet behavior

  Dashboard should include meaningful cards and charts for:

  - Total users
  - Total advertisements
  - Active advertisements
  - Open reports
  - Categories
  - Recent moderation activity

  Do not fill the dashboard with decorative charts that do not correspond to
  available project data.

  MOBILE APPLICATION

  Create native-feeling mobile screens instead of scaled-down desktop pages.

  Include:

  1. Home
  2. Search
  3. Filter bottom sheet
  4. Category browsing
  5. Advertisement details
  6. Favorites
  7. Create advertisement
  8. Edit advertisement
  9. My advertisements
  10. Profile
  11. Login and registration
  12. Report flow

  Use:

  - Bottom tab navigation
  - Native mobile spacing and touch targets
  - Safe-area awareness
  - Sticky bottom actions
  - Mobile image picker patterns
  - Pull-to-refresh where useful
  - Clear keyboard behavior
  - Bottom sheets for contextual filters and actions
  - Minimum 44px touch targets

  ACCESSIBILITY

  Ensure:

  - WCAG AA color contrast
  - Visible keyboard focus
  - Semantic headings
  - Form labels
  - Descriptive validation
  - Keyboard-accessible dialogs and menus
  - Reduced-motion compatibility
  - Status information that does not rely only on color
  - Touch targets suitable for mobile

  IMPLEMENTATION CONSTRAINTS

  The UI must be practical for:

  - React and Vite
  - React Native and Expo
  - Shared semantic design tokens
  - Reusable local components
  - REST API data
  - Responsive CSS without a heavy UI framework
  - Lucide icons on web
  - React Native-compatible equivalents on mobile

  Prefer reusable components such as:

  - AppHeader
  - SearchBar
  - CategoryGrid
  - FilterPanel
  - FilterChip
  - AdvertisementCard
  - AdvertisementGrid
  - PriceDisplay
  - StatusBadge
  - EmptyState
  - ErrorState
  - Skeleton
  - FormField
  - ImageUploader
  - ConfirmDialog
  - Toast
  - AccountNavigation
  - AdminSidebar
  - DataTable
  - Pagination
  - BottomSheet
  - MobileTabBar

  DELIVERABLES

  Generate:

  1. Visual direction and brand rationale
  2. Complete design-token specification
  3. Public web sitemap
  4. Admin sitemap
  5. Mobile navigation structure
  6. Desktop and mobile responsive layouts
  7. High-fidelity screens for all primary workflows
  8. Reusable component inventory
  9. Component variants and states
  10. Form validation and interaction states
  11. Loading, empty, error, success, and disabled states
  12. Responsive behavior documentation
  13. Developer handoff notes
  14. Example data using realistic Mongolian Cyrillic content

  Use realistic Mongolian labels and marketplace content in the interface. Do not
  use lorem ipsum.

  Produce a cohesive design that feels like a real, launch-ready Mongolian
  marketplace and a strong full-stack portfolio project.

  Илүү сайн үр дүн авахын тулд AI tool-д эхний ээлжид бүх системийг нэг дор
  зуруулахгүй, дараах дарааллаар хэсэгчлэн өгвөл тохиромжтой:

  1. Design system болон public web-ийн Home/Search
  2. Advertisement detail болон account
  3. Create/edit listing
  4. Admin panel
  5. Mobile application
  6. Бүх component-ийн loading/error/empty states