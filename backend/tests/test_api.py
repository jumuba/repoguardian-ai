from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_demo_review_workflow():
    with TestClient(app) as client:
        created = client.post("/api/demo")
        assert created.status_code == 201
        analysis = created.json()
        assert analysis["status"] == "completed"
        assert analysis["findings"]

        finding_id = analysis["findings"][0]["id"]
        updated = client.patch(
            f"/api/findings/{finding_id}",
            json={"decision": "accepted", "reviewer_explanation": "Confirmed by both tools."},
        )
        assert updated.status_code == 200
        assert updated.json()["decision"] == "accepted"

        exported = client.get(f"/api/analyses/{analysis['id']}/export?format=markdown")
        assert exported.status_code == 200
        assert "# RepoGuardian AI report" in exported.text
