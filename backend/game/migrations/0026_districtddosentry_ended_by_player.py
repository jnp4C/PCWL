from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0025_auto_20251130_0915"),
    ]

    operations = [
        migrations.AddField(
            model_name="districtddosentry",
            name="ended_by_player",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="ended_ddos_entries",
                to="game.player",
            ),
        ),
    ]
