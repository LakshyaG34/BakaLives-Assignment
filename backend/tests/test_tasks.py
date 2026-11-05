from datetime import datetime
from time import sleep

def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}

def test_create_task(client):
    response = client.post("/api/tasks", json={"title": "Write notes"})
    assert response.status_code == 201
    assert response.json()["title"] == "Write notes"
    assert response.json()["status"] == "todo"

def test_list_tasks(client):
    client.post("/api/tasks", json={"title": "First"})
    client.post("/api/tasks", json={"title": "Second"})
    assert [task["title"] for task in client.get("/api/tasks").json()] == ["Second", "First"]

def test_blank_title_is_rejected(client):
    assert client.post("/api/tasks", json={"title": "   "}).status_code == 422

def test_status_update_persists(client):
    task_id = client.post("/api/tasks", json={"title": "Change status"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"status": "done"})
    assert response.status_code == 200
    assert response.json()["status"] == "done"
    assert client.get(f"/api/tasks/{task_id}").json()["status"] == "done"

def test_missing_task_delete_returns_404(client):
    assert client.delete("/api/tasks/99999").status_code == 404

def test_update_changes_timestamp(client):
    task = client.post("/api/tasks", json={"title": "Original"}).json()
    sleep(0.02)
    updated = client.patch(f"/api/tasks/{task['id']}", json={"title": "Renamed"}).json()
    assert datetime.fromisoformat(updated["updated_at"]) > datetime.fromisoformat(task["updated_at"])
