from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0007_auto_20251025_1210"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="profile_image_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]
