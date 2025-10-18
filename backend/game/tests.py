from django.test import TestCase
from django.urls import reverse

from .models import Player


class HealthEndpointTests(TestCase):
    def test_health_endpoint_returns_ok(self):
        response = self.client.get(reverse("api-health"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})


class PlayerApiTests(TestCase):
    def test_create_player(self):
        payload = {"username": "test-user"}
        response = self.client.post(reverse("player-list"), payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        player = Player.objects.get(username="test-user")
        self.assertEqual(player.username, "test-user")
        self.assertEqual(player.score, 0)
        self.assertEqual(player.checkins, 0)
        self.assertEqual(player.attack_points, 0)
        self.assertEqual(player.defend_points, 0)
        self.assertEqual(player.checkin_history, [])

    def test_update_last_known_location(self):
        player = Player.objects.create(username="loc-user")
        payload = {
            "last_known_location": {
                "lng": 14.42076,
                "lat": 50.08804,
                "districtId": "1100",
                "districtName": "Prague 1",
                "timestamp": 1700000000000,
            }
        }
        url = reverse("player-detail", args=[player.id])
        response = self.client.patch(url, payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        player.refresh_from_db()
        self.assertIsNotNone(player.last_known_location)
        self.assertEqual(player.last_known_location["districtId"], "1100")

    def test_update_player_stats_persists_history(self):
        player = Player.objects.create(username="stat-user")
        payload = {
            "score": 125,
            "attack_points": 80,
            "defend_points": 45,
            "checkin_history": [
                {
                    "timestamp": 1700000000000,
                    "districtId": "1100",
                    "districtName": "Prague 1",
                    "type": "defend",
                    "multiplier": 1,
                    "ranged": False,
                    "melee": True,
                },
                {
                    "timestamp": 1700000005000,
                    "districtId": "1200",
                    "districtName": "Prague 2",
                    "type": "attack",
                    "multiplier": 2,
                    "ranged": True,
                    "melee": False,
                },
            ],
            "home_district_code": "1100",
            "home_district_name": "Prague 1",
        }
        response = self.client.patch(reverse("player-detail", args=[player.id]), payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        player.refresh_from_db()
        self.assertEqual(player.score, 125)
        self.assertEqual(player.attack_points, 80)
        self.assertEqual(player.defend_points, 45)
        self.assertEqual(player.checkins, 2)
        self.assertEqual(player.home_district_code, "1100")
        self.assertEqual(player.home_district_name, "Prague 1")
        self.assertEqual(player.home_district, "Prague 1")
        self.assertEqual(len(player.checkin_history), 2)


class SessionAuthTests(TestCase):
    def setUp(self):
        self.player = Player.objects.create(username="session-user")
        self.player.ensure_auth_user(password="hunter2")

    def test_login_establishes_session(self):
        payload = {"username": "session-user", "password": "hunter2"}
        response = self.client.post(reverse("session-login"), payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("player", body)
        self.assertEqual(body["player"]["username"], "session-user")

        session_response = self.client.get(reverse("session-current"))
        self.assertEqual(session_response.status_code, 200)
        session_body = session_response.json()
        self.assertTrue(session_body.get("authenticated"))
        self.assertEqual(session_body["player"]["username"], "session-user")

    def test_logout_clears_session(self):
        self.client.post(
            reverse("session-login"),
            {"username": "session-user", "password": "hunter2"},
            content_type="application/json",
        )
        logout_response = self.client.post(reverse("session-logout"))
        self.assertEqual(logout_response.status_code, 204)
        session_response = self.client.get(reverse("session-current"))
        self.assertEqual(session_response.status_code, 200)
        self.assertFalse(session_response.json().get("authenticated"))

    def test_invalid_credentials(self):
        response = self.client.post(
            reverse("session-login"),
            {"username": "session-user", "password": "wrong"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
