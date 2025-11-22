from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0019_normalize_district_codes"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="preferred_party_name",
            field=models.CharField(blank=True, max_length=48),
        ),
    ]
