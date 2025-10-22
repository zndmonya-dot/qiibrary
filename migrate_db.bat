@echo off
echo ================================================
echo YouTube Details Migration
echo ================================================
echo.
echo Connecting to Neon DB...
echo.

psql "postgresql://neondb_owner:npg_XOEKiw51krxM@ep-wispy-breeze-a9dh6sch-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "ALTER TABLE book_youtube_links ADD COLUMN IF NOT EXISTS channel_name VARCHAR(255), ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS published_at TIMESTAMP; CREATE INDEX IF NOT EXISTS idx_youtube_links_view_count ON book_youtube_links(view_count DESC);"

echo.
echo ================================================
echo Migration Complete!
echo ================================================
echo.
echo Verifying columns...
psql "postgresql://neondb_owner:npg_XOEKiw51krxM@ep-wispy-breeze-a9dh6sch-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "\d book_youtube_links"

pause

