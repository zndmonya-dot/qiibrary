@echo off
(
echo # Database
echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booktuber?client_encoding=utf8
echo.
echo # API Keys
echo QIITA_API_TOKEN=e7a768292ef8fcf440fd5991d5f1c40ba26962ed
echo RAKUTEN_APPLICATION_ID=1071050827889458183
echo.
echo # Affiliate IDs
echo AMAZON_ASSOCIATE_TAG=
echo RAKUTEN_AFFILIATE_ID=4d68df76.e6c2f9be.4d68df77.c1a45e1f
echo.
echo # Redis
echo REDIS_URL=redis://localhost:6379/0
echo.
echo # JWT
echo SECRET_KEY=your-secret-key-change-this-in-production-d47408be2e6ab48535f199cfc45be100
echo.
echo # CORS
echo FRONTEND_URL=http://localhost:3000
echo.
echo # Environment
echo ENVIRONMENT=development
echo TIMEZONE=Asia/Tokyo
) > .env
echo .env file created successfully!

