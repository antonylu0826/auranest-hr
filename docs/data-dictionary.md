# Data Dictionary

> Auto-generated from Prisma schema on 2026-06-03.
> Do not edit manually — run `pnpm -C backend schema:docs` to regenerate.

---

## Enums

### UserRole

> System role controlling access level. ADMIN has full CRUD access; USER has read-only access.

| Value | Description |
|-------|-------------|
| `ADMIN` |  |
| `USER` |  |

### Gender

> Biological sex of an employee, used for demographic reporting.

| Value | Description |
|-------|-------------|
| `MALE` |  |
| `FEMALE` |  |
| `OTHER` |  |

### EmploymentType

> Employee's contractual arrangement. FULL_TIME: standard 40-hour week; PART_TIME: reduced hours; CONTRACT: fixed-term; INTERN: internship.

| Value | Description |
|-------|-------------|
| `FULL_TIME` |  |
| `PART_TIME` |  |
| `CONTRACT` |  |
| `INTERN` |  |

### EmploymentStatus

> Current employment lifecycle state. ACTIVE: currently employed; RESIGNED: voluntary separation by employee; TERMINATED: company-initiated separation; ON_LEAVE: unpaid leave with job guarantee.

| Value | Description |
|-------|-------------|
| `ACTIVE` |  |
| `RESIGNED` |  |
| `TERMINATED` |  |
| `ON_LEAVE` |  |

### OrgUnitLevel

> Hierarchical level of an organisational unit. COMPANY > DIVISION > DEPARTMENT > TEAM

| Value | Description |
|-------|-------------|
| `COMPANY` |  |
| `DIVISION` |  |
| `DEPARTMENT` |  |
| `TEAM` |  |

### ShiftCategory

> Shift scheduling pattern. FIXED: same start/end time every workday; ROTATING: cyclical work/rest pattern (e.g. 4 on 2 off).

| Value | Description |
|-------|-------------|
| `FIXED` |  |
| `ROTATING` |  |

### DependentRelationship

> Family relationship of a dependent to an employee.

| Value | Description |
|-------|-------------|
| `SPOUSE` | Legally married partner. |
| `CHILD` | Biological or adopted child. |
| `PARENT` | Biological or adoptive parent. |
| `SIBLING` | Brother or sister. |
| `OTHER` | Any other relationship not listed above. |

## Models

### JobTitle

> Job title / position classification within the organisation. Assigned to employees to identify their role level and function.

**DB table:** `job_titles`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | String | ✓ | ✓ |  |
| `name` | String | ✓ | ✓ | Display name, e.g. "Senior Software Engineer". Must be unique. |
| `code` | String | ✓ | ✓ | Short code for reporting, e.g. "SSE". Must be unique. |
| `department` | String |  |  | Functional department this title belongs to, e.g. "Engineering". |
| `grade` | String |  |  | Compensation grade / band, e.g. "L5". Used for salary banding. |
| `isActive` | Boolean | ✓ |  | Inactive titles are hidden from new assignments but retained for history. |
| `createdAt` | DateTime | ✓ |  |  |
| `updatedAt` | DateTime | ✓ |  |  |

### User

> System user account. Used for authentication in local-auth mode. Linked 1-to-1 with EmployeeProfile via userId (optional — an employee may exist before an account is created).

**DB table:** `users`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | String | ✓ | ✓ |  |
| `email` | String | ✓ | ✓ | Login email, must be unique across the system. |
| `password` | String | ✓ |  |  |
| `name` | String |  |  | Display name shown in UI; optional. |
| `role` | UserRole | ✓ |  |  |
| `isActive` | Boolean | ✓ |  | Soft-disable without deleting — preserves audit history. |
| `createdAt` | DateTime | ✓ |  |  |
| `updatedAt` | DateTime | ✓ |  |  |

### ShiftType

> Shift (work schedule) template defining working hours and cycle. Assigned to employees to determine their daily work pattern.

