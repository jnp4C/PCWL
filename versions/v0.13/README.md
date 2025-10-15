Build 12 snapshot
=================

Snapshot captured after introducing persistent district control scoring and the dual player/district leaderboards.
Districts now start at 2,000 points, defend and attack actions adjust their totals, and the leaderboard page renders live tables for both players and districts.
Included files mirror the project root at capture time.

Data slimming note
------------------

The heavy GIS datasets previously bundled under `versions/v0.13/data/` have
been deduplicated to keep the repository lightweight. The snapshot now reads
shared resources from the root-level `data/` directory. Start your static
server from `versions/v0.13/` as before; the app will transparently load the
shared assets.
