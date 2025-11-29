from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0023_district_party_stats"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="profile_bio",
            field=models.CharField(
                default="",
                blank=True,
                max_length=50,
                help_text="Short public bio/message shown on the player's profile (<= 50 chars).",
            ),
        ),
    ]
