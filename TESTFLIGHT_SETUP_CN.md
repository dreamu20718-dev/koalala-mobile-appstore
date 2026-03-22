# 考拉拉专车司导端 iOS 上架配置（Codemagic）

## 1) Push code to Git

Codemagic builds from Git repository.  
Put folder `C:\codex\koalala-mobile` into your GitHub/GitLab/Bitbucket repo.

## 2) Connect project in Codemagic

1. Log in to Codemagic.
2. Add application from your Git repository.
3. Select config file: `codemagic.yaml`.
4. Select workflow: `ios_testflight`.

## 3) Configure App Store Connect integration

In Codemagic, add Apple integration (App Store Connect API key):

- `Issuer ID`
- `Key ID`
- `Private key (.p8 content)`

Then add environment variable group named:

- `app_store_credentials`

Bind this group to workflow `ios_testflight`.

## 4) First build requirements in Apple side

Before first successful TestFlight upload, ensure:

1. Apple Developer Program is active.
2. Bundle ID exists: `com.iplay.koalala`.
3. App record exists in App Store Connect:
   - App Name: `考拉拉专车司导端`
   - Version: `1.0.0`
   - Build Number: `1001` (corresponds to internal release tag `1.0.0.1`)
4. Team members have permission for Certificates/Profiles/TestFlight.

## 5) Trigger build

In Codemagic:

1. Open workflow `ios_testflight`.
2. Click `Start new build`.
3. Wait for build and upload to finish.

After success:
- TestFlight will receive the build.
- App Store Connect will receive the submission package for App Review.

## 6) Same database confirmation

This mobile app and website use the same API base URL:

- `https://koalala-api.dreamu20718.workers.dev`

The API is connected to D1 database:

- `koalala-prod`

So TestFlight app and website data are from the same database.

## 7) Common failure checks

1. Signing failed: re-check API key permissions and Team.
2. Bundle ID mismatch: keep `com.iplay.koalala` consistent in Apple + project.
3. Upload failed: check if App record exists for this Bundle ID.
4. API request blocked on app: deploy latest `koalala-api` CORS config before testing.
