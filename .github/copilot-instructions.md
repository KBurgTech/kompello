# Kompello Project - GitHub Copilot Instructions

## Project Overview
Kompello is a billing/invoicing application aimed at self-employed people. The project uses a hybrid architecture with Django REST Framework for the backend API and React with React Router for the frontend SPA.

## Technology Stack

### Backend
- **Framework**: Django 5.1.5+
- **API**: Django REST Framework (DRF) 3.15.2+
- **Authentication**: django-allauth with MFA support (headless mode for API)
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Database**: SQLite (development), models support PostgreSQL/MySQL for production
- **Permissions**: django-guardian (object-level permissions)
- **Auditing**: django-auditlog (tracks model changes)
- **Other**: django-cors-headers, django-filter

### Frontend
- **Framework**: React 19.1.0
- **Routing**: React Router 7.5+ (SPA mode, SSR disabled)
- **Build Tool**: Vite 6.3.3
- **Styling**: TailwindCSS 4.1.4 with shadcn/ui components
- **State Management**: @tanstack/react-query 5.79.0
- **Forms**: react-hook-form 7.56.4 + zod 3.25.23 validation
- **Tables**: @tanstack/react-table 8.21.3
- **Internationalization**: i18next 25.2.1 + react-i18next (en, de supported)
- **UI Components**: Radix UI primitives + custom components
- **Icons**: lucide-react
- **Type Generation**: OpenAPI Generator (typescript-fetch)

### Development Environment
- **Python**: >=3.12
- **Node.js**: Version with npm support
- **Dev Container**: Debian GNU/Linux 11 (bullseye)
- **Package Managers**: uv (Python), npm (Node.js)

## Project Structure

### Backend (`/workspaces/kompello/kompello/`)
```
kompello/
├── app/                       # Django project configuration
│   ├── settings.py           # Main settings file
│   ├── urls.py               # Root URL configuration
│   ├── config.py             # Custom config loader (config.json)
│   └── wsgi.py/asgi.py       # WSGI/ASGI entry points
├── core/                      # Main application
│   ├── models/               # Domain models (organized by concern)
│   │   ├── auth_models.py    # KompelloUser (custom user model)
│   │   ├── base_models.py    # BaseModel, HistoryModel abstracts
│   │   ├── company_models.py # Company model
│   │   └── custom_field_models.py  # CustomFieldDefinition, CustomFieldInstance
│   ├── serializers/          # DRF serializers (organized by concern)
│   │   ├── base_serializers.py     # Shared serializers
│   │   ├── user_serializers.py     # User serializers
│   │   └── company_serializers.py  # Company serializers
│   ├── views/
│   │   ├── api/              # DRF ViewSets and API views
│   │   │   ├── base.py       # BaseModelViewSet
│   │   │   ├── user.py       # UserViewSet
│   │   │   ├── company.py    # CompanyViewSet
│   │   │   └── system.py     # SystemApiViews (CSRF, health checks)
│   │   └── frontend/         # Frontend serving views
│   │       └── vite_view.py  # ViteView (serves React SPA)
│   ├── permissions.py        # Custom DRF permissions
│   ├── urls.py              # Core app URL routing
│   ├── tests/               # Test files (*_test.py naming convention)
│   └── migrations/          # Database migrations
└── db.sqlite3               # SQLite database (development)
```

### Frontend (`/workspaces/kompello/kompello-web/`)
```
kompello-web/
├── app/
│   ├── root.tsx             # Root layout component
│   ├── routes.ts            # Route configuration
│   ├── i18n.ts              # i18next configuration
│   ├── components/          # Reusable components
│   │   ├── authContext.tsx  # Authentication context provider
│   │   ├── dataTable.tsx    # Generic data table component
│   │   ├── appLayout.tsx    # Main app layout
│   │   ├── privateRoute.tsx # Route guard for authenticated routes
│   │   ├── ui/              # shadcn/ui components
│   │   ├── account/         # User account components
│   │   ├── company/         # Company management components
│   │   └── sideBar/         # Sidebar components
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── utils.ts         # Utility functions (cn helper)
│   │   └── api/             # Generated API clients
│   │       ├── kompelloApi.ts    # API wrapper with auth middleware
│   │       ├── kompello/         # Generated from kompello.yaml
│   │       └── allauth/          # Generated from allauth.yaml
│   ├── locales/             # Translation files
│   │   ├── en.json
│   │   └── de.json
│   └── routes/              # Route components (file-based routing)
├── openapi/                 # OpenAPI specs for client generation
│   ├── kompello.yaml
│   └── allauth.yaml
├── build/                   # Vite build output
├── vite.config.ts          # Vite configuration
├── react-router.config.ts  # React Router configuration (SPA mode)
└── package.json            # Frontend dependencies
```

## Coding Conventions & Patterns

### Backend (Django/Python)

