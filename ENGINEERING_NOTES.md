# Engineering Notes

## What I found

TaskFlow is a single-user task dashboard built with FastAPI, Next.js, and PostgreSQL. The API had several correctness issues: titles containing only whitespace could pass validation, status updates were not reliably persisted, deleting a nonexistent task returned success, and edits did not consistently advance `updated_at`. The original dashboard also placed task creation and the whole task list together, which made the page crowded as the list grew.

## What I worked on

I fixed the API validation and persistence issues and added regression tests for task creation, updates, deletion, status transitions, and timestamps. I added a task priority system with `low`, `medium`, and `high` values. The Alembic migration adds a non-null priority column with a `medium` server default, so existing rows receive `medium`; the API supports priority on create, read, and update, and the frontend lets users select and change priority and displays it on task cards and in the details modal. Priority validation and default behavior have regression tests.

I also added a backend source mount in the development Docker Compose setup so the container uses the local backend files instead of only the copies baked into its image. For EC2 deployment, I added a separate production Compose file that starts the API and a private PostgreSQL container, applies migrations, restarts both services unless stopped, and stores database files in a named volume. Credentials come from an ignored `.env.production` file; the API binds to loopback for an HTTPS reverse proxy, and PostgreSQL is not published on a host port. The backend has not been deployed to EC2 yet.

On the frontend, I refreshed the dashboard with a responsive purple and white layout, Tailwind styling, and Framer Motion transitions. I split the screen into Overview, All Tasks, and Create Task modules in the sidebar, moved the form into Create Task, and made status shortcuts open All Tasks with that filter selected. Summary cards and progress indicators use the loaded task data. The task status dropdown now uses `react-select`. All Tasks supports case-insensitive title search and creation-date presets (today, past 7 days, past 30 days, and this month); status, search, and date filters work together. I corrected the in-progress filter so it no longer includes completed tasks, and the empty state explains when filters have no matches. The list paginates filtered results, with a page-size selector for 5, 10, or 20 tasks (10 by default), page numbers, previous/next controls, and a visible item range. Changing filters or page size returns to the first page. SweetAlert2 now confirms deletion and reports successful creation, status updates, and deletion; it also displays alerts when those actions fail. Task cards reveal View and Delete actions on hover/focus; View opens an accessible modal with task details and timestamps.

## How I checked the work

I added API regression tests in `backend/tests/test_tasks.py`, including priority defaults, accepted values, invalid values, and update persistence. I validated the production Compose file with `docker compose ... config -q` and ran the frontend TypeScript check (`npm run typecheck`), which passed after the priority UI changes. I have not yet run the backend test suite or applied the priority migration to the running development database. I could not complete a production frontend build in this environment because Turbopack was blocked while trying to bind a local port. The changes still need an end-to-end check in Docker.

## What I learned

I learned how SQLAlchemy handles object state around commits and refreshes, how Pydantic validators can normalize and reject task titles, and how Alembic and Docker Compose fit into the local backend workflow. I also practiced organizing a dashboard into clearer UI modules and styling a third-party select component.

## What's left

The priority implementation is complete in code; next, run the backend test suite and apply the migration in Docker to verify existing tasks receive `medium`, then verify create, edit, and display flows in the running app. The EC2 deployment configuration is prepared but has not been run; the instance still needs Docker, a secure public endpoint (domain/HTTPS reverse proxy or equivalent), and the configured production env file. The Docker database volume also needs a backup plan before this is used for important persistent data.
