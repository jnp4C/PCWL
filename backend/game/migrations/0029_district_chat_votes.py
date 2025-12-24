from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0028_districtwormentry"),
    ]

    operations = [
        migrations.AddField(
            model_name="districtchatmessage",
            name="room",
            field=models.CharField(
                choices=[("main", "Main"), ("visitors", "Visitors")],
                db_index=True,
                default="main",
                max_length=12,
            ),
        ),
        migrations.AddIndex(
            model_name="districtchatmessage",
            index=models.Index(fields=["district", "room", "-sent_at"], name="district_chat_room_idx"),
        ),
        migrations.CreateModel(
            name="DistrictChatVote",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("period_start", models.DateTimeField(db_index=True)),
                ("choice", models.CharField(choices=[("open", "Open"), ("closed", "Closed")], max_length=8)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "district",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="chat_votes", to="game.district"),
                ),
                (
                    "player",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="district_chat_votes", to="game.player"),
                ),
            ],
            options={},
        ),
        migrations.AddConstraint(
            model_name="districtchatvote",
            constraint=models.UniqueConstraint(
                fields=("district", "player", "period_start"), name="unique_district_chat_vote"
            ),
        ),
        migrations.AddIndex(
            model_name="districtchatvote",
            index=models.Index(fields=["district", "period_start"], name="district_chat_vote_period_idx"),
        ),
    ]
