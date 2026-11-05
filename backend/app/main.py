from fastapi import FastAPI
from app.routers.tasks import router as tasks_router

app = FastAPI(title="TaskFlow API")
app.include_router(tasks_router)

@app.get("/health")
def health():
    return {"status": "ok"}
