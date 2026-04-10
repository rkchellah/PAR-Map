Here is the final, comprehensive README.md for your project, incorporating the Luminous Curator design system, the Supabase architecture, and the specific operational requirements for your field teams in Lusaka.

🌍 Interactive Map
High-Performance Geospatial Dashboard & Portfolio Analytics
An advanced mapping platform built with Next.js 15 and Supabase, designed for real-time visualization of loan portfolio status and geographic territory management. This tool enables field teams to navigate complex urban environments like Lusaka while providing administrators with a powerful dashboard for risk analysis and layer management.

🎨 Design Philosophy: Luminous Curator
The application utilizes a professional, high-contrast light-mode theme designed for maximum visibility in the field:

Clarity: Tonal sidebars and glassmorphism navbars ensure essential metrics are scannable even in high-glare environments.

Typography: A refined mix of Manrope for the map interface, Inter for administrative tasks, and DM Mono for precise technical data.

Visual Status: Customer markers are color-coded by PAR status, with "Priority Visit" flags featuring a distinct red dot and yellow ring for immediate attention.

🚀 Key Features
Real-Time Portfolio Tracking: Monitor Total Portfolio, On-Time, and At-Risk (PAR) metrics across regional areas like Chilenje, Matero, and Kanyama.

Advanced Layer Management: Upload, rename, and recolor KMZ/KML/GeoJSON boundary layers.

Buffer Circle Generator: Create geodesic polygons (e.g., 1km/2km warehouse buffers) from CSV coordinates.

Role-Based Access: Secure /admin dashboard protected by Supabase Auth and Edge Middleware.

High Performance: Optimized with ssr: false for Leaflet and preferCanvas: true to handle thousands of data points smoothly on mobile.

🛠 Technical Stack
Layer	Technology
Framework	Next.js 15 (App/Pages Router)
Database/Auth	Supabase
Mapping	Mapbox + Leaflet
Parsing	JSZip (KMZ), PapaParse (CSV), DOMParser (KML)
Styling	Tailwind CSS + Luminous Tokens
📂 Project Architecture
Plaintext
src/
├── components/         
│   ├── Map.tsx         # Dynamic Leaflet implementation (No-SSR)
│   └── NavIcons.tsx    # Custom Luminous UI elements
├── data/
│   └── customers.ts    # Weekly PAR data (Updated via Admin)
├── lib/
│   ├── supabase.ts     # Client & lazy Admin client
│   ├── useAuth.ts      # Auth hook with race-condition fix
│   └── layerService.ts # KMZ persistence & visibility logic
├── utils/
│   └── kmzParser.ts    # Client-side file conversion
└── middleware.ts       # Edge-based session cookie protection
📋 Environment Variables
Create a .env.local file with the following keys:

Code snippet
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Server-only
🏗 Setup & Deployment
Install: npm install

Database: Execute the SQL migrations in Supabase to create profiles, kmz_layers, and teams tables.

Storage: Create a public storage bucket named kmz-files in your Supabase dashboard.

Admin Access: Promote a user to admin via the Supabase SQL editor:

SQL
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';
Deploy: Connect your repository to Vercel and add the environment variables listed above.

📈 Weekly Data Update Workflow
To update the customer data displayed on the map:

Export the latest PAR CSV from your loan management system.

Use the Admin Portal to upload the CSV, which generates the updated customers.ts.

The map will automatically refresh to reflect the new regional Risk % and priority visit flags.

🛡 Credits & Author
Author: Chella Kamina

Project: Interactive Map (PAR Map)

System: Luminous Curator UI

Optimized for ECS Fintech Lusaka field operations.