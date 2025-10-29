from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0009_player_map_marker_color"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="next_checkin_multiplier",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.CreateModel(
            name="CheckIn",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("occurred_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("district_code", models.CharField(blank=True, max_length=64)),
                ("district_name", models.CharField(blank=True, max_length=120)),
                (
                    "action",
                    models.CharField(
                        choices=[("attack", "Attack"), ("defend", "Defend")],
                        max_length=16,
                    ),
                ),
                (
                    "mode",
                    models.CharField(
                        choices=[("local", "Local"), ("remote", "Remote"), ("ranged", "Ranged")],
                        max_length=16,
                    ),
                ),
                ("multiplier", models.DecimalField(decimal_places=2, default=1, max_digits=6)),
                ("base_points", models.PositiveIntegerField(default=10)),
                ("points_awarded", models.IntegerField()),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "player",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="checkin_events",
                        to="game.player",
                    ),
                ),
            ],
            options={
                "ordering": ["-occurred_at"],
            },
        ),
    ]
