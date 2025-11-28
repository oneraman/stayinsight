# StayInsight - Customer Retention Analytics Platform

## Project Overview

StayInsight is an AI-driven customer retention analytics platform that transforms customer data into actionable insights. The platform helps businesses identify at-risk customers, predict churn, and implement data-driven retention strategies.

## Technology Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage, Edge Functions)
- **AI Integration**: Google Generative AI (Gemini)
- **Charts**: Recharts
- **State Management**: React Context API
- **Routing**: React Router DOM v6

## Core Features

### 1. **User Authentication**
- Email/password authentication
- Google OAuth integration
- Protected routes with user session management
- User profile management

### 2. **Customer Data Management**
- CSV/Excel file upload with intelligent column mapping
- AI-powered column detection (adapts to any data format)
- Secure file storage in Supabase Storage
- Complete user data isolation (RLS policies + frontend filtering)
- Upload history tracking with file download capability

### 3. **AI-Powered Analytics**
- **Intelligent Column Mapper**: Automatically identifies customer data fields regardless of column names
- **Enhanced Risk Scoring**: Multi-factor risk assessment (0-100 scale)
- **AI Insights Engine**: Generates portfolio-wide insights and customer-specific recommendations
- **Churn Analysis**: Predicts customer churn probability
- **Customer Segmentation**: Automatic categorization of customers

### 4. **Interactive Dashboard**
- Real-time KPI cards (Total Customers, At-Risk Customers, Churn Rate, Revenue at Risk)
- Interactive charts with hover tooltips:
  - Line chart (Revenue trends)
  - Pie chart (Customer segmentation)
  - Area chart (Retention rate)
  - Bar chart (Monthly metrics)
- Time filters (7 days, 30 days, 90 days)
- AI-generated insights with recommended actions
- Data export functionality (CSV/Excel)
- Refresh and clear data capabilities

### 5. **Customer Management**
- Searchable customer table with filters
- Sorting and pagination
- Risk-based row highlighting
- Detailed customer profiles with:
  - Customer value metrics
  - Risk assessment breakdown
  - AI-powered churn analysis
  - Recommended retention actions

### 6. **Data Chat**
- Conversational AI interface for data queries
- Persistent chat sessions stored in Supabase
- Context-aware responses based on customer data
- Session history management

### 7. **Settings & Customization**
- Profile settings management
- Notification preferences
- Appearance settings (theme customization)

## Database Schema

### Tables

1. **customers**
   - Stores all customer data with intelligent field mapping
   - Fields: customer_id, name, email, age, gender, segment, subscription_type, tenure, purchase_count, total_spent, avg_order_value, last_purchase_date, risk_score, payment_delay, support_calls, usage_frequency
   - RLS policies for user isolation

2. **upload_sessions**
   - Tracks file uploads and processing status
   - Fields: file_name, file_size, file_path, file_url, storage_bucket, status, total_rows, processed_rows, error_message
   - Linked to Supabase Storage

3. **data_chat_sessions**
   - Manages chat conversation sessions
   - Fields: title, last_message_at, user_id

4. **data_chat_messages**
   - Stores individual chat messages
   - Fields: session_id, role, content, user_id

5. **roles & user_roles**
   - Role-based access control system

### Storage Buckets
- **uploaded-files**: Secure storage for customer data files

### Edge Functions
- **data-chat**: Handles AI-powered chat interactions with customer data

## Key Deliverables

### ✅ Completed Features

1. **Secure Multi-User Platform**
   - Complete user authentication system
   - Data isolation between users
   - Role-based access control

2. **Intelligent Data Processing**
   - AI-powered column detection and mapping
   - Handles various CSV/Excel formats automatically
   - Robust data validation and processing

3. **Comprehensive Analytics Dashboard**
   - Real-time metrics and KPIs
   - Interactive visualizations
   - AI-generated insights
   - Export capabilities

4. **Customer Intelligence**
   - Risk scoring algorithm
   - Churn prediction
   - Customer segmentation
   - Detailed customer profiles

