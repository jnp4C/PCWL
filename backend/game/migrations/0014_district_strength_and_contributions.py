from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


def populate_home_district_refs(apps, schema_editor):
    District = apps.get_model('game', 'District')
    Player = apps.get_model('game', 'Player')

    for player in Player.objects.exclude(home_district_code__isnull=True).exclude(home_district_code=''):
        code = (player.home_district_code or '').strip()
        if not code:
            continue
        district = District.objects.filter(code=code).first()
        if district is None:
            name = (player.home_district_name or player.home_district or '').strip() or f"District {code}"
            district = District.objects.create(code=code, name=name, is_active=True)
        updates = {
            'home_district_ref_id': district.id,
        }
        if not player.home_district_name:
            updates['home_district_name'] = district.name
        if not player.home_district:
            updates['home_district'] = district.name
        updates['updated_at'] = timezone.now()
        Player.objects.filter(pk=player.pk).update(**updates)


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0013_district_catalog'),
    ]

    operations = [
        migrations.AddField(
            model_name='district',
            name='base_strength',
            field=models.IntegerField(default=2000, help_text='Baseline strength score used when computing district leaderboards.'),
        ),
        migrations.AddField(
            model_name='player',
            name='home_district_ref',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='players', to='game.District'),
        ),
        migrations.CreateModel(
            name='PlayerDistrictContribution',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('defend_points_total', models.PositiveIntegerField(default=0)),
                ('attack_points_total', models.PositiveIntegerField(default=0)),
                ('defend_checkins', models.PositiveIntegerField(default=0)),
                ('attack_checkins', models.PositiveIntegerField(default=0)),
                ('last_activity_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('district', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player_contributions', to='game.District')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='district_contributions', to='game.Player')),
            ],
            options={
                'ordering': ['-defend_points_total', 'player__username'],
            },
        ),
        migrations.AddConstraint(
            model_name='playerdistrictcontribution',
            constraint=models.UniqueConstraint(fields=('player', 'district'), name='unique_player_district_contribution'),
        ),
        migrations.RunPython(populate_home_district_refs, migrations.RunPython.noop),
    ]
