# SAMS Frontend (Angular 21 + TailwindCSS)

This project is the frontend for the **SAMS Educational Center Management System**, built using:

- **Angular 21 (Standalone Components)**
- **TailwindCSS**
- **Role-based dashboards**
- **Clean scalable architecture**

### User Roles:
- `admin`
- `center_admin`
- `teacher`
- `assistant`
- `parent`
- `student`

### Dashboard Grouping:
| Roles | Dashboard |
|-------|-----------|
| admin | **Admin Dashboard** (exclusive) |
| center_admin, teacher, assistant | **Shared Staff Dashboard** |
| parent, student | **Shared Family Dashboard** |

---

# 📁 Project Structure (With Descriptions)

Below is the complete project structure including **comments explaining each folder and file**.

```txt
src/
└── app/
    ├── core/                                   # Core global logic for the entire app
    │   ├── auth/                               # Authentication/Authorization logic
    │   │   ├── auth.service.ts                 # Login, register, logout, token refresh
    │   │   ├── auth.guard.ts                   # Blocks access if user is not authenticated
    │   │   ├── role.guard.ts                   # Checks user role before loading dashboard
    │   │   └── token-storage.service.ts        # Handles token and user data storage
    │   │
    │   ├── interceptors/                       # HTTP interceptors
    │   │   ├── auth.interceptor.ts             # Attaches JWT token to API requests
    │   │   └── error.interceptor.ts            # Global error handler (401/500/etc)
    │   │
    │   ├── services/                           # Global reusable services
    │   │   ├── api.service.ts                  # Generic HTTP API wrapper
    │   │   ├── notification.service.ts         # Toast and alert service
    │   │   └── loading.service.ts              # Controls global loading spinner
    │   │
    │   ├── models/                             # TypeScript interfaces and types
    │   │   ├── user.model.ts                   # User interface with role
    │   │   ├── group.model.ts                  # Groups data model
    │   │   └── assessment.model.ts             # Assessment data model
    │   │
    │   └── utils/                              # Utility helper functions
    │       └── date.util.ts                    # Example date formatting utility
    │
    ├── shared/                                 # Reusable UI blocks + pipes + directives
    │   ├── components/                         # Shared UI components
    │   │   ├── navbar/                         # Global navigation bar
    │   │   │   └── navbar.component.ts
    │   │   ├── footer/                         # Global footer
    │   │   │   └── footer.component.ts
    │   │   └── sidebar/                        # Sidebar used inside dashboards
    │   │       └── sidebar.component.ts
    │   │
    │   ├── ui/                                 # Tailwind UI kit components
    │   │   ├── button/                         # Reusable button component
    │   │   │   └── button.component.ts
    │   │   ├── card/                           # Reusable card wrapper
    │   │   │   └── card.component.ts
    │   │   └── modal/                          # Popup modal component
    │   │       └── modal.component.ts
    │   │
    │   ├── directives/                         # Custom Angular directives
    │   │   └── role.directive.ts               # Show/hide elements based on role
    │   │
    │   ├── pipes/                              # Custom pipes
    │   │   └── capitalize.pipe.ts              # Example pipe
    │   │
    │   └── shared.module.ts (optional)         # Optional grouping for standalone components
    │
    ├── layout/                                 # Page layout wrappers
    │   ├── public-layout/                      # Layout for public pages (home/login/register)
    │   │   └── public-layout.component.ts
    │   │
    │   └── dashboard-layout/                   # Layout for all dashboard pages
    │       └── dashboard-layout.component.ts
    │
    ├── features/                               # All main features grouped here
    │   ├── public/                             # Public pages
    │   │   └── home/
    │   │       └── home.component.ts           # Landing page with services info + login/register
    │   │
    │   ├── auth/                               # Authentication screens
    │   │   ├── login/                          # Login page
    │   │   │   └── login.component.ts
    │   │   ├── register/                       # Registration page
    │   │   │   └── register.component.ts
    │   │   └── auth.routes.ts                  # Routes for /auth/*
    │   │
    │   ├── admin-dashboard/                    # ADMIN-ONLY dashboard
    │   │   ├── pages/
    │   │   │   ├── overview/                   # Admin overview page
    │   │   │   │   └── admin-overview.component.ts
    │   │   │   ├── centers-management/         # Manage centers
    │   │   │   │   └── centers-management.component.ts
    │   │   │   └── users-management/           # Manage all users
    │   │   │       └── users-management.component.ts
    │   │   └── admin.routes.ts                 # /dashboard/admin routes
    │   │
    │   ├── staff-dashboard/                    # Shared dashboard (center_admin / teacher / assistant)
    │   │   ├── pages/
    │   │   │   ├── staff-overview/             # Staff dashboard home page
    │   │   │   │   └── staff-overview.component.ts
    │   │   │   ├── groups/                     # Group management/viewing
    │   │   │   │   └── groups.component.ts
    │   │   │   └── attendance/                 # Attendance tracking
    │   │   │       └── attendance.component.ts
    │   │   └── staff.routes.ts                 # /dashboard/staff routes
    │   │
    │   ├── family-dashboard/                   # Shared dashboard (parent / student)
    │   │   ├── pages/
    │   │   │   ├── family-overview/            # Dashboard home for parent/student
    │   │   │   │   └── family-overview.component.ts
    │   │   │   ├── timetable/                  # Student schedule
    │   │   │   │   └── timetable.component.ts
    │   │   │   └── results/                    # Exams, assessments, grades
    │   │   │       └── results.component.ts
    │   │   └── family.routes.ts                # /dashboard/family routes
    │   │
    │   └── dashboard.routes.ts                 # Determines which dashboard a role can access
    │
    ├── app.routes.ts                           # Main routing file for the entire app
    └── app.component.ts                        # Root component
