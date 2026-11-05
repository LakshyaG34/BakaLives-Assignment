# Engineering Notes

## What I found

TaskFlow is a single-user task dashboard built with FastAPI, Next.js, and PostgreSQL. I found API issues with whitespace-only titles, status updates that did not persist reliably, successful responses when deleting nonexistent tasks, and timestamps that did not always change after an edit. The original page also became crowded as tasks accumulated, and searching and prioritizing tasks needed improvement.

## What I worked on

I fixed the API validation and persistence issues and added regression coverage for task creation, updates, deletion, status transitions, timestamps, and priority behavior. I added low, medium, and high task priorities across the database, API, and frontend. The Alembic migration adds a non-null priority column with a `medium` default for existing tasks and validates the allowed values.

I reorganized the frontend into Dashboard, All Tasks, and Create Task modules and refreshed the interface with a responsive purple and white design, Tailwind CSS, and Framer Motion. The Dashboard summarizes live task data. All Tasks supports case-insensitive title search, status and creation-date filters, and pagination with page sizes of 5, 10, or 20. Task cards show status and priority badges, keep completed titles visible with a strikethrough, and provide View, Edit, and Delete actions. The Edit action animates the status and priority controls into view. SweetAlert2 provides feedback for task actions and errors, and empty and failed states are explained clearly.

## How I checked the work

I ran the backend test suite and checked the task flows in the browser, including creating tasks, changing status and priority, deleting tasks, searching, filtering, and pagination. I also ran the frontend TypeScript check. The priority migration was applied through Docker Compose; existing tasks received the `medium` default. During development, I found that the running backend needed to be rebuilt to load the updated priority API; after restarting it, priority creation and updates worked as expected.

## What I learned

I learned more about SQLAlchemy object state and commits, Pydantic validation, and how Alembic migrations fit into a Docker Compose workflow. I also practiced splitting a dashboard into clearer modules and integrating React Select, SweetAlert2, and Framer Motion.

## If I had another day

I would add task deadlines and reminders. Tasks could have a due date, and the app could send a WhatsApp reminder through an appropriate messaging service when a deadline is approaching and the task is still incomplete. I would also add controls for reminder timing and prevent duplicate reminders for the same task.
