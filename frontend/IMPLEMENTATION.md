# Tithi Packers & Movers - Frontend Implementation

Technical documentation detailing styling configurations, API states, Zustand variables, back-office pages, and SEO specifications.

---

## 1. Project Overview & Tech Decisions

This application is built as a dark-mode-first premium frontend for "Tithi Packers & Movers". It utilizes Next.js 14 App Router (JavaScript) with custom Tailwind tokens mapped to standard CSS variables.

Key architectural choices:
- **Styling:** Tailwind CSS combined with custom global styles (`src/styles/globals.css`) defining colors, borders, and animations.
- **Animations:** Framer Motion is utilized for layout sliding, card floating, and shaking form actions.
- **State Management:** Zustand manages client-side authentication (`authStore`) and active multi-step booking data (`bookingStore`).
- **Data Fetching:** TanStack React Query (`react-query`) handles query caching, pagination tracking, and form mutation requests.

---

## 2. File Directory Structure

```
tithi-packers/
├── public/
│   ├── favicon.ico
│   ├── llms.txt               # AI crawler documentation file
│   └── robots.txt
│
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.js           # Server component for metadata and JSON-LD
│   │   ├── page.js             # Landing page
│   │   ├── about/page.js
│   │   ├── contact/page.js
│   │   ├── book/               # Shifting multi-step booking paths
│   │   │   ├── local-shifting/page.js
│   │   │   ├── intercity-moving/page.js
│   │   │   ├── packing-service/page.js
│   │   │   └── commercial-moving/page.js
│   │   ├── my-bookings/
│   │   │   ├── page.js         # Mobile OTP lookup and orders list
│   │   │   └── [id]/page.js    # Single invoice details report
│   │   ├── profile/page.js     # Customer profile settings
│   │   └── admin/              # Admin Console
│   │       ├── layout.js       # Admin layout panel (Header + Sidebar)
│   │       ├── page.js         # Dashboard index redirector
│   │       ├── dashboard/page.js
│   │       ├── bookings/
│   │       │   ├── page.js     # Filterable orders lists
│   │       │   └── [id]/page.js # Shifting checklist verification and Quote input
│   │       ├── pricing/page.js # Service rate editor
│   │       ├── users/page.js   # Customer directory listing
│   │       ├── analytics/page.js # Monthly revenue growth charts
│   │       ├── messaging/page.js # SMS alert composer
│   │       └── settings/page.js # General app configs
│   │
│   ├── components/
│   │   ├── ui/                 # Core reusable UI elements
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── AnimatedCounter.jsx
│   │   │
│   │   ├── layout/             # Site layouts
│   │   │   ├── Navbar.jsx      # Sticky navbar with mobile support
│   │   │   ├── Footer.jsx      # Shifting details and corporate addresses
│   │   │   ├── Providers.jsx   # Decoupled React Query client context
│   │   │   ├── AdminSidebar.jsx
│   │   │   └── AdminHeader.jsx
│   │   │
│   │   ├── home/               # Homepage sections
│   │   │   ├── HeroSection.jsx
│   │   │   ├── ServicesSection.jsx
│   │   │   ├── HowItWorksSection.jsx
│   │   │   ├── WhyChooseUsSection.jsx
│   │   │   ├── ServiceDetailSection.jsx
│   │   │   ├── TestimonialsSection.jsx
│   │   │   ├── CoverageMapSection.jsx
│   │   │   ├── FAQSection.jsx
│   │   │   └── CTABannerSection.jsx
│   │   │
│   │   └── booking/            # Multi-step booking views
│   │       ├── BookingLayout.jsx
│   │       ├── StepIndicator.jsx
│   │       ├── LocationStep.jsx
│   │       ├── TruckSelectionStep.jsx
│   │       ├── ItemSelectionStep.jsx
│   │       ├── SpecialServicesStep.jsx
│   │       ├── DateTimeStep.jsx
│   │       ├── ReviewStep.jsx
│   │       ├── OTPStep.jsx
│   │       ├── SuccessStep.jsx
│   │       ├── PackingSubTypeStep.jsx
│   │       ├── BusinessDetailsStep.jsx
│   │       └── TruckGuideModal.jsx
│   │
│   ├── data/
│   │   └── dummyData.js        # Global mock database
│   │
│   ├── lib/
│   │   ├── api.js              # API client handler
│   │   ├── queryClient.js      # React Query client initialization
│   │   └── utils.js            # Helpers (CN, formatCurrency, formatDate)
│   │
│   ├── store/
│   │   ├── bookingStore.js     # Zustand booking state
│   │   └── authStore.js        # Zustand authentication state
│   │
│   ├── hooks/
│   │   ├── useBooking.js       # Booking queries
│   │   ├── useAuth.js          # Authentication hooks
│   │   └── useAdmin.js         # Back-office admin hooks
│   │
│   └── styles/
│       └── globals.css
```

