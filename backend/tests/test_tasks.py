from datetime import datetime
from time import sleep

# --- Health Check ---

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# --- List Tasks (GET /api/tasks) ---

def test_list_tasks_empty(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert response.json() == []


def test_list_tasks_ordered_descending(client):
    client.post("/api/tasks", json={"title": "First"})
    client.post("/api/tasks", json={"title": "Second"})
    client.post("/api/tasks", json={"title": "Third"})
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert [task["title"] for task in response.json()] == ["Third", "Second", "First"]


def test_list_tasks_schema(client):
    client.post("/api/tasks", json={"title": "Schema test", "description": "Checking fields"})
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    task = data[0]
    assert set(task.keys()) == {"id", "title", "description", "status", "created_at", "updated_at"}
    assert task["title"] == "Schema test"
    assert task["description"] == "Checking fields"
    assert task["status"] == "todo"


# --- Get Task (GET /api/tasks/{task_id}) ---

def test_get_task_success(client):
    created = client.post("/api/tasks", json={"title": "Get me", "description": "Details"}).json()
    response = client.get(f"/api/tasks/{created['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created["id"]
    assert data["title"] == "Get me"
    assert data["description"] == "Details"
    assert data["status"] == "todo"


def test_get_task_not_found(client):
    response = client.get("/api/tasks/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_get_task_invalid_id(client):
    response = client.get("/api/tasks/invalid-id")
    assert response.status_code == 422


# --- Create Task (POST /api/tasks) ---

def test_create_task_title_only(client):
    response = client.post("/api/tasks", json={"title": "Write notes"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Write notes"
    assert data["description"] is None
    assert data["status"] == "todo"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_with_description(client):
    response = client.post("/api/tasks", json={"title": "With desc", "description": "A detailed task"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "With desc"
    assert data["description"] == "A detailed task"
    assert data["status"] == "todo"


def test_create_task_strips_whitespace(client):
    response = client.post("/api/tasks", json={"title": "   Clean title   "})
    assert response.status_code == 201
    assert response.json()["title"] == "Clean title"


def test_blank_title_is_rejected(client):
    response = client.post("/api/tasks", json={"title": "   "})
    assert response.status_code == 422


def test_empty_title_is_rejected(client):
    response = client.post("/api/tasks", json={"title": ""})
    assert response.status_code == 422


def test_missing_title_is_rejected(client):
    response = client.post("/api/tasks", json={"description": "Missing title"})
    assert response.status_code == 422


def test_title_too_long_is_rejected(client):
    response = client.post("/api/tasks", json={"title": "x" * 256})
    assert response.status_code == 422


# --- Update Task (PATCH /api/tasks/{task_id}) ---

def test_status_update_persists(client):
    task_id = client.post("/api/tasks", json={"title": "Change status"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"status": "done"})
    assert response.status_code == 200
    assert response.json()["status"] == "done"
    assert client.get(f"/api/tasks/{task_id}").json()["status"] == "done"


def test_status_transitions(client):
    task_id = client.post("/api/tasks", json={"title": "Workflow task"}).json()["id"]
    
    # todo -> in_progress
    resp1 = client.patch(f"/api/tasks/{task_id}", json={"status": "in_progress"})
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "in_progress"
    assert client.get(f"/api/tasks/{task_id}").json()["status"] == "in_progress"

    # in_progress -> done
    resp2 = client.patch(f"/api/tasks/{task_id}", json={"status": "done"})
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "done"
    assert client.get(f"/api/tasks/{task_id}").json()["status"] == "done"

    # done -> todo
    resp3 = client.patch(f"/api/tasks/{task_id}", json={"status": "todo"})
    assert resp3.status_code == 200
    assert resp3.json()["status"] == "todo"
    assert client.get(f"/api/tasks/{task_id}").json()["status"] == "todo"


def test_update_title(client):
    task_id = client.post("/api/tasks", json={"title": "Old title"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"title": "New title"})
    assert response.status_code == 200
    assert response.json()["title"] == "New title"
    assert client.get(f"/api/tasks/{task_id}").json()["title"] == "New title"


def test_update_description(client):
    task_id = client.post("/api/tasks", json={"title": "Task", "description": "Old"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"description": "New description"})
    assert response.status_code == 200
    assert response.json()["description"] == "New description"
    assert client.get(f"/api/tasks/{task_id}").json()["description"] == "New description"


def test_update_description_to_null(client):
    task_id = client.post("/api/tasks", json={"title": "Task", "description": "To clear"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"description": None})
    assert response.status_code == 200
    assert response.json()["description"] is None
    assert client.get(f"/api/tasks/{task_id}").json()["description"] is None


def test_update_all_fields(client):
    task_id = client.post("/api/tasks", json={"title": "Initial", "description": "Initial desc"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={
        "title": "Complete overhaul",
        "description": "Updated desc",
        "status": "in_progress",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Complete overhaul"
    assert data["description"] == "Updated desc"
    assert data["status"] == "in_progress"


def test_update_missing_task_returns_404(client):
    response = client.patch("/api/tasks/99999", json={"title": "Ghost"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_update_blank_title_is_rejected(client):
    task_id = client.post("/api/tasks", json={"title": "Valid"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"title": "   "})
    assert response.status_code == 422


def test_update_invalid_status_is_rejected(client):
    task_id = client.post("/api/tasks", json={"title": "Valid"}).json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"status": "invalid_status"})
    assert response.status_code == 422


def test_update_changes_timestamp(client):
    task = client.post("/api/tasks", json={"title": "Original"}).json()
    sleep(0.02)
    updated = client.patch(f"/api/tasks/{task['id']}", json={"title": "Renamed"}).json()
    assert datetime.fromisoformat(updated["updated_at"]) > datetime.fromisoformat(task["updated_at"])


# --- Delete Task (DELETE /api/tasks/{task_id}) ---

def test_delete_task_success(client):
    task_id = client.post("/api/tasks", json={"title": "To delete"}).json()["id"]
    delete_response = client.delete(f"/api/tasks/{task_id}")
    assert delete_response.status_code == 204
    # Verify task is deleted
    assert client.get(f"/api/tasks/{task_id}").status_code == 404


def test_missing_task_delete_returns_404(client):
    assert client.delete("/api/tasks/99999").status_code == 404


def test_delete_invalid_id(client):
    assert client.delete("/api/tasks/invalid-id").status_code == 422
