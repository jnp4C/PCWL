#!/usr/bin/env bash
set -euo pipefail

# Project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/8] Ensuring directories exist..."
mkdir -p backend/game
mkdir -p backend/pcwl_backend

ensure_file() {
  local path="$1"
  if [ ! -f "$path" ]; then
    echo "# Autocreated by apply_backend_patches.sh" > "$path"
  fi
}

ensure_file "backend/game/models.py"
ensure_file "backend/game/serializers.py"
ensure_file "backend/game/views.py"
ensure_file "backend/game/urls.py"
ensure_file "backend/pcwl_backend/settings.py"
ensure_file "backend/pcwl_backend/urls.py"

echo "[2/8] Writing models..."
cat > backend/game/models.py <<'PY'
from django.conf import settings
from django.db import models


class PlayerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")

    # Home district selection
    home_district_id = models.CharField(max_length=64, null=True, blank=True)
    home_district_name = models.CharField(max_length=128, null=True, blank=True)

    # Last known precise location
    last_lng = models.FloatField(null=True, blank=True)
    last_lat = models.FloatField(null=True, blank=True)
    last_district_id = models.CharField(max_length=64, null=True, blank=True)
    last_district_name = models.CharField(max_length=128, null=True, blank=True)
    last_timestamp = models.DateTimeField(null=True, blank=True)

    # Gameplay counters
    points = models.IntegerField(default=0)
    attack_points = models.IntegerField(default=0)
    defend_points = models.IntegerField(default=0)
    checkins_count = models.IntegerField(default=0)

    # Cooldown and charge state
    cooldown_until = models.DateTimeField(null=True, blank=True)
    next_checkin_multiplier = models.IntegerField(default=1)

    def __str__(self):
        return f"Profile({self.user.username})"
PY

echo "[3/8] Writing serializers..."
cat > backend/game/serializers.py <<'PY'
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PlayerProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "password")

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = PlayerProfile
        fields = (
            "username",
            "home_district_id",
            "home_district_name",
            "last_lng",
            "last_lat",
            "last_district_id",
            "last_district_name",
            "last_timestamp",
            "points",
            "attack_points",
            "defend_points",
            "checkins_count",
            "cooldown_until",
            "next_checkin_multiplier",
        )

    def get_username(self, obj):
        return obj.user.username


class UpdateLocationSerializer(serializers.Serializer):
    lng = serializers.FloatField(required=False)
    lat = serializers.FloatField(required=False)
    district_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    district_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    timestamp = serializers.DateTimeField(required=False)


class SetHomeSerializer(serializers.Serializer):
    district_id = serializers.CharField()
    district_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class CheckinSerializer(serializers.Serializer):
    district_id = serializers.CharField()
    district_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    type = serializers.ChoiceField(choices=("attack", "defend"))
    precise_local = serializers.BooleanField(required=False, default=False)
    ranged = serializers.BooleanField(required=False, default=False)
PY

echo "[4/8] Writing views..."
cat > backend/game/views.py <<'PY'
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate, login
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import PlayerProfile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ProfileSerializer,
    UpdateLocationSerializer,
    SetHomeSerializer,
    CheckinSerializer,
)

