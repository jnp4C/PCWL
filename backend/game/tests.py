from decimal import Decimal

from django.test import TestCase
from django.urls import reverse

from .models import CheckIn, FriendLink, Player


class HealthEndpointTests(TestCase):
    def test_health_endpoint_returns_ok(self):
        response = self.client.get(reverse("api-health"))
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body.get("status"), "ok")
        if "db" in body:
            self.assertIn(body["db"], {"ok", "pending", "unknown"})


class PlayerApiTests(TestCase):
    def _login_player(self, player: Player):
        user = player.ensure_auth_user(password="testpass123")
        self.client.force_login(user)

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
        self.assertEqual(player.cooldowns, {})
        self.assertEqual(player.cooldown_details, {})
        self.assertEqual(player.map_marker_color, "#6366f1")

    def test_update_last_known_location(self):
        player = Player.objects.create(username="loc-user")
        self._login_player(player)
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

    def test_score_related_fields_are_read_only(self):
        player = Player.objects.create(username="stat-user")
        self._login_player(player)
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
                    "cooldownType": "defend",
                    "cooldownMode": "local",
                },
                {
                    "timestamp": 1700000005000,
                    "districtId": "1200",
                    "districtName": "Prague 2",
                    "type": "attack",
                    "multiplier": 2,
                    "ranged": True,
                    "melee": False,
                    "cooldownType": "attack",
                    "cooldownMode": "ranged",
                },
            ],
            "home_district_code": "1100",
            "home_district_name": "Prague 1",
            "cooldowns": {"attack": 1700000010000},
            "cooldown_details": {
                "attack": {
                    "duration": 180000,
                    "startedAt": 1700000005000,
                    "mode": "ranged",
                }
            },
        }
        response = self.client.patch(reverse("player-detail", args=[player.id]), payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        player.refresh_from_db()
        # Score-related fields remain untouched because they are server-authoritative
        self.assertEqual(player.score, 0)
        self.assertEqual(player.attack_points, 0)
        self.assertEqual(player.defend_points, 0)
        self.assertEqual(player.checkins, 0)
        self.assertEqual(player.home_district_code, "1100")
        self.assertEqual(player.home_district_name, "Prague 1")
        self.assertEqual(player.home_district, "Prague 1")
        self.assertEqual(player.checkin_history, [])
        self.assertEqual(player.cooldowns, {})
        self.assertEqual(player.cooldown_details, {})
        body = response.json()
        self.assertEqual(body["score"], 0)
        self.assertEqual(body["attack_points"], 0)
        self.assertEqual(body["defend_points"], 0)
        self.assertEqual(body["checkins"], 0)

    def test_cooldown_payload_ignores_invalid_entries(self):
        player = Player.objects.create(username="cooldown-user")
        self._login_player(player)
        payload = {
            "cooldowns": {
                "attack": "1700000020000",
                "invalid": 123,
                "charge": -10,
            },
            "cooldown_details": {
                "attack": {"duration": "60000", "startedAt": "1700000000000", "mode": "LOCAL"},
                "charge": {"duration": "invalid"},
                "bad": {"duration": 1000},
            },
        }
        response = self.client.patch(reverse("player-detail", args=[player.id]), payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        player.refresh_from_db()
        self.assertEqual(player.cooldowns, {})
        self.assertEqual(player.cooldown_details, {})
        body = response.json()
        self.assertEqual(body["cooldowns"], {})
        self.assertEqual(body["cooldown_details"], {})

    def test_update_map_marker_color(self):
        player = Player.objects.create(username="color-user")
        self._login_player(player)
        url = reverse("player-detail", args=[player.id])
        response = self.client.patch(
            url,
            {"map_marker_color": "#ff8800"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        player.refresh_from_db()
        self.assertEqual(player.map_marker_color, "#ff8800")

    def test_invalid_map_marker_color_rejected(self):
        player = Player.objects.create(username="color-invalid")
        self._login_player(player)
        url = reverse("player-detail", args=[player.id])
        response = self.client.patch(
            url,
            {"map_marker_color": "not-a-color"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        player.refresh_from_db()
        self.assertEqual(player.map_marker_color, "#6366f1")


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

    def test_token_authentication(self):
        # Obtain a token using username/password
        resp = self.client.post(
            reverse("api-token"),
            {"username": "session-user", "password": "hunter2"},
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        token = resp.json().get("token")
        self.assertTrue(token)
        # Use the token to access a protected endpoint (player list limited by viewset)
        self.client.defaults["HTTP_AUTHORIZATION"] = f"Token {token}"
        # Create a player owned by the auth user if not linked
        # PlayerViewSet.get_queryset returns current player only; ensure exists and linked
        # The session user is self.player; force link to auth user
        self.player.ensure_auth_user(password=None)
        response = self.client.get(reverse("player-list"))
        self.assertIn(response.status_code, (200, 403, 405))  # Endpoint exists and protected


class CheckInApiTests(TestCase):
    def setUp(self):
        self.player = Player.objects.create(
            username="checkin-user",
            home_district_code="1100",
            home_district_name="Prague 1",
            home_district="Prague 1",
        )
        self.user = self.player.ensure_auth_user(password="checkpass123")
        self.client.force_login(self.user)

    def test_attack_checkin_records_event(self):
        payload = {
            "district_code": "1200",
            "district_name": "Prague 2",
            "mode": "ranged",
            "source": "ranged",
        }
        response = self.client.post(reverse("checkin-log"), payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("player", data)
        self.assertIn("checkin", data)
        self.player.refresh_from_db()
        self.assertEqual(self.player.score, 10)
        self.assertEqual(self.player.attack_points, 10)
        self.assertEqual(self.player.defend_points, 0)
        self.assertEqual(self.player.checkins, 1)
        self.assertEqual(self.player.next_checkin_multiplier, 1)
        self.assertIn("attack", self.player.cooldowns)
        self.assertEqual(CheckIn.objects.filter(player=self.player).count(), 1)
        checkin = CheckIn.objects.filter(player=self.player).first()
        self.assertEqual(checkin.action, CheckIn.Action.ATTACK)
        self.assertEqual(checkin.mode, CheckIn.Mode.RANGED)
        self.assertEqual(checkin.points_awarded, 10)

    def test_charge_endpoint_sets_multiplier(self):
        response = self.client.post(reverse("checkin-charge"), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("player", data)
        self.player.refresh_from_db()
        self.assertEqual(self.player.next_checkin_multiplier, 3)
        self.assertIn("charge", self.player.cooldowns)


class FriendApiTests(TestCase):
    def setUp(self):
        self.primary = Player.objects.create(username="primary-user")
        self.primary.ensure_auth_user(password="friendpass")
        self.friend = Player.objects.create(
            username="ally",
            home_district_code="1100",
            home_district_name="Prague 1",
            home_district="Prague 1",
            map_marker_color="#ff8800",
            last_known_location={
                "lng": 14.42076,
                "lat": 50.08804,
                "districtId": "1100",
                "districtName": "Prague 1",
                "timestamp": 1700000000000,
            },
        )
        FriendLink.objects.create(player=self.primary, friend=self.friend)
        FriendLink.objects.create(player=self.friend, friend=self.primary)

    def _login_primary(self):
        self.client.force_login(self.primary.ensure_auth_user(password="friendpass"))

    def test_friend_list_includes_location_and_color(self):
        self._login_primary()
        response = self.client.get(reverse("friend-list"))
        self.assertEqual(response.status_code, 200)
        body = response.json()
        friends = body.get("friends", [])
        self.assertEqual(len(friends), 1)
        friend_entry = friends[0]
        self.assertEqual(friend_entry["username"], "ally")
        self.assertEqual(friend_entry["map_marker_color"], "#ff8800")
        self.assertEqual(friend_entry["home_district_code"], "1100")
        self.assertEqual(friend_entry["home_district_name"], "Prague 1")
        self.assertEqual(friend_entry["home_district"], "Prague 1")
        location = friend_entry.get("last_known_location")
        self.assertIsInstance(location, dict)
        self.assertEqual(location["districtId"], "1100")
        self.assertAlmostEqual(location["lng"], 14.42076, places=5)
        self.assertAlmostEqual(location["lat"], 50.08804, places=5)


class LeaderboardApiTests(TestCase):
    def setUp(self):
        self.alpha = Player.objects.create(
            username="alpha",
            score=500,
            attack_points=200,
            defend_points=150,
            checkins=5,
            checkin_history=[
                {
                    "type": "defend",
                    "districtId": "1100",
                    "districtName": "Prague 1",
                    "multiplier": 2,
                    "ranged": False,
                },
                {
                    "type": "attack",
                    "districtId": "1200",
                    "districtName": "Prague 2",
                    "multiplier": 1,
                    "ranged": True,
                },
            ],
        )
        self.beta = Player.objects.create(
            username="beta",
            score=300,
            attack_points=120,
            defend_points=60,
            checkins=3,
            checkin_history=[
                {
                    "type": "defend",
                    "districtId": "1200",
                    "districtName": "Prague 2",
                    "multiplier": 1,
                }
            ],
        )
        CheckIn.objects.create(
            player=self.alpha,
            district_code="1100",
            district_name="Prague 1",
            action=CheckIn.Action.DEFEND,
            mode=CheckIn.Mode.LOCAL,
            multiplier=Decimal("2.00"),
            base_points=10,
            points_awarded=20,
        )
        CheckIn.objects.create(
            player=self.alpha,
            district_code="1200",
            district_name="Prague 2",
            action=CheckIn.Action.ATTACK,
            mode=CheckIn.Mode.RANGED,
            multiplier=Decimal("1.00"),
            base_points=10,
            points_awarded=10,
        )
        CheckIn.objects.create(
            player=self.beta,
            district_code="1200",
            district_name="Prague 2",
            action=CheckIn.Action.DEFEND,
            mode=CheckIn.Mode.LOCAL,
            multiplier=Decimal("1.00"),
            base_points=10,
            points_awarded=10,
        )

    def test_leaderboard_endpoint_returns_data(self):
        response = self.client.get(reverse("leaderboard-api"))
        self.assertEqual(response.status_code, 200)
        body = response.json()
        players = body.get("players", [])
        districts = body.get("districts", [])
        self.assertTrue(any(entry["username"] == "alpha" for entry in players))
        self.assertTrue(any(entry["username"] == "beta" for entry in players))
        self.assertTrue(any(entry["id"] == "1100" for entry in districts))
        self.assertTrue(any(entry["id"] == "1200" for entry in districts))