**DB table:** `shift_types`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | String | ✓ | ✓ |  |
| `name` | String | ✓ | ✓ | Human-readable name, e.g. "Morning Shift". Must be unique. |
| `code` | String | ✓ | ✓ | Short uppercase identifier, e.g. "MORNING". Must be unique. |
| `category` | ShiftCategory | ✓ |  |  |
| `workStart` | String |  |  | Scheduled work start time in HH:mm (24-hour). Null = flexible. |
| `workEnd` | String |  |  | Scheduled work end time in HH:mm (24-hour). Null = flexible. |
| `breakStart` | String |  |  | Break period start in HH:mm. Null = no fixed break. |
| `breakEnd` | String |  |  | Break period end in HH:mm. |
| `observeHolidays` | Boolean | ✓ |  | FIXED only. Whether public holidays are automatically treated as rest days. |
| `flexEarliestStart` | String |  |  | FIXED only. Earliest allowed clock-in time for flex start (HH:mm). |
| `flexLatestStart` | String |  |  | FIXED only. Latest allowed clock-in time for flex start (HH:mm). |
| `workDaysInCycle` | Int |  |  | ROTATING only. Number of consecutive workdays in one cycle, e.g. 4. |
| `restDaysInCycle` | Int |  |  | ROTATING only. Number of consecutive rest days in one cycle, e.g. 2. |
| `cycleAnchorDate` | DateTime |  |  | ROTATING only. Reference date to align the cycle phase for all employees. |
| `isActive` | Boolean | ✓ |  | Inactive shifts are hidden from selection but retained for historical records. |
| `createdAt` | DateTime | ✓ |  |  |
| `updatedAt` | DateTime | ✓ |  |  |

### OrgUnit

> Node in the company organisational hierarchy. Forms a tree via parent/children self-relation (unlimited depth).

**DB table:** `org_units`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | String | ✓ | ✓ |  |
| `name` | String | ✓ |  | Display name of the unit, e.g. "Engineering Department". |
| `level` | OrgUnitLevel | ✓ |  |  |
| `headId` | String |  |  | Optional employee who leads this unit. FK to EmployeeProfile (nullable). |
| `parentId` | String |  |  | Parent unit in the hierarchy. Null = root node (typically the company itself). |
| `createdAt` | DateTime | ✓ |  |  |
| `updatedAt` | DateTime | ✓ |  |  |

### EmployeeProfile

> Core HR record for every person employed by the organisation. May exist before a system User account is created (userId is optional).

**DB table:** `employee_profiles`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | String | ✓ | ✓ |  |
| `employeeNumber` | String | ✓ | ✓ | Company-assigned employee ID, e.g. "EMP-001". Must be unique. |
| `name` | String | ✓ |  | Full legal name. |
| `userId` | String |  | ✓ | Linked system account. Null until IT creates and links a User account. |
| `orgUnitId` | String |  |  | Assigned organisational unit. Null if unassigned. |
| `jobTitleId` | String |  |  | Assigned job title. Identifies employee's role level and function. |
| `shiftTypeId` | String |  |  | Assigned shift template. Determines daily work schedule. |
| `nationalId` | String |  |  | Government-issued national identification number. |
| `gender` | Gender |  |  |  |
| `birthDate` | DateTime |  |  | Date of birth in YYYY-MM-DD (stored as date-only, no timezone). |
| `nationality` | String |  |  | ISO 3166-1 alpha-2 country code, default "TW". |
| `phone` | String |  |  |  |
| `address` | String |  |  |  |
| `emergencyContactName` | String |  |  | Name of the person to contact in an emergency. |
| `emergencyContactPhone` | String |  |  |  |
| `hireDate` | DateTime |  |  | Date the employee joined the company (YYYY-MM-DD). |
| `employmentType` | EmploymentType | ✓ |  |  |
| `employmentStatus` | EmploymentStatus | ✓ |  |  |
| `createdAt` | DateTime | ✓ |  |  |
| `updatedAt` | DateTime | ✓ |  |  |

### EmployeeDependent

> A family member or dependent registered under an employee's HR record.

**DB table:** `employee_dependents`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | String | ✓ | ✓ |  |
| `employeeId` | String | ✓ |  | FK to the owning employee profile. |
| `name` | String | ✓ |  | Full legal name of the dependent. |
| `relationship` | DependentRelationship | ✓ |  |  |
| `gender` | Gender |  |  |  |
| `birthDate` | DateTime |  |  | Date of birth in YYYY-MM-DD (date-only, no timezone). |
| `nationalId` | String |  |  | National identification number; optional. |
| `phone` | String |  |  |  |
| `isActive` | Boolean | ✓ |  | Inactive records are hidden from normal views but retained for history. |
| `createdAt` | DateTime | ✓ |  |  |
| `updatedAt` | DateTime | ✓ |  |  |
