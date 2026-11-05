# TaskFlow

Welcome to the TaskFlow team. This small, single-user task dashboard already runs locally, but several reported behaviors and requested features need your attention. Investigate the code, explain your decisions, and make focused fixes.

## Stack and prerequisites

- FastAPI, SQLAlchemy 2, Pydantic 2, PostgreSQL, Alembic, and pytest
- Next.js App Router, React, TypeScript, Tailwind CSS, and native Fetch
- Docker and Docker Compose. Install them using the [Docker Engine guide](https://docs.docker.com/engine/install/) or [Docker Desktop guide](https://docs.docker.com/desktop/).

Docker Compose is the only prerequisite for the standard path. Python 3.12+ and Node 22+ are useful for local development outside containers.

## Start and stop

From the repository root:

```bash
docker compose up --build
```

Open [TaskFlow](http://localhost:3000), the [API](http://localhost:8000/health), or [API docs](http://localhost:8000/docs). The frontend sends browser requests to its own `/api` path; Next.js proxies them to the backend. The backend connects to PostgreSQL using the Compose service name `db`.

Stop with Ctrl+C, then `docker compose down`. This removes containers but retains the named database volume. `docker compose down -v` **also deletes the database volume and all task data**. The three sample tasks are inserted only when the table is empty.

Copy `.env.example` to `.env` to customize local database credentials. The example values are for local development only.

## Run tests

```bash
docker compose run --rm backend python -m pytest -q
```

Tests use a fresh in-memory database per test and cannot modify your development data. Some regression tests intentionally fail to document reported behavior; make them pass as you repair the application.

## Repository map

- `backend/app`: API, schemas, model, and task service
- `backend/alembic`: database migrations
- `backend/tests`: isolated API tests
- `frontend/app`: dashboard and styles
- `frontend/components`: task controls
- `frontend/lib`: browser API client
- `docker-compose.yml`: local services and persistent database volume

## Reported problems to investigate

- Some titles containing only spaces can be saved.
- A status change can look successful, then revert after a refresh.
- A newly created task can be absent from the current list until a refresh.
- One status filter includes tasks from another status.
- Deleting an ID that does not exist looks successful.
- The last-modified time does not always change when a task is edited.

## Requested features

1. Add low, medium, and high task priority, defaulting existing and new tasks to medium. Include the database migration, API fields, creation flow, and display.
2. Make the visible search field filter titles case insensitively; an empty search shows all tasks.
3. Calculate the four summary cards from task data.
4. Add friendly feedback for empty filtered lists and failed API requests.

## Submission

Submit a repository or archive with your code, migrations, and tests. Include a short explanation of the root causes, changes, how you tested them, and any remaining tradeoffs. Do not include generated build output or local `.env` files.

Useful references: [FastAPI](https://fastapi.tiangolo.com/), [Pydantic](https://docs.pydantic.dev/latest/), [SQLAlchemy](https://docs.sqlalchemy.org/en/20/), [Alembic](https://alembic.sqlalchemy.org/en/latest/), [Next.js](https://nextjs.org/docs), and [Docker Compose](https://docs.docker.com/compose/).