#### Models
- **All models inherit from `BaseModel`** which provides:
  - `uuid`: UUIDField (default=uuid.uuid4, non-editable)
  - `modified_on`: DateTimeField (auto_now=True)
  - `created_on`: DateTimeField (auto_now_add=True)
- **Auditable models also inherit from `HistoryModel`** which adds:
  - `history`: AuditlogHistoryField for tracking changes
- **Custom user model**: `KompelloUser` (extends AbstractUser, uses email as USERNAME_FIELD)
- Use explicit `related_name` for ForeignKey/ManyToMany relationships

#### ViewSets
- **All ViewSets inherit from `BaseModelViewSet`** which:
  - Uses `uuid` as lookup_field (not `pk`)
  - Requires authentication by default (`IsAuthenticated`)
  - Supports per-action permission classes via decorator pattern
- **Permission pattern**: Use `@permission_classes()` decorator on individual actions
  - Supports OR logic: `@permission_classes([PermissionA | PermissionB])`
  - Use `NoOne` permission to explicitly disable endpoints (e.g., destroy)
- **Use drf-spectacular decorators** for API documentation:
  - `@extend_schema()` for operation metadata
  - `@action()` for custom actions

#### Serializers
- Place serializers in domain-specific files (e.g., `user_serializers.py`)
- Use shared serializers (e.g., `UuidListSerializer`) from `base_serializers.py`

#### Tests
- Test files use `*_test.py` naming convention (not `test_*.py`)
- Inherit from `BaseTestCase` (provides helper methods)
- Use descriptive test method names with docstrings
- Organize tests by ViewSet actions (test_create, test_list, etc.)

#### URLs
- Use `SimpleRouter` for ViewSet registration
- Namespace URLs with `app_name = "core"`
- Reverse URLs with namespace: `reverse("core:users-list")`

#### Configuration
- Load config from `config.json` via `kompello.app.config.CONFIG`
- Available settings: `APP_SECRET`, `DEBUG`, `LOGGING_LEVEL`

### Frontend (React/TypeScript)

#### Components
- Use **functional components** with TypeScript
- Place reusable components in `app/components/`
- Use shadcn/ui conventions:
  - Components in `app/components/ui/` for base UI
  - Use `cn()` utility for className merging (from `~/lib/utils`)
  - Variants with `class-variance-authority` (cva)

#### State Management
- **Use @tanstack/react-query** for server state
  - Queries for fetching data
  - Mutations for updates
  - Cache invalidation patterns
- **Use Context** for global app state:
  - `AuthContext` for authentication
  - `ThemeContext` for theme management
  - `TitleContext` for page titles

#### API Integration
- **Never call API directly** - always use `KompelloApi` wrapper from `~/lib/api/kompelloApi`
- API client includes:
  - Automatic CSRF token handling
  - Credential inclusion (session cookies)
  - Middleware for authentication
- **Regenerate API clients** when OpenAPI specs change:
  - `npm run api_kompello` for backend API
  - `npm run api_allauth` for authentication API

#### Routing
- Use **file-based routing** in `app/routes/` directory
- React Router 7 in SPA mode (SSR disabled)
- Use `<PrivateRoute>` wrapper for authenticated routes
- Route types available via `./+types/routeName`

#### Forms
- Use **react-hook-form** with **zod** validation
- Pattern:
  ```tsx
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { ... }
  })
  ```

#### Internationalization
- Use `useTranslation()` hook: `const { t } = useTranslation()`
- Keys in `app/locales/{lang}.json`
- Change language via `changeLanguage(lng)` from `~/i18n`

#### Styling
- **TailwindCSS 4** with custom theme
- Use semantic class names from design system
- Dark mode support via `ThemeContext`
- Responsive design with mobile-first approach

#### Tables
- Use `<DataTable>` component with @tanstack/react-table
- Define columns with `ColumnDef<TData, TValue>[]`
- Example in `app/components/dataTable.tsx`

## Key Architectural Decisions

### Authentication & Sessions
- **Django-allauth headless mode** for API-based authentication
- **Session-based auth** (not JWT) - cookies handled automatically
- CSRF protection enabled for non-GET/HEAD requests
- AllAuth handles: login, logout, signup, password reset, MFA

### API Design
- **RESTful API** with DRF ViewSets
- **UUID-based lookups** (not integer PKs) for security
- **OpenAPI schema** at `/api/schema/` and Swagger UI at `/api/schema/swagger-ui/`
- **Versioning**: Not yet implemented (consider in future)

### Frontend-Backend Integration
- **Frontend served by Django** in production (ViteView serves build output)
- **CORS enabled** for development (localhost:5173)
- **Static files** from Vite build copied to Django STATICFILES_DIRS
- **API base URL**: http://localhost:8000 (configurable in kompelloApi.ts)

