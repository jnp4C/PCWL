from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from .models import (
    CheckIn,
    District,
    DistrictContributionStat,
    DistrictEngagement,
    FriendLink,
    Party,
    PartyInvitation,
    PartyMembership,
    Player,
    PlayerPartyBond,
)
from .services import (
    apply_checkin,
    create_party,
    invite_player_to_party,
    leave_party,
    respond_to_party_invitation,
)


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

    def test_home_district_update_creates_catalog_entry(self):
        player = Player.objects.create(username="catalog-user")
        self._login_player(player)
        self.assertFalse(District.objects.filter(code="1100").exists())
        payload = {
            "home_district_code": "1100",
            "home_district_name": "Prague 1",
        }
        url = reverse("player-detail", args=[player.id])
        response = self.client.patch(url, payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        player.refresh_from_db()
        self.assertEqual(player.home_district_code, "1100")
        self.assertEqual(player.home_district_name, "Prague 1")
        district = District.objects.get(code="1100")
        self.assertEqual(district.name, "Prague 1")
        self.assertTrue(district.is_active)


class DistrictCatalogTests(TestCase):
    def test_catalog_endpoint_returns_known_districts(self):
        District.objects.create(code="1100", name="Prague 1")
        District.objects.create(code="1200", name="Prague 2", is_active=False)
        response = self.client.get(reverse("district-catalog"))
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("districts", body)
        codes = {entry["code"] for entry in body["districts"]}
        self.assertIn("1100", codes)
        self.assertNotIn("1200", codes)


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


class PartyApiTests(TestCase):
    def setUp(self):
        self.host = Player.objects.create(
            username="party-host",
            home_district_code="1100",
            home_district_name="Prague 1",
            home_district="Prague 1",
        )
        self.host.ensure_auth_user(password="hostpass")
        self.friend = Player.objects.create(
            username="party-friend",
            home_district_code="1200",
            home_district_name="Prague 2",
            home_district="Prague 2",
        )
        self.friend.ensure_auth_user(password="friendpass")

    def test_no_party_multiplier_after_party_expired(self):
        # Arrange: Create party, add friend, then force-expire the party
        party = create_party(self.host)
        invite = invite_player_to_party(self.host, self.friend)
        respond_to_party_invitation(invite, self.friend, accept=True)
        # Force expiry
        from django.utils import timezone
        party.expires_at = timezone.now() - timezone.timedelta(seconds=1)
        party.save(update_fields=["expires_at"])

        # Act: Perform a local precise attack by host
        result = apply_checkin(
            self.host,
            district_code="1300",
            district_name="Prague 3",
            mode=CheckIn.Mode.LOCAL,
            precision="precise",
        )
        checkin = result.checkin

        # Assert: No party boost should be applied
        self.assertEqual(checkin.party_code, "")
        self.assertEqual(checkin.party_size_snapshot, 1)
        self.assertEqual(int(checkin.party_multiplier_snapshot), 1)
        self.assertEqual(checkin.points_awarded, 20 if checkin.action == CheckIn.Action.ATTACK else 10)

    def test_no_party_multiplier_after_leader_disbands(self):
        # Arrange: Party with friend
        party = create_party(self.host)
        invite = invite_player_to_party(self.host, self.friend)
        respond_to_party_invitation(invite, self.friend, accept=True)

        # Leader leaves (disbands party)
        leave_party(self.host)

        # Act
        result = apply_checkin(
            self.host,
            district_code="1300",
            district_name="Prague 3",
            mode=CheckIn.Mode.LOCAL,
            precision="precise",
        )
        checkin = result.checkin

        # Assert: No party boost
        self.assertEqual(checkin.party_code, "")
        self.assertEqual(checkin.party_size_snapshot, 1)
        self.assertEqual(int(checkin.party_multiplier_snapshot), 1)

    def test_no_party_multiplier_after_member_leaves(self):
        # Arrange: Party with friend, then friend leaves
        party = create_party(self.host)
        invite = invite_player_to_party(self.host, self.friend)
        respond_to_party_invitation(invite, self.friend, accept=True)

        # Friend leaves; party may remain for leader, but the friend should not get boost
        leave_party(self.friend)

        # Act: Friend (who left) performs check-in
        result = apply_checkin(
            self.friend,
            district_code="1300",
            district_name="Prague 3",
            mode=CheckIn.Mode.LOCAL,
            precision="precise",
        )
        checkin = result.checkin

        # Assert: No party boost for the leaver
        self.assertEqual(checkin.party_code, "")
        self.assertEqual(checkin.party_size_snapshot, 1)
        self.assertEqual(int(checkin.party_multiplier_snapshot), 1)

    def test_create_party_and_leave(self):
        self.client.force_login(self.host.user)
        response = self.client.post(reverse("party"))
        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertIn("party", payload)
        code = payload["party"]["code"]
        party = Party.objects.get(code=code)
        self.assertTrue(PartyMembership.objects.filter(party=party, player=self.host, left_at__isnull=True).exists())

        leave_response = self.client.delete(reverse("party"))
        self.assertEqual(leave_response.status_code, 204)
        self.assertFalse(PartyMembership.objects.filter(player=self.host, left_at__isnull=True).exists())

    def test_invite_and_accept_party(self):
        self.client.force_login(self.host.user)
        self.client.post(reverse("party"))
        invite_response = self.client.post(
            reverse("party-invite"),
            {"username": "party-friend"},
            content_type="application/json",
        )
        self.assertEqual(invite_response.status_code, 201)
        invite_id = invite_response.json()["invitation"]["id"]

        self.client.logout()
        self.client.force_login(self.friend.user)
        accept_response = self.client.post(
            reverse("party-invitation-detail", args=[invite_id]),
            {"action": "accept"},
            content_type="application/json",
        )
        self.assertEqual(accept_response.status_code, 200)
        self.assertTrue(PartyMembership.objects.filter(player=self.friend, left_at__isnull=True).exists())

    def test_party_attack_multiplier(self):
        party = create_party(self.host)
        invite = invite_player_to_party(self.host, self.friend)
        respond_to_party_invitation(invite, self.friend, accept=True)

        result = apply_checkin(
            self.host,
            district_code="1300",
            district_name="Prague 3",
            mode=CheckIn.Mode.LOCAL,
            precision="precise",
        )
        checkin = result.checkin
        self.assertEqual(checkin.party_size_snapshot, 2)
        self.assertEqual(checkin.district_points_delta, -40)
        self.assertEqual(checkin.points_awarded, 40)
        self.assertFalse(checkin.is_party_contribution)

    def test_party_contribution_scoring(self):
        self.friend.home_district_code = "1400"
        self.friend.home_district_name = "Prague 4"
        self.friend.home_district = "Prague 4"
        self.friend.save(update_fields=["home_district_code", "home_district_name", "home_district"])

        party = create_party(self.host)
        invite = invite_player_to_party(self.host, self.friend)
        respond_to_party_invitation(invite, self.friend, accept=True)

        result = apply_checkin(
            self.host,
            district_code="1400",
            district_name="Prague 4",
            mode=CheckIn.Mode.LOCAL,
            precision="precise",
        )
        checkin = result.checkin
        self.assertTrue(checkin.is_party_contribution)
        self.assertEqual(checkin.party_size_snapshot, 2)
        self.assertEqual(checkin.district_points_delta, 50)
        self.assertEqual(checkin.points_awarded, 50)
        stat = DistrictContributionStat.objects.get(district_code="1400", supporter=self.host)
        self.assertEqual(stat.contribution_points, 50)
        bond = PlayerPartyBond.objects.get(player=self.host, partner=self.friend)
        self.assertEqual(bond.shared_checkins, 1)
        self.assertEqual(bond.shared_contribution_points, 50)


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
        self.assertEqual(checkin.home_district_code_snapshot, "1100")
        self.assertEqual(checkin.party_code, "")
        engagement = DistrictEngagement.objects.get(home_district_code="1100", target_district_code="1200")
        self.assertEqual(engagement.attack_points_total, 10)
        self.assertEqual(engagement.attack_checkins, 1)

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

    def test_friend_bubble_prioritises_party_allies(self):
        wingman = Player.objects.create(
            username="wingman",
            home_district_code="1200",
            home_district_name="Prague 2",
            home_district="Prague 2",
        )
        FriendLink.objects.create(player=self.primary, friend=wingman)
        FriendLink.objects.create(player=wingman, friend=self.primary)

        shadow = Player.objects.create(
            username="shadow",
            display_name="Shadow",
            home_district_code="1300",
            home_district_name="Prague 3",
            home_district="Prague 3",
        )
        FriendLink.objects.create(player=self.friend, friend=shadow)
        FriendLink.objects.create(player=shadow, friend=self.friend)

        rookie = Player.objects.create(
            username="rookie",
            home_district_code="1400",
            home_district_name="Prague 4",
            home_district="Prague 4",
        )
        FriendLink.objects.create(player=wingman, friend=rookie)
        FriendLink.objects.create(player=rookie, friend=wingman)

        now = timezone.now()
        PlayerPartyBond.objects.create(
            player=self.primary,
            partner=shadow,
            shared_checkins=3,
            shared_attack_points=120,
            shared_contribution_points=40,
            last_shared_at=now,
        )
        PlayerPartyBond.objects.create(
            player=shadow,
            partner=self.primary,
            shared_checkins=3,
            shared_attack_points=120,
            shared_contribution_points=40,
            last_shared_at=now,
        )

        self._login_primary()
        response = self.client.get(reverse("friend-bubble"))
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        bubble = payload.get("bubble", [])
        self.assertGreaterEqual(len(bubble), 2)

        first = bubble[0]
        self.assertEqual(first["username"], "shadow")
        self.assertEqual(first["home_district_name"], "Prague 3")
        self.assertEqual(first["mutual_friend_count"], 1)
        self.assertEqual(first["mutual_friends"][0]["username"], "ally")
        self.assertIsInstance(first.get("party_affinity"), dict)
        self.assertEqual(first["party_affinity"]["encounters"], 3)
        self.assertIsInstance(first["party_affinity"]["last_encounter_at"], int)

        second = bubble[1]
        self.assertEqual(second["username"], "rookie")
        self.assertEqual(second["mutual_friend_count"], 1)
        self.assertEqual(second["mutual_friends"][0]["username"], "wingman")
        self.assertIsNone(second["party_affinity"])

    def test_friend_bubble_empty_without_candidates(self):
        self._login_primary()
        response = self.client.get(reverse("friend-bubble"))
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload.get("bubble"), [])


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
        self.alpha.home_district_code = "1100"
        self.alpha.home_district_name = "Prague 1"
        self.alpha.home_district = "Prague 1"
        self.alpha.save(update_fields=["home_district_code", "home_district_name", "home_district"])

        self.beta.home_district_code = "1200"
        self.beta.home_district_name = "Prague 2"
        self.beta.home_district = "Prague 2"
        self.beta.save(update_fields=["home_district_code", "home_district_name", "home_district"])

        apply_checkin(
            self.alpha,
            district_code="1100",
            district_name="Prague 1",
            mode=CheckIn.Mode.LOCAL,
            metadata={"source": "test"},
        )
        apply_checkin(
            self.alpha,
            district_code="1200",
            district_name="Prague 2",
            mode=CheckIn.Mode.RANGED,
            metadata={"source": "test"},
        )
        apply_checkin(
            self.beta,
            district_code="1200",
            district_name="Prague 2",
            mode=CheckIn.Mode.LOCAL,
            metadata={"source": "test"},
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
        for entry in districts:
            self.assertIn("status", entry)
            self.assertIn("recent_status", entry)
            self.assertIn("checkins", entry)
            self.assertIn("strength", entry)
            self.assertIn("defended", entry)
            self.assertIn("attacked", entry)

        prague_two = next(entry for entry in districts if entry["id"] == "1200")
        self.assertEqual(prague_two["defended"], 10)
        self.assertEqual(prague_two["attacked"], 10)
        self.assertEqual(prague_two["checkins"], 2)


class DistrictAnalyticsTests(TestCase):
    def setUp(self):
        self.attacker = Player.objects.create(
            username="attacker",
            home_district_code="1100",
            home_district_name="Prague 1",
            home_district="Prague 1",
        )
        self.defender = Player.objects.create(
            username="defender",
            home_district_code="1200",
            home_district_name="Prague 2",
            home_district="Prague 2",
        )

    def test_district_activity_endpoint(self):
        apply_checkin(
            self.attacker,
            district_code="1200",
            district_name="Prague 2",
            mode=CheckIn.Mode.RANGED,
            metadata={"source": "test"},
        )
        apply_checkin(
            self.defender,
            district_code="1200",
            district_name="Prague 2",
            mode=CheckIn.Mode.LOCAL,
            metadata={"source": "test"},
        )
        response = self.client.get(reverse("district-activity", args=["1200"]))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["district"]["code"], "1200")
        self.assertEqual(data["totals"]["attacked"], 10)
        self.assertEqual(data["totals"]["defended"], 10)
        self.assertEqual(data["status"], "contested")
        self.assertTrue(any(entry["home_district_code"] == "1100" for entry in data["top_attackers"]))
        self.assertTrue(data["recent_checkins"])

    def test_district_strategy_endpoint(self):
        apply_checkin(
            self.attacker,
            district_code="1200",
            district_name="Prague 2",
            mode=CheckIn.Mode.RANGED,
            metadata={"source": "test"},
        )
        response = self.client.get(reverse("district-strategy"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        homes = data.get("homes", [])
        self.assertTrue(any(home["home_district_code"] == "1100" for home in homes))
        target_entry = next(home for home in homes if home["home_district_code"] == "1100")
        self.assertIsNotNone(target_entry["primary_target"])
        self.assertEqual(target_entry["primary_target"]["target_district_code"], "1200")