CHECK_IN_COOLDOWN_SECONDS = 10 * 60
POINTS_PER_CHECKIN = 10
CHARGE_ATTACK_MULTIPLIER = 3


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        PlayerProfile.objects.get_or_create(user=user)
        return Response({"ok": True, "username": user.username}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = authenticate(
            request, username=ser.validated_data["username"], password=ser.validated_data["password"]
        )
        if not user:
            return Response({"ok": False, "error": "invalid_credentials"}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        profile, _ = PlayerProfile.objects.get_or_create(user=user)
        return Response({"ok": True, "profile": ProfileSerializer(profile).data})


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = PlayerProfile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)


class UpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = UpdateLocationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        profile, _ = PlayerProfile.objects.get_or_create(user=request.user)

        lng = ser.validated_data.get("lng", profile.last_lng)
        lat = ser.validated_data.get("lat", profile.last_lat)
        district_id = ser.validated_data.get("district_id", profile.last_district_id)
        district_name = ser.validated_data.get("district_name", profile.last_district_name)
        ts = ser.validated_data.get("timestamp") or timezone.now()

        profile.last_lng = lng
        profile.last_lat = lat
        profile.last_district_id = district_id or None
        profile.last_district_name = (district_name or None)
        profile.last_timestamp = ts
        profile.save()

        return Response({"ok": True, "profile": ProfileSerializer(profile).data})


class SetHomeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = SetHomeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        profile, _ = PlayerProfile.objects.get_or_create(user=request.user)
        profile.home_district_id = ser.validated_data["district_id"]
        profile.home_district_name = ser.validated_data.get("district_name") or profile.home_district_name
        profile.save()
        return Response({"ok": True, "profile": ProfileSerializer(profile).data})


class ChargeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = PlayerProfile.objects.get_or_create(user=request.user)
        now = timezone.now()
        if profile.cooldown_until and profile.cooldown_until > now:
            return Response({"ok": False, "error": "cooldown_active"}, status=status.HTTP_400_BAD_REQUEST)
        profile.next_checkin_multiplier = CHARGE_ATTACK_MULTIPLIER
        profile.cooldown_until = now + timedelta(seconds=CHECK_IN_COOLDOWN_SECONDS)
        profile.save()
        return Response({"ok": True, "profile": ProfileSerializer(profile).data})


class CheckinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = CheckinSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        profile, _ = PlayerProfile.objects.get_or_create(user=request.user)

        now = timezone.now()
        if profile.cooldown_until and profile.cooldown_until > now:
            return Response({"ok": False, "error": "cooldown_active"}, status=status.HTTP_400_BAD_REQUEST)

        district_id = ser.validated_data["district_id"]
        district_name = ser.validated_data.get("district_name")
        action_type = ser.validated_data["type"]
        precise_local = ser.validated_data.get("precise_local", False)
        ranged = ser.validated_data.get("ranged", False)

        is_defend = action_type == "defend"
        if is_defend and (not profile.home_district_id or profile.home_district_id != district_id):
            return Response({"ok": False, "error": "not_home"}, status=status.HTTP_400_BAD_REQUEST)

        charge_mult = max(1, int(profile.next_checkin_multiplier or 1))
        base = POINTS_PER_CHECKIN if is_defend or not ranged else 10
        local_bonus = (2 if (not is_defend and precise_local) else 1)
        effective_mult = charge_mult * local_bonus
        awarded = base * effective_mult

        profile.points += awarded
        if is_defend:
            profile.defend_points += awarded
        else:
            profile.attack_points += awarded
        profile.checkins_count += 1

        if precise_local and district_id:
            profile.last_district_id = district_id
            profile.last_district_name = district_name or profile.last_district_name or f"District {district_id}"
            profile.last_timestamp = now

        profile.next_checkin_multiplier = 1
        profile.cooldown_until = now + timedelta(seconds=CHECK_IN_COOLDOWN_SECONDS)
        profile.save()

        return Response(
            {
                "ok": True,
                "awarded": awarded,
                "multiplier": effective_mult,
                "type": action_type,
                "profile": ProfileSerializer(profile).data,
            }
        )
PY

echo "[5/8] Writing app urls..."
cat > backend/game/urls.py <<'PY'
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    UpdateLocationView,
    SetHomeView,
    ChargeView,
    CheckinView,
)

urlpatterns = [
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/profile/", ProfileView.as_view(), name="profile"),
    path("api/location/update/", UpdateLocationView.as_view(), name="update_location"),
    path("api/home/set/", SetHomeView.as_view(), name="set_home"),
    path("api/charge/", ChargeView.as_view(), name="charge"),
    path("api/checkin/", CheckinView.as_view(), name="checkin"),
]
PY

echo "[6/8] Ensuring settings has required apps..."
# Append rest_framework and game if missing
if ! grep -q "rest_framework" backend/pcwl_backend/settings.py; then
  python3 - <<'PY'
from pathlib import Path
p = Path("backend/pcwl_backend/settings.py")
s = p.read_text()
marker = "INSTALLED_APPS = ["
if marker in s:
    before, after = s.split(marker, 1)
    head, tail = after.split("]", 1)
    items = head.strip()
    if "'rest_framework'," not in items and '"rest_framework",' not in items:
        items += "\n    'rest_framework',"
    if "'game'," not in items and '"game",' not in items:
        items += "\n    'game',"
    new = before + marker + "\n    " + items.strip() + "\n]" + tail
    p.write_text(new)
PY
fi

echo "[7/8] Ensuring project urls include app urls..."
if ! grep -q "include(\"game.urls\")" backend/pcwl_backend/urls.py && ! grep -q "include('game.urls')" backend/pcwl_backend/urls.py; then
  python3 - <<'PY'
from pathlib import Path
p = Path("backend/pcwl_backend/urls.py")
s = p.read_text()
if "from django.urls import path, include" not in s:
    s = s.replace("from django.urls import path", "from django.urls import path, include")
if "urlpatterns =" in s:
    s = s.replace("urlpatterns = [", "urlpatterns = [\n    path('', include('game.urls')),\n")
p.write_text(s)
PY
fi

echo "[8/8] Installing deps and migrating..."
if [ -d "venv" ]; then
  # shellcheck source=/dev/null
  source venv/bin/activate || true
fi

pip install -q djangorestframework || true
cd backend
python manage.py makemigrations
python manage.py migrate

echo "Done. Start server with:"
echo "  cd backend && python manage.py runserver 0.0.0.0:8000"
