from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0030_merge_0029"),
    ]

    operations = [
        migrations.AlterField(
            model_name="player",
            name="profile_image_url",
            field=models.TextField(blank=True, default=""),
        ),
    ]
