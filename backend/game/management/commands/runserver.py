from django.core.management import call_command
from django.core.management.commands.runserver import Command as RunserverCommand


class Command(RunserverCommand):
    """Runserver command that ensures DB migrations are applied first in development.

    This helps avoid the common warning: "You have unapplied migration(s)" when
    developers start the server without running `migrate` manually.

    Behavior:
    - By default, auto-migrate runs only when settings.DEBUG is True.
    - You can disable this by setting AUTO_MIGRATE_ON_RUNSERVER = False in settings.
    """

    help = "Starts a lightweight Web server for development and applies migrations first."

    def inner_run(self, *args, **options):
        from django.conf import settings

        auto_migrate = getattr(settings, "AUTO_MIGRATE_ON_RUNSERVER", True)
        try:
            if auto_migrate and getattr(settings, "DEBUG", False):
                verbosity = options.get("verbosity", 1)
                self.stdout.write(self.style.NOTICE("[PCWL] Applying migrations before starting server..."))
                call_command("migrate", interactive=False, verbosity=verbosity)
                self.stdout.write(self.style.SUCCESS("[PCWL] Migrations are up to date."))
        except Exception as exc:
            # Do not block server start in dev, but inform the user clearly.
            self.stderr.write(
                self.style.WARNING(
                    f"[PCWL] Warning: auto-migrate failed: {exc}.\n"
                    "[PCWL] You can run migrations manually: bash scripts/migrate.sh or cd backend && python manage.py migrate"
                )
            )
        # Proceed with the normal runserver behavior
        return super().inner_run(*args, **options)
