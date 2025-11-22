from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0022_party_leaderboard_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="DistrictPartyStat",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("prestige_points", models.PositiveBigIntegerField(default=0)),
                ("last_activity_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("district", models.ForeignKey(on_delete=models.CASCADE, related_name="party_stats", to="game.district")),
                ("party", models.ForeignKey(on_delete=models.CASCADE, related_name="district_stats", to="game.party")),
            ],
            options={
                "unique_together": {("district", "party")},
            },
        ),
        migrations.AddIndex(
            model_name="districtpartystat",
            index=models.Index(fields=["district"], name="district_party_stat_district_idx"),
        ),
        migrations.AddIndex(
            model_name="districtpartystat",
            index=models.Index(fields=["party"], name="district_party_stat_party_idx"),
        ),
        migrations.AddIndex(
            model_name="districtpartystat",
            index=models.Index(fields=["last_activity_at"], name="district_party_stat_activity_idx"),
        ),
    ]