---

## 3. Mock Data & API Proxy Toggle

All application mock data resides at `src/data/dummyData.js`. The API wrapper at `src/lib/api.js` acts as a redirect agent depending on environment variables.

### Switching from Mock to Remote API
To connect the frontend to a running production database:
1. Edit `.env.local` or host settings:
   ```env
   NEXT_PUBLIC_USE_DUMMY=false
   NEXT_PUBLIC_API_URL=https://your-production-backend.com
   ```
2. Use the backend origin only. Frontend API helpers append the `/api` route prefix internally.

---

## 4. Zustand State Structures

### `bookingStore.js`
Tracks the active multi-step order values:
- `currentStep`: integer step index.
- `bookingData`: object containing pickup address, dropdown floor settings, assigned vehicle codes, checklist items, scheduled slots, and calculated service sums.
- `setStep()`, `updateBookingData()`, `nextStep()`, `prevStep()`, `resetBooking()`: methods updating forms.

### `authStore.js`
Stores customer credentials and validation checks:
- `user`: client object containing name, email, mobile.
- `token`: authorization string.
- `isAuthenticated`: boolean.
- `isAdmin`: boolean (checked via profile credentials or administrator permissions).
- `setUser()`, `logout()`, `initializeAuth()`: methods updating credentials.

---

## 5. Booking Workflows

1. **Local Shifting:**
   - Location details (Surat addresses) -> Truck assigned -> Inventory list checklist -> Add-ons checklist -> Date/Time slot -> Order Overview -> OTP verification -> Success confetti check.
2. **Intercity Shifting:**
   - Similar to Local Shifting, with additional options for Cargo Transit Insurance and standard part-load (LCL) vehicle assignments.
3. **Packing Only / Unpacking Only:**
   - Packing category choice -> Single address details -> Checklist volumes -> Special boxes -> Date/Time slot -> OTP -> Success confetti.
4. **Commercial Office Moves:**
   - Office properties form (premises size, team count) -> Route addresses ->assigned truck sizes -> Inventory details -> Special corporate specifications -> OTP check -> Success confetti.

---

## 6. Back-Office Admin Panel

Access dashboard features via `/admin/dashboard` (uses local storage values).
- **Dashboard:** Stat rows (Confirmed, Pending verification), daily bookings curves (LineChart), service distributions (DonutChart), and recent orders.
- **Bookings Lookup:** Filters bookings list by status types, shifting categories, or ID searches. Includes pagination support.
- **Order Details:** Displays customer details, addresses,assigned truck sizes, inventory checklist table, custom manual quote inputs, and status dropdowns.
- **Pricing Editor:** Allows adjusting base add-on rates (AC removal, packaging materials) inline. Includes toggles for active status.
- **Analytics Details:** Business statistics, average order valuations, highest demand services, and progress bars.

---

## 7. SEO Configurations & Web Indexing

- **Metadata API:** Root titles, description summaries, canonical alternates, robots controls, openGraph cards, and Twitter layouts are configured inside `src/app/layout.js`.
- **JSON-LD Schema:** Injected inside layout HTML headers specifying the `MovingCompany` schema to help Google show rich snippets in search results.
- **Sitemap XML:** Generates dynamic URLs from `src/app/sitemap.js`.
- **Robots.txt:** Serves instructions from `src/app/robots.js`.
- **LLMs.txt:** Located at `/llms.txt` for AI assistant crawler parsing.
