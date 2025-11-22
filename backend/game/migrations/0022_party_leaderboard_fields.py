from django.db import migrations, models
from django.db.models import Max


def backfill_party_links(apps, schema_editor):
    CheckIn = apps.get_model("game", "CheckIn")
    Party = apps.get_model("game", "Party")
    party_codes = {p.code: p.id for p in Party.objects.all()}

    # Attach party FK where possible
    pending = CheckIn.objects.filter(party__isnull=True).exclude(party_code="")
    for checkin in pending.iterator():
        party_id = party_codes.get(checkin.party_code)
        if party_id:
            checkin.party_id = party_id
            checkin.save(update_fields=["party"])

    # Refresh last_active_at from check-in history
    aggregates = (
        CheckIn.objects.filter(party__isnull=False)
        .values("party_id")
        .annotate(last=Max("occurred_at"))
    )
    for row in aggregates:
        Party.objects.filter(id=row["party_id"]).update(last_active_at=row["last"])


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0021_player_streak_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="party",
            name="last_active_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="checkin",
            name="party",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name="checkins",
                to="game.party",
            ),
        ),
        migrations.AddIndex(
            model_name="checkin",
            index=models.Index(fields=["party_code"], name="checkin_party_code_idx"),
        ),
        migrations.AddIndex(
            model_name="checkin",
            index=models.Index(fields=["party"], name="checkin_party_idx"),
        ),
        migrations.AddIndex(
            model_name="checkin",
            index=models.Index(fields=["player", "occurred_at"], name="checkin_player_time_idx"),
        ),
        migrations.AddIndex(
            model_name="checkin",
            index=models.Index(fields=["district_code"], name="checkin_district_idx"),
        ),
        migrations.AddIndex(
            model_name="party",
            index=models.Index(fields=["leader"], name="party_leader_idx"),
        ),
        migrations.AddIndex(
            model_name="party",
            index=models.Index(fields=["status"], name="party_status_idx"),
        ),
        migrations.AddIndex(
            model_name="partymembership",
            index=models.Index(fields=["party", "left_at"], name="party_membership_party_left_idx"),
        ),
        migrations.AddIndex(
            model_name="partymembership",
            index=models.Index(fields=["player"], name="party_membership_player_idx"),
        ),
        migrations.AddIndex(
            model_name="partyinvitation",
            index=models.Index(fields=["party", "status"], name="party_invite_status_idx"),
        ),
        migrations.AddIndex(
            model_name="partyinvitation",
            index=models.Index(fields=["to_player"], name="party_invite_target_idx"),
        ),
        migrations.AddIndex(
            model_name="partyjoinrequest",
            index=models.Index(fields=["party", "status"], name="party_join_status_idx"),
        ),
        migrations.AddIndex(
            model_name="partyjoinrequest",
            index=models.Index(fields=["from_player"], name="party_join_from_idx"),
        ),
        migrations.RunPython(backfill_party_links, migrations.RunPython.noop),
    ]
