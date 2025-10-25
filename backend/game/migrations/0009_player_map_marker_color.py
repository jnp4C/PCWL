from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0008_player_profile_image_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="map_marker_color",
            field=models.CharField(
                blank=True,
                default="#6366f1",
                help_text="Hex color (e.g. #ff0000) used to render the player's map marker.",
                max_length=16,
            ),
        ),
    ]

