# MyClinic Admin (Beta) 🏥# MyClinic Admin - Your Personal Clinic Manager



**Your Personal Clinic Manager**A complete, modern clinic management system built with Next.js 14, TypeScript, TailwindCSS, and Supabase.



A modern, comprehensive clinic management web application designed for healthcare professionals to streamline patient care, appointment scheduling, and medical record management.![MyClinic Admin](https://img.shields.io/badge/Next.js-14-black)

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Storage-green)

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4)

## 🌟 Overview

## 🎯 Features

MyClinic Admin is a full-featured clinic management system built with cutting-edge web technologies. It provides healthcare professionals with an intuitive platform to manage their practice efficiently, focusing on patient care while automating administrative tasks.

### Authentication & Security

This is a **Beta version** currently in active development. We welcome feedback and suggestions for improvement.- 🔐 Secure email/password authentication via Supabase Auth

- 🔑 Password reset functionality

---- 🛡️ Row Level Security (RLS) policies

- 🔒 Protected routes with middleware

## ✨ Key Features- 👤 Single doctor/assistant account



### 📋 Patient Management### Dashboard

- **Comprehensive Patient Records**: Store detailed patient information including demographics, contact details, and medical history- 📊 Real-time KPIs (Total Patients, Appointments Today, Monthly Visits, Follow-ups)

- **Smart Search & Filtering**: Quickly find patients using powerful search and filtering capabilities- 🚀 Quick Actions (Add Patient, New Appointment)

- **Patient Categorization**: Organize patients with customizable labels (New Patient, Follow-up, Critical, VIP, etc.)- 📝 Recent Activity Feed

- **Direct Communication**: Integrated WhatsApp button for instant patient communication- 📈 Patient growth trends

- **Data Export**: Export patient data to Excel or PDF for reporting and analysis

### Patient Management

### 📅 Appointment Scheduling- 👥 Complete patient records with personal information

- **Flexible Scheduling**: Create and manage appointments with ease- 🔍 Advanced search and filtering

- **Multiple Visit Types**: Support for various appointment types (Consultation, Emergency, Routine Checkup, Follow-up)- 🏷️ Custom labels/tags (Diabetes, Hypertension, Follow-up, etc.)

- **Appointment Tracking**: Monitor appointment status (Scheduled, Completed, Cancelled)- 📱 Contact information management

- **Patient History**: View complete visit history with diagnoses and prescriptions- 📄 Patient profile pages with complete medical history

- **Quick Actions**: Schedule new appointments directly from patient profiles- 📊 Export to Excel (XLSX) and PDF



### 📊 Dashboard & Analytics### Appointments Module

- **Real-time KPIs**: Track total patients, daily appointments, monthly visits, and follow-ups- 📅 Comprehensive appointment scheduling

- **Performance Metrics**: Monitor clinic performance with monthly comparisons- 🕐 Date and time management

- **Recent Activity Feed**: Stay updated with latest patient registrations and appointments- 🏥 Multiple visit types (Appointment, Emergency, Routine Checkup, etc.)

- **Quick Actions**: Fast access to frequently used features- 💊 Diagnosis tracking

- **Personalized Welcome**: Dashboard greets you with your name- 📋 Additional notes support

- 📊 List and calendar views

### 👨‍⚕️ Professional Profile- 🔔 Status tracking (Scheduled, Completed, Cancelled)

- **User Profile Management**: Maintain professional information including name, specialty, and contact details

- **Secure Authentication**: Email/password authentication with Supabase Auth### Doctor/Assistant Profile

- **Password Management**: Change password securely when needed- 👨‍⚕️ Profile management

- **Personalized Experience**: Welcome messages and user-specific data throughout the app- 📧 Contact information updates

- 🔐 Password change functionality

### 🎨 User Experience- 🩺 Specialty information

- **Modern UI Design**: Clean, professional interface built with TailwindCSS

- **Smooth Animations**: Enhanced user experience with Framer Motion animations### File Management

- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices- 📎 Attachment support for lab reports, prescriptions, images

- **Mobile-First Approach**: Bottom navigation for easy mobile access- 📁 Secure file storage via Supabase Storage

- **Intuitive Navigation**: Clear, organized interface for efficient workflow- 🖼️ File preview and download



### 🔒 Security & Privacy## 🛠️ Tech Stack

- **Row Level Security**: Each user can only access their own data

- **Secure Authentication**: Industry-standard authentication with Supabase- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)

- **Data Isolation**: Complete separation of data between different healthcare providers- **Language**: [TypeScript](https://www.typescriptlang.org/)

- **Protected Routes**: Middleware-based route protection for secure access- **Styling**: [TailwindCSS](https://tailwindcss.com/)

- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Storage)

- **Database**: PostgreSQL (via Supabase)

## 🛠️ Technology Stack- **Icons**: [Lucide React](https://lucide.dev/)

- **Date Handling**: [date-fns](https://date-fns.org/)

### Frontend- **Export**: [xlsx](https://www.npmjs.com/package/xlsx), [jspdf](https://www.npmjs.com/package/jspdf)

- **Next.js 14**: React framework with App Router for modern web development

- **TypeScript**: Type-safe development for fewer bugs and better code quality## 📋 Prerequisites

- **TailwindCSS**: Utility-first CSS framework for rapid UI development

- **Framer Motion**: Smooth, performant animations and transitionsBefore you begin, ensure you have:

- **Lucide React**: Beautiful, consistent icon library

- Node.js 18.17 or later

### Backend & Database- npm or yarn package manager

- **Supabase**: Backend-as-a-Service providing authentication and PostgreSQL database- A Supabase account ([sign up here](https://supabase.com))

- **PostgreSQL**: Robust, reliable relational database

- **Row Level Security (RLS)**: Database-level security for data protection## 🚀 Getting Started

- **Real-time Capabilities**: Live data updates when needed

### 1. Install Dependencies

### Additional Libraries

- **date-fns**: Modern JavaScript date utility library```bash

- **xlsx**: Excel file generation for data exportsnpm install

- **jsPDF**: PDF generation for reports```

- **jsPDF-AutoTable**: Table plugin for PDF reports

### 2. Set Up Supabase

---

#### Create a New Supabase Project

## 🎯 Use Cases

1. Go to [supabase.com](https://supabase.com)

### For Individual Practitioners2. Click "New Project"

- Solo doctors managing their private practice3. Fill in your project details

- Healthcare professionals running small clinics4. Wait for the project to be created

- Specialists maintaining patient records and follow-ups

#### Run Database Schema

### For Small Clinics

- Multi-doctor clinics with shared patient management1. Go to your Supabase project dashboard

- Specialist centers requiring organized record-keeping2. Click on "SQL Editor" in the left sidebar

- Outpatient facilities needing efficient scheduling3. Copy the contents of `supabase/schema.sql`

4. Paste into the SQL Editor and click "Run"

### Key Benefits5. Wait for all tables, indexes, and policies to be created

- **Time-Saving**: Reduce administrative overhead

- **Organization**: Keep all patient data in one secure place### 3. Configure Environment Variables

- **Accessibility**: Access patient records from anywhere

- **Professional**: Present a modern, organized practice to patientsCreate a `.env.local` file in the root directory:

- **Compliance**: Maintain proper medical records and history

```bash

---cp .env.example .env.local

```

## 🌍 Regional Features

Update the values in `.env.local`:

### Pakistan-Specific Optimizations

- **Default Country Code**: Phone numbers automatically prefixed with +92```env

- **WhatsApp Integration**: Direct messaging for patient communication (widely used in Pakistan)NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

- **Local Time Zone**: Properly configured for Pakistan Standard TimeNEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```

---

**To find these values:**

## 📱 Feature Highlights1. Go to your Supabase project dashboard

2. Click on "Settings" → "API"

### Patient Records3. Copy the "Project URL" (NEXT_PUBLIC_SUPABASE_URL)

- Full name, age, gender, and contact information4. Copy the "anon public" key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

- Email and phone with WhatsApp quick-dial

- Residential address### 4. Run the Development Server

- Customizable patient labels for categorization

- Complete visit and appointment history```bash

- Medical attachments and documentation supportnpm run dev

```

### Appointments

- Date and time selectionOpen [http://localhost:3000](http://localhost:3000) in your browser.

- Visit type categorization

- Patient diagnosis recording### 5. Create Your Account

- Prescription and treatment notes

- Follow-up scheduling1. Click "Sign up" on the login page

- Appointment status tracking2. Fill in your details (name, email, phone, specialty, password)

3. Click "Create Account"

### Dashboard Metrics4. You'll be redirected to the dashboard

- **Total Patients**: Complete count of registered patients

- **Appointments Today**: Number of scheduled appointments for current day## 📦 Project Structure

- **Monthly Visits**: Appointments completed in current month with growth comparison

- **Follow-ups Due**: Upcoming follow-up appointments in next 7 days```

myclinic-admin/

### Data Management├── app/

- **Excel Export**: Download complete patient lists for offline analysis│   ├── (dashboard)/          # Protected dashboard routes

- **PDF Reports**: Generate professional PDF reports│   │   ├── appointments/     # Appointments module

- **Search Functionality**: Quick search across patient names│   │   ├── dashboard/        # Main dashboard

- **Filter Options**: Filter patients by labels and categories│   │   ├── patients/         # Patients module

│   │   ├── profile/          # User profile

---│   │   └── layout.tsx        # Dashboard layout

│   ├── auth/                 # Authentication pages

## 🔐 Data Security│   │   ├── login/

│   │   ├── signup/

### Authentication│   │   └── forgot-password/

- Secure email/password authentication│   ├── globals.css           # Global styles

- Session management with Supabase Auth│   ├── layout.tsx            # Root layout

- Protected routes with middleware│   └── page.tsx              # Landing page

- Automatic token refresh├── components/               # Reusable components

│   ├── AppointmentForm.tsx

### Database Security│   ├── BottomNavigation.tsx

- Row Level Security (RLS) policies on all tables│   ├── DashboardKPIs.tsx

- Users can only access their own data│   ├── PatientTable.tsx

- Cascade delete for data integrity│   ├── QuickActions.tsx

- Indexed queries for performance│   ├── RecentActivityFeed.tsx

│   └── Sidebar.tsx

### Privacy Considerations├── lib/

- No third-party analytics tracking│   └── supabase/            # Supabase client configs

- Data stored in secure Supabase infrastructure│       ├── client.ts        # Browser client

- HIPAA-compliant infrastructure available│       ├── server.ts        # Server client

- Regular security updates│       └── middleware.ts    # Auth middleware

├── types/

---│   └── database.types.ts    # Database TypeScript types

├── supabase/

## 🚀 Version Information│   └── schema.sql           # Database schema

├── middleware.ts            # Next.js middleware

**Current Version**: Beta v0.1.0└── package.json

```

### Beta Features

This beta version includes all core functionality:## 🎨 Features Walkthrough

- ✅ Complete patient management

- ✅ Appointment scheduling and tracking### Dashboard

- ✅ Dashboard with analytics- View key metrics at a glance

- ✅ User profile management- Quick access to add patients and appointments

- ✅ WhatsApp integration- See recent activity in real-time

- ✅ Export capabilities (Excel/PDF)

- ✅ Mobile-responsive design### Patients

- ✅ Secure authentication- Add new patients with complete information

- Search and filter by name, phone, email, or labels

### Planned Features (Coming Soon)- Export patient data to Excel or PDF

- 📊 Advanced analytics and reporting- View detailed patient profiles with visit history

- 💊 Prescription templates

- 📧 Email notifications for appointments### Appointments

- 📱 SMS reminders- Schedule appointments with detailed information

- 🔔 In-app notifications- Track diagnosis and treatment notes

- 📈 Revenue tracking- Link appointments to existing or new patients

- 👥 Multi-user support (staff accounts)- View appointment history

- 🗂️ Document management

- 📋 Custom forms and templates### Profile

- Update your personal information

---- Change your password securely

- Manage your specialty details

## 💡 Best Practices

## 📱 Responsive Design

### Data Entry

- Use consistent formatting for patient namesMyClinic Admin is fully responsive with:

- Always include contact information for follow-ups- **Desktop**: Sidebar navigation with full features

- Categorize patients with appropriate labels- **Tablet**: Optimized layout for medium screens

- Keep medical history updated- **Mobile**: Bottom navigation bar for easy thumb access

- Document all appointments thoroughly

## 🔒 Security

### Appointment Management

- Schedule appointments with buffer time- **Authentication**: Supabase Auth with email/password

- Use appropriate visit types for categorization- **Authorization**: Row Level Security (RLS) policies ensure data isolation

- Document diagnosis and treatment in notes- **Protected Routes**: Middleware guards all dashboard routes

- Mark completed appointments promptly- **Secure Storage**: File uploads protected by Supabase Storage policies

- Schedule follow-ups before patient leaves- **Data Privacy**: All records are tied to the authenticated user



### Security## 🚀 Deployment

- Use strong passwords

- Log out when not in use### Deploy to Vercel

- Regularly review patient data

- Keep profile information current1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com)

---3. Click "New Project"

4. Import your GitHub repository

## 📞 Support & Feedback5. Add environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`

As this is a beta version, we highly value your feedback and suggestions.   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

6. Click "Deploy"

### Reporting Issues

If you encounter any bugs or issues, please note:For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

- What you were trying to do

- What actually happened### Alternative: Vercel CLI

- Any error messages you received

- Your device and browser information```bash

npm install -g vercel

### Feature Requestsvercel

We welcome suggestions for new features that would improve your clinic management workflow.```



---Follow the prompts and add your environment variables when asked.



## 📜 License & Credits## 📊 Database Schema



### TechnologiesThe application uses the following main tables:

- Built with [Next.js](https://nextjs.org/)

- Powered by [Supabase](https://supabase.com/)- **users**: Doctor/assistant profiles

- Styled with [TailwindCSS](https://tailwindcss.com/)- **patients**: Patient records

- Icons by [Lucide](https://lucide.dev/)- **appointments**: Appointment scheduling and tracking

- **attachments**: File storage metadata

### Copyright

© 2025 MyClinic Admin. All rights reserved.See `supabase/schema.sql` for the complete schema.



---## 🤝 Contributing



## 🎓 AboutContributions are welcome! Please feel free to submit a Pull Request.



MyClinic Admin was created to help healthcare professionals focus on what matters most - patient care. By automating routine administrative tasks and providing intuitive tools for record management, we aim to make clinic management effortless and efficient.## 📄 License



**Version**: Beta v0.1.0  This project is licensed under the MIT License.

**Status**: Active Development  

**Target Users**: Individual Healthcare Practitioners & Small Clinics  ## 🆘 Support

**Region**: Optimized for Pakistan (but usable worldwide)

For issues, questions, or suggestions, please open an issue on GitHub.

---

## 🎉 Acknowledgments

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)

Special thanks to:- Backend powered by [Supabase](https://supabase.com/)

- Healthcare professionals who provided valuable feedback during development- UI components styled with [TailwindCSS](https://tailwindcss.com/)

- The open-source community for amazing tools and libraries- Animations by [Framer Motion](https://www.framer.com/motion/)

- Early beta testers for their patience and suggestions

---

---

Made with ❤️ for healthcare professionals

**MyClinic Admin Beta** - Your Personal Clinic Manager 🏥
