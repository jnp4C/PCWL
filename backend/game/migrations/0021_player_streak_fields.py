from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0020_player_preferred_party_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="streak_days",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="player",
            name="streak_last_day",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="player",
            name="streak_progress_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="player",
            name="streak_day_attack_done",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="player",
            name="streak_day_defend_done",
            field=models.BooleanField(default=False),
        ),
    ]
