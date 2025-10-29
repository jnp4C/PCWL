from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0010_checkin"),
    ]

    operations = [
        migrations.CreateModel(
            name="DistrictEngagement",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("home_district_code", models.CharField(max_length=64)),
                ("home_district_name", models.CharField(blank=True, max_length=120)),
                ("target_district_code", models.CharField(max_length=64)),
                ("target_district_name", models.CharField(blank=True, max_length=120)),
                ("attack_points_total", models.PositiveIntegerField(default=0)),
                ("attack_checkins", models.PositiveIntegerField(default=0)),
                ("party_attack_checkins", models.PositiveIntegerField(default=0)),
                ("last_attack_at", models.DateTimeField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["home_district_code", "-attack_points_total", "target_district_code"],
            },
        ),
        migrations.AddField(
            model_name="checkin",
            name="home_district_code_snapshot",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="checkin",
            name="home_district_name_snapshot",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="checkin",
            name="party_code",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddConstraint(
            model_name="districtengagement",
            constraint=models.UniqueConstraint(
                fields=("home_district_code", "target_district_code"),
                name="unique_home_target_engagement",
            ),
        ),
    ]
