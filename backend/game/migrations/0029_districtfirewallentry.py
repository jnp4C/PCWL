from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0028_districtwormentry"),
    ]

    operations = [
        migrations.CreateModel(
            name="DistrictFirewallEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("defender_ip", models.CharField(blank=True, default="", max_length=32)),
                ("started_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("expires_at", models.DateTimeField()),
                ("ended_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "defender",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="firewall_entries",
                        to="game.player",
                    ),
                ),
                (
                    "defender_home_district",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="outgoing_firewall_entries",
                        to="game.district",
                    ),
                ),
                (
                    "district",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="active_firewall_entries",
                        to="game.district",
                    ),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["district", "expires_at"], name="firewall_district_expires_idx"),
                    models.Index(fields=["defender", "expires_at"], name="firewall_defender_expires_idx"),
                ],
            },
        ),
    ]