5. **Conversational Data Interface**
   - AI chat for data queries
   - Persistent conversation history
   - Natural language data exploration

6. **File Management System**
   - Secure file upload and storage
   - Upload history with file access
   - Status tracking and error handling

## Changelog - Major Updates

### Phase 1: Initial Setup & Architecture
- ✅ Project initialization with React + Vite + TypeScript
- ✅ Supabase integration for backend
- ✅ Authentication system with email/password and Google OAuth
- ✅ Database schema design with RLS policies
- ✅ UI component library setup (Shadcn/ui)

### Phase 2: Data Processing & Storage
- ✅ File upload interface implementation
- ✅ CSV/Excel parsing functionality
- ✅ Supabase Storage integration for file persistence
- ✅ Upload sessions tracking in database
- ✅ File storage manager with download capabilities

### Phase 3: User Data Isolation
- ✅ Implemented complete data isolation between users
- ✅ Frontend query filtering by user ID across all pages
- ✅ Enhanced RLS policies for backend security
- ✅ Authentication guards on all protected routes

### Phase 4: AI-Powered Analysis
- ✅ Intelligent column mapper for flexible data formats
- ✅ AI-based risk scoring engine
- ✅ Enhanced metrics calculator
- ✅ AI insights generation engine
- ✅ Customer-specific recommendation system

### Phase 5: Chat Functionality
- ✅ Data chat page with AI integration
- ✅ Persistent chat sessions in database
- ✅ Chat message storage with RLS
- ✅ Edge function for chat processing
- ✅ Session management and history

### Phase 6: Dashboard & Visualizations
- ✅ Modern SaaS design system implementation
- ✅ KPI cards with real-time data
- ✅ Interactive charts (line, pie, area, bar)
- ✅ AI insights panel with actionable recommendations
- ✅ Enhanced customer table with filters and search
- ✅ Time range filters (7/30/90 days)

### Phase 7: Customer Profiles
- ✅ Detailed customer profile pages
- ✅ Customer value metrics display
- ✅ Risk assessment breakdown
- ✅ AI churn analysis component
- ✅ Recommended retention actions

### Phase 8: Settings & Customization
- ✅ Settings page with tabs (Profile, Notifications, Appearance)
- ✅ Profile settings management
- ✅ Notification preferences
- ✅ Theme customization options

### Phase 9: Code Optimization & Cleanup
- ✅ Removed 46 unused files and components
- ✅ Cleaned up unused data processors
- ✅ Simplified upload wizard
- ✅ Optimized dashboard metrics hooks
- ✅ Removed deprecated dashboard components

### Phase 10: Branding Update
- ✅ Updated from "StayInsightAI" to "StayInsight"
- ✅ Updated all metadata and SEO tags
- ✅ Updated navigation and sidebar branding
- ✅ Updated footer copyright
- ✅ Updated settings descriptions

## Design System

### Color Palette
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #9333ea (Purple)
- **Risk Colors**:
  - Low: #22c55e (Green)
  - Medium: #f59e0b (Orange)
  - High: #ef4444 (Red)

### Typography
- **Font Family**: Inter (imported from Google Fonts)
- **Heading Scale**: Responsive with bold weights
- **Body Text**: Regular weight with proper line heights

### Components
- Clean flat cards with subtle shadows
- Consistent border radius (rounded-lg, rounded-xl)
- Hover states with smooth transitions
- Focus states for accessibility

## File Structure