### Custom Fields System
- **Extensible metadata** via `CustomFieldDefinition` and `CustomFieldInstance`
- Generic relations to attach fields to any model
- Company-scoped custom fields
- Data types: TEXT, NUMBER, BOOLEAN
- Optional history tracking per field

### Object-Level Permissions
- **django-guardian** for granular permissions
- Custom permissions per ViewSet action
- Company membership checks (e.g., `IsMemberOfCompany`)
- User ownership checks (e.g., `OwnUserObjectPermission`)

### Audit Logging
- **django-auditlog** tracks all changes to auditable models
- Accessible via `model.history.all()`
- Middleware captures user context automatically

## Development Workflow

### Backend Development
1. Create/modify models → `python manage.py makemigrations` → `python manage.py migrate`
2. Create serializers for new models
3. Create ViewSet with appropriate permissions
4. Register ViewSet in `core/urls.py`
5. Update OpenAPI spec: access `/api/schema/` and copy to `kompello-web/openapi/kompello.yaml`
6. Write tests in `core/tests/*_test.py`

### Frontend Development
1. Generate API clients after schema updates: `npm run api_kompello`
2. Create route components in `app/routes/`
3. Use shadcn/ui components from `app/components/ui/`
4. Add translations to `app/locales/{lang}.json`
5. Use `KompelloApi` for all backend communication
6. Build: `npm run build` → outputs to `build/client/`

### Running the Project
- **Backend**: `python manage.py runserver` (port 8000)
- **Frontend Dev**: `npm run dev` (port 5173, proxies to backend)
- **Frontend Prod**: Django serves built files via ViteView

### Testing
- **Backend**: `python manage.py test kompello.core.tests`
- **Frontend**: Not yet configured (consider adding Vitest/Jest)

## Common Patterns to Follow

### Adding a New API Endpoint
```python
# In ViewSet
@extend_schema(
    request=RequestSerializer,
    responses={200: ResponseSerializer},
    description="Endpoint description",
    operation_id="unique_operation_id",
)
@action(detail=True, methods=["post"])
@permission_classes([CustomPermission | permissions.IsAdminUser])
def custom_action(self, request: Request, uuid=None):
    obj = self.get_object()
    # ... logic ...
    return Response(serializer.data)
```

### Creating a New Model
```python
from kompello.core.models.base_models import BaseModel, HistoryModel

class MyModel(BaseModel, HistoryModel):
    name = models.CharField(max_length=255)
    # ... fields ...
    
    class Meta:
        db_table = 'core_mymodel'
        ordering = ['-created_on']
```

### Using the API in Frontend
```typescript
import { KompelloApi } from "~/lib/api/kompelloApi";
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['myData'],
    queryFn: () => KompelloApi.usersApi.usersMe()
  });
  
  // ... component logic ...
}
```

### Creating a shadcn/ui Component
```tsx
import { cn } from "~/lib/utils"

interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary"
}

export function MyComponent({ className, variant = "default", ...props }: MyComponentProps) {
  return (
    <div className={cn("base-classes", className)} {...props} />
  )
}
```

## Important Notes

### Security
- Never expose SECRET_KEY in production
- Use environment variables for sensitive config
- CSRF tokens required for mutating requests
- UUID lookups prevent enumeration attacks
- Row-level permissions enforced on all ViewSets

### Performance
- Database: Currently SQLite (dev only) - use PostgreSQL in production
- Frontend: Code splitting via React Router's lazy loading
- API: Pagination enabled on list endpoints
- Consider adding database indexes on frequently queried fields

### Future Considerations
- Add API versioning strategy
- Implement proper logging configuration
- Add frontend testing suite
- Consider WebSocket support for real-time features
- Implement rate limiting
- Add database connection pooling for production

## When Writing Code

### Python/Django
- Use type hints where beneficial
- Follow PEP 8 style guide
- Prefer composition over inheritance
- Use f-strings for string formatting
- Handle exceptions explicitly
- Write docstrings for complex logic

### TypeScript/React
- Enable strict TypeScript mode
- Use const assertions where appropriate
- Prefer functional components
- Keep components small and focused
- Extract custom hooks for reusable logic
- Use proper React patterns (keys, memo, callback)

## File Naming Conventions
- Python: `snake_case.py`
- TypeScript: `camelCase.tsx` or `camelCase.ts`
- Tests: `*_test.py` (Python), consider `*.test.tsx` (TS)
- Components: `PascalCase.tsx` or `camelCase.tsx` (be consistent)

## Import Conventions
- Python: Absolute imports from project root (`from kompello.core.models import ...`)
- TypeScript: Use `~` alias for `app/` directory (`~/components/...`)
- Group imports: stdlib → third-party → local

---

**Last Updated**: January 2026
**Django Version**: 5.1.5
**React Version**: 19.1.0
**React Router Version**: 7.5.3
