from django.db import migrations, transaction
from django.db.models import F

LEGACY_ALIAS_MAP = (
    ("1600", "500178"),
    ("PRAHA6", "500178"),
    ("PRAGUE6", "500178"),
)


def _merge_alias_district(
    *,
    alias,
    canonical,
    District,
    Player,
    PlayerDistrictContribution,
    DistrictContributionStat,
    DistrictEngagement,
    CheckIn,
):
    base_strength = alias.base_strength or 0
    current_strength = alias.current_strength if alias.current_strength is not None else base_strength
    delta_strength = current_strength - base_strength
    District.objects.filter(pk=canonical.pk).update(
        current_strength=F("current_strength") + delta_strength,
        defended_points_total=F("defended_points_total") + (alias.defended_points_total or 0),
        attacked_points_total=F("attacked_points_total") + (alias.attacked_points_total or 0),
        checkin_total=F("checkin_total") + (alias.checkin_total or 0),
    )
    PlayerDistrictContribution.objects.filter(district=alias).update(district=canonical)
    Player.objects.filter(home_district_ref=alias).update(home_district_ref=canonical)
    Player.objects.filter(home_district_code__iexact=alias.code).update(
        home_district_code=canonical.code,
        home_district_name=canonical.name,
        home_district=canonical.name,
    )
    DistrictContributionStat.objects.filter(district_code__iexact=alias.code).update(
        district_code=canonical.code
    )
    DistrictEngagement.objects.filter(home_district_code__iexact=alias.code).update(
        home_district_code=canonical.code,
        home_district_name=canonical.name,
    )
    DistrictEngagement.objects.filter(target_district_code__iexact=alias.code).update(
        target_district_code=canonical.code,
        target_district_name=canonical.name,
    )
    CheckIn.objects.filter(district_code__iexact=alias.code).update(
        district_code=canonical.code,
        district_name=canonical.name,
    )
    CheckIn.objects.filter(home_district_code_snapshot__iexact=alias.code).update(
        home_district_code_snapshot=canonical.code,
        home_district_name_snapshot=canonical.name,
    )
    alias.delete()


def normalize_legacy_district_codes(apps, schema_editor):
    District = apps.get_model("game", "District")
    Player = apps.get_model("game", "Player")
    PlayerDistrictContribution = apps.get_model("game", "PlayerDistrictContribution")
    DistrictContributionStat = apps.get_model("game", "DistrictContributionStat")
    DistrictEngagement = apps.get_model("game", "DistrictEngagement")
    CheckIn = apps.get_model("game", "CheckIn")

    with transaction.atomic():
        for alias_code, canonical_code in LEGACY_ALIAS_MAP:
            alias_qs = District.objects.filter(code__iexact=alias_code)
            if not alias_qs.exists():
                continue
            canonical = District.objects.filter(code=canonical_code).first()
            if canonical is None:
                canonical = alias_qs.first()
                if canonical.code != canonical_code:
                    canonical.code = canonical_code
                    canonical.save(update_fields=["code", "updated_at"])
                alias_qs = alias_qs.exclude(pk=canonical.pk)
            for alias in alias_qs:
                _merge_alias_district(
                    alias=alias,
                    canonical=canonical,
                    District=District,
                    Player=Player,
                    PlayerDistrictContribution=PlayerDistrictContribution,
                    DistrictContributionStat=DistrictContributionStat,
                    DistrictEngagement=DistrictEngagement,
                    CheckIn=CheckIn,
                )


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0018_auto_20251115_1701"),
    ]

    operations = [
        migrations.RunPython(normalize_legacy_district_codes, migrations.RunPython.noop),
    ]