```
├── public/
│   ├── lovable-uploads/        # User-uploaded images
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── customer-profile/   # Customer detail components
│   │   ├── dashboard/          # Dashboard components (Modern*)
│   │   ├── data-export/        # Export functionality
│   │   ├── layouts/            # Page layouts
│   │   ├── settings/           # Settings components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── upload/             # File upload components
│   │   ├── AuthForm.tsx
│   │   ├── CustomerSearch.tsx
│   │   ├── EnhancedFileUploader.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Theme management
│   ├── hooks/
│   │   ├── useChartData.ts     # Chart data processing
│   │   ├── useCustomerProfile.ts
│   │   ├── useDashboardMetrics.ts
│   │   └── useUploadProgress.ts
│   ├── integrations/
│   │   └── supabase/           # Supabase client & types
│   ├── lib/
│   │   ├── enhancedGemini.ts   # AI integration
│   │   ├── gemini.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── CustomerProfile.tsx
│   │   ├── Customers.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DataChat.tsx
│   │   ├── Index.tsx           # Landing page
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   ├── Settings.tsx
│   │   ├── Signup.tsx
│   │   └── UploadHistory.tsx
│   ├── utils/
│   │   ├── advancedColumnMapper.ts
│   │   ├── aiInsightsEngine.ts
│   │   ├── customerUtils.ts
│   │   ├── dataExport.ts
│   │   ├── dataProcessing.ts
│   │   ├── dataValidation.ts
│   │   ├── intelligentColumnMapper.ts
│   │   ├── riskScoring.ts
│   │   ├── robustDataProcessor.ts
│   │   └── simplifiedDataProcessor.ts
│   └── workers/
│       └── dataProcessor.worker.ts
├── supabase/
│   ├── config.toml
│   ├── functions/
│   │   ├── _shared/cors.ts
│   │   └── data-chat/index.ts
│   └── migrations/             # Database migrations
└── index.html
```

## Security Features

1. **Row Level Security (RLS)**
   - All tables have RLS policies enabled
   - Users can only access their own data
   - Authenticated access required for all operations

2. **Frontend Filtering**
   - Additional user ID filtering on all queries
   - Double-layer security (RLS + frontend)
   - Protected routes with authentication guards

3. **File Security**
   - Secure file upload with size limits
   - User-isolated storage buckets
   - RLS policies on storage access

4. **Authentication**
   - Secure password hashing (Supabase Auth)
   - OAuth integration with Google
   - JWT token management
   - Session persistence

## Performance Optimizations

1. **Code Splitting**
   - Route-based code splitting with React Router
   - Lazy loading of components

2. **Data Fetching**
   - Efficient Supabase queries with proper indexes
   - React Query for caching (Tanstack Query)
   - Optimized re-renders with React hooks

3. **Asset Optimization**
   - Vite for fast builds and hot module replacement
   - Tailwind CSS purging for minimal CSS bundle
   - Font optimization with Google Fonts preconnect

4. **Codebase Cleanup**
   - Removed 46 unused files (reduced bundle size ~45KB+)
   - Simplified data processing pipeline
   - Eliminated duplicate components

## Future Enhancement Opportunities

1. **Advanced Analytics**
   - Predictive models for customer lifetime value
   - Automated email reports with insights
   - Customer health timeline visualization
   - Trend forecasting

2. **Data Quality**
   - Pre-upload data validation with confidence scores
   - Column detection preview before processing
   - Data quality metrics dashboard

3. **Collaboration**
   - Team workspaces
   - Shared dashboards and reports
   - Comment threads on customer profiles

4. **Integrations**
   - CRM integration (Salesforce, HubSpot)
   - Email marketing platforms
   - Customer support tools
   - Payment processors

5. **Mobile Experience**
   - Progressive Web App (PWA)
   - Mobile-optimized dashboard
   - Push notifications

## Environment Variables

```
VITE_SUPABASE_PROJECT_ID=zxylfinmwajovdlwzjox
VITE_SUPABASE_PUBLISHABLE_KEY=[anon key]
VITE_SUPABASE_URL=https://zxylfinmwajovdlwzjox.supabase.co
```

## Installation & Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Contributing Guidelines

- Follow the existing code structure and patterns
- Use TypeScript for type safety
- Implement proper error handling
- Add comments for complex logic
- Test changes across different user scenarios
- Maintain data isolation principles

## Support & Documentation

- Project uses Lovable platform for development
- Supabase documentation: https://supabase.com/docs
- React documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

**Last Updated**: 2025-11-28  
**Version**: 1.0.0  
**Status**: Production Ready
