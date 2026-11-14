export interface AndroidSourceFile {
  path: string;
  layer: 'Manifest & Gradle' | 'Data & Room' | 'Network & Security' | 'Workers & Utils' | 'Jetpack Compose UI';
  language: 'kotlin' | 'xml' | 'gradle' | 'yaml';
  summary: string;
  code: string;
}

export const ANDROID_SOURCE_FILES: AndroidSourceFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    layer: 'Manifest & Gradle',
    language: 'xml',
    summary: 'Declares READ_CALL_LOG, READ_PHONE_STATE, POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM, CallStateReceiver, and FollowUpAlarmReceiver.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
    </queries>

    <application
        android:allowBackup="false"
        android:icon="@drawable/ic_crm_launcher"
        android:label="RealEstate CRM"
        android:supportsRtl="true"
        android:theme="@style/Theme.RealEstateCrm">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".worker.CallStateReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.PHONE_STATE" />
            </intent-filter>
        </receiver>

        <receiver
            android:name=".worker.FollowUpAlarmReceiver"
            android:exported="false" />

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/res/xml/file_paths.xml',
    layer: 'Manifest & Gradle',
    language: 'xml',
    summary: 'Exposes cacheDir for FileProvider CSV sharing from ManagerDashboardScreen.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<paths>
    <cache-path name="exports" path="." />
</paths>`,
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    layer: 'Manifest & Gradle',
    language: 'xml',
    summary: 'Base light Material theme referenced by AndroidManifest.xml.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.RealEstateCrm" parent="android:Theme.Material.Light.NoActionBar" />
</resources>`,
  },
  {
    path: 'app/src/main/res/drawable/ic_crm_launcher.xml',
    layer: 'Manifest & Gradle',
    language: 'xml',
    summary: 'Vector launcher icon so APK builds cleanly without binary PNG assets.',
    code: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#14263D"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#256F73"
        android:pathData="M54,22L22,48v38h22V64h20v22h22V48L54,22z" />
    <path
        android:fillColor="#D69E48"
        android:pathData="M48,44h12v10H48z" />
</vector>`,
  },
  {
    path: 'settings.gradle.kts',
    layer: 'Manifest & Gradle',
    language: 'gradle',
    summary: 'Root Gradle settings configuring Google & Maven Central repositories and :app module.',
    code: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "RealEstateCRM"
include(":app")`,
  },
  {
    path: 'build.gradle.kts',
    layer: 'Manifest & Gradle',
    language: 'gradle',
    summary: 'Root Gradle plugin declarations (AGP 8.7.2, Kotlin 2.0.21, Compose Compiler, KSP).',
    code: `plugins {
    id("com.android.application") version "8.7.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
    id("com.google.devtools.ksp") version "2.0.21-1.0.26" apply false
}`,
  },
  {
    path: 'gradle.properties',
    layer: 'Manifest & Gradle',
    language: 'gradle',
    summary: 'AndroidX, Jetpack, JVM memory flags, and CI fallback Apps Script properties.',
    code: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbyBalkB4uvyX7UVJRICDMtu6FHuQ99xsapVEYyjXE-DXlxh_jXUD_qcwQ4RwPz21NPqZw/exec
APPS_SCRIPT_API_KEY=MyEstate2026Key`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    layer: 'Manifest & Gradle',
    language: 'yaml',
    summary: 'GitHub Actions CI workflow that sets up Java 17, Android SDK, and Gradle 8.9 to build and upload app-debug.apk on every push.',
    code: `name: Build Android Debug APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      - name: Set up Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.9'

      - name: Build Debug APK
        run: gradle assembleDebug --no-daemon

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: realestate-crm-debug-apk
          path: app/build/outputs/apk/debug/*.apk`,
  },
  {
    path: 'local.properties',
    layer: 'Manifest & Gradle',
    language: 'gradle',
    summary: 'Live Google Apps Script Web App URL and API Secret Key injected into BuildConfig at APK build time.',
    code: `# Live Secured Google Apps Script Web App Configuration
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbyBalkB4uvyX7UVJRICDMtu6FHuQ99xsapVEYyjXE-DXlxh_jXUD_qcwQ4RwPz21NPqZw/exec
APPS_SCRIPT_API_KEY=MyEstate2026Key`,
  },
  {
    path: 'app/build.gradle.kts',
    layer: 'Manifest & Gradle',
    language: 'gradle',
    summary: 'Gradle setup (minSdk 26, targetSdk 35) with live Apps Script BuildConfig fields, Compose Material 3, Navigation Compose, Room KSP, WorkManager, and EncryptedSharedPreferences.',
    code: `import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

val localProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use(::load)
}

android {
    namespace = "com.realestate.crm"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.realestate.crm"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        val scriptUrl = localProps.getProperty("APPS_SCRIPT_URL")
            ?: "https://script.google.com/macros/s/AKfycbyBalkB4uvyX7UVJRICDMtu6FHuQ99xsapVEYyjXE-DXlxh_jXUD_qcwQ4RwPz21NPqZw/exec"
        val apiKey = localProps.getProperty("APPS_SCRIPT_API_KEY")
            ?: "MyEstate2026Key"

        buildConfigField("String", "APPS_SCRIPT_URL", "\\"$scriptUrl\\"")
        buildConfigField("String", "APPS_SCRIPT_API_KEY", "\\"$apiKey\\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")

    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.3")

    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    implementation("androidx.work:work-runtime-ktx:2.9.1")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/theme/Theme.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Light-first enterprise palette (#14263D Navy, #256F73 Teal, #F5F7FA Background, #FFFFFF Cards, #D9E1E8 Border, #D69E48 Gold).',
    code: `package com.realestate.crm.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val PrimaryNavy = Color(0xFF14263D)
val PrimaryTeal = Color(0xFF256F73)
val BackgroundSoft = Color(0xFFF5F7FA)
val SurfaceWhite = Color(0xFFFFFFFF)
val BorderGrey = Color(0xFFD9E1E8)
val SecondaryText = Color(0xFF46566A)

val AccentGold = Color(0xFFD69E48)
val SuccessGreen = Color(0xFF10B981)
val WarningAmber = Color(0xFFD97706)
val ErrorRed = Color(0xFFEF4444)

private val CrmColorScheme = lightColorScheme(
    primary = PrimaryTeal,
    onPrimary = Color.White,
    secondary = PrimaryNavy,
    onSecondary = Color.White,
    tertiary = AccentGold,
    background = BackgroundSoft,
    onBackground = PrimaryNavy,
    surface = SurfaceWhite,
    onSurface = PrimaryNavy,
    surfaceVariant = Color(0xFFEBF1F5),
    onSurfaceVariant = SecondaryText,
    outline = BorderGrey,
    error = ErrorRed
)

@Composable
fun RealEstateCrmTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = CrmColorScheme, content = content)
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/data/local/CrmDatabase.kt',
    layer: 'Data & Room',
    language: 'kotlin',
    summary: 'Room database with exact tables: Leads, CallLogs, WhatsAppLogs, PendingSyncQueue, and Templates.',
    code: `package com.realestate.crm.data.local

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "Leads")
data class LeadEntity(
    @PrimaryKey val leadId: String,
    val name: String,
    val phone: String, // Normalized 10 digits
    val campaignSource: String = "",
    val configRequirement: String = "",
    val preferredLocation: String = "",
    val budget: String = "",
    val assignedTo: String = "",
    val status: String = "New",
    val nextFollowUpAt: String = "", // yyyy-MM-dd HH:mm
    val notes: String = "",          // Timeline: [DD/MM hh:mm a - TelecallerName]: note
    val createdBy: String = "",
    val lastCalledAt: String = "",
    val whatsAppSharedCount: Int = 0,
    val updatedAt: String = ""
)

@Entity(
    tableName = "CallLogs",
    indices = [Index(value = ["phone", "startedAt"], unique = true)]
)
data class CallLogEntity(
    @PrimaryKey val operationId: String,
    val callId: String,
    val leadId: String,
    val telecallerId: String,
    val phone: String,
    val callType: String, // OUTGOING, INCOMING, MISSED, REJECTED
    val startedAt: Long,  // Epoch millis
    val durationSec: Int,
    val isConnected: Boolean, // true iff durationSec >= 15 and answered
    val disposition: String = "",
    val syncedToSheet: Boolean = false
)

@Entity(tableName = "WhatsAppLogs")
data class WhatsAppLogEntity(
    @PrimaryKey val operationId: String,
    val leadId: String,
    val telecallerId: String,
    val templateName: String,
    val sentAt: String,
    val syncedToSheet: Boolean = false
)

@Entity(tableName = "PendingSyncQueue")
data class PendingSyncEntity(
    @PrimaryKey val operationId: String,
    val action: String,      // UPSERT_LEAD, UPSERT_CALL_LOG, UPSERT_WHATSAPP_LOG, UPSERT_DAILY_REPORT
    val payloadJson: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "Templates")
data class TemplateEntity(
    @PrimaryKey val templateId: String,
    val projectName: String,
    val messageBody: String,
    val brochureUrl: String
)

@Dao
interface CrmDao {
    @Query("SELECT * FROM Leads ORDER BY updatedAt DESC")
    fun observeLeads(): Flow<List<LeadEntity>>

    @Query("SELECT * FROM Leads WHERE leadId = :leadId LIMIT 1")
    fun observeLeadById(leadId: String): Flow<LeadEntity?>

    @Query("SELECT * FROM Leads WHERE phone = :phone10 LIMIT 1")
    suspend fun findLeadByPhone(phone10: String): LeadEntity?

    @Query("SELECT phone FROM Leads")
    suspend fun getAllLeadPhones(): List<String>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertLeads(leads: List<LeadEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertLead(lead: LeadEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertCallLog(log: CallLogEntity): Long

    @Query("UPDATE CallLogs SET syncedToSheet = 1 WHERE operationId = :opId")
    suspend fun markCallSynced(opId: String)

    @Query("SELECT * FROM CallLogs WHERE startedAt BETWEEN :dayStart AND :dayEnd ORDER BY startedAt DESC")
    fun observeTodayCalls(dayStart: Long, dayEnd: Long): Flow<List<CallLogEntity>>

    @Query("SELECT * FROM CallLogs WHERE startedAt BETWEEN :dayStart AND :dayEnd")
    suspend fun getCallsBetween(dayStart: Long, dayEnd: Long): List<CallLogEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWhatsAppLog(log: WhatsAppLogEntity)

    @Query("UPDATE WhatsAppLogs SET syncedToSheet = 1 WHERE operationId = :opId")
    suspend fun markWhatsAppSynced(opId: String)

    @Query("SELECT COUNT(*) FROM WhatsAppLogs WHERE sentAt LIKE :datePrefix || '%'")
    suspend fun getTodayWhatsAppCount(datePrefix: String): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueueSync(item: PendingSyncEntity)

    @Query("SELECT * FROM PendingSyncQueue ORDER BY createdAt ASC")
    suspend fun getPendingSyncs(): List<PendingSyncEntity>

    @Query("SELECT COUNT(*) FROM PendingSyncQueue")
    fun observePendingSyncCount(): Flow<Int>

    @Query("DELETE FROM PendingSyncQueue WHERE operationId = :opId")
    suspend fun removePendingSync(opId: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTemplates(templates: List<TemplateEntity>)

    @Query("SELECT * FROM Templates")
    fun observeTemplates(): Flow<List<TemplateEntity>>
}

@Database(
    entities = [LeadEntity::class, CallLogEntity::class, WhatsAppLogEntity::class, PendingSyncEntity::class, TemplateEntity::class],
    version = 1,
    exportSchema = false
)
abstract class CrmDatabase : RoomDatabase() {
    abstract fun crmDao(): CrmDao

    companion object {
        @Volatile private var INSTANCE: CrmDatabase? = null
        fun get(context: Context): CrmDatabase = INSTANCE ?: synchronized(this) {
            INSTANCE ?: Room.databaseBuilder(
                context.applicationContext,
                CrmDatabase::class.java,
                "real_estate_crm.db"
            ).build().also { INSTANCE = it }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/data/remote/AppsScriptSyncProtocol.kt',
    layer: 'Network & Security',
    language: 'kotlin',
    summary: 'Handles HTTP POST and GET requests to Apps Script Web App, follows 302/303 redirects to script.googleusercontent.com, and verifies status=="success" + echoed operationId.',
    code: `package com.realestate.crm.data.remote

import com.realestate.crm.BuildConfig
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

object AppsScriptSyncProtocol {
    data class SyncResult(val accepted: Boolean, val body: String, val message: String)

    fun post(request: JSONObject): SyncResult = execute("POST", request, emptyMap())

    fun get(action: String, params: Map<String, String>): SyncResult {
        val fullParams = params.toMutableMap().apply {
            put("action", action)
            put("apiKey", BuildConfig.APPS_SCRIPT_API_KEY)
        }
        return execute("GET", null, fullParams)
    }

    private fun execute(
        initialMethod: String,
        bodyJson: JSONObject?,
        queryParams: Map<String, String>
    ): SyncResult {
        val baseUrl = BuildConfig.APPS_SCRIPT_URL
        val initialUrlStr = if (initialMethod == "GET" && queryParams.isNotEmpty()) {
            val qs = queryParams.entries.joinToString("&") { (k, v) ->
                "\${URLEncoder.encode(k, "UTF-8")}=\${URLEncoder.encode(v, "UTF-8")}"
            }
            if ("?" in baseUrl) "$baseUrl&$qs" else "$baseUrl?$qs"
        } else baseUrl

        val opExpected = bodyJson?.optString("operationId") ?: queryParams["operationId"].orEmpty()
        bodyJson?.put("apiKey", BuildConfig.APPS_SCRIPT_API_KEY)
        val payload = bodyJson?.toString()?.toByteArray(Charsets.UTF_8)

        var url = URL(initialUrlStr)
        val origin = url
        var method = initialMethod

        repeat(5) {
            var conn: HttpURLConnection? = null
            try {
                conn = (url.openConnection() as HttpURLConnection).apply {
                    instanceFollowRedirects = false
                    connectTimeout = 15_000
                    readTimeout = 15_000
                    requestMethod = method
                    if (method == "POST" && payload != null) {
                        setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                        doOutput = true
                        outputStream.use { it.write(payload) }
                    }
                }

                val code = conn.responseCode
                if (code in 200..299) {
                    val text = conn.inputStream.bufferedReader().use { it.readText() }
                    val json = runCatching { JSONObject(text) }.getOrNull()
                        ?: return SyncResult(false, text, "Invalid JSON")
                    val ok = json.optString("status") == "success"
                    val opAck = json.optString("operationId")
                    val opMatch = opExpected.isBlank() || opExpected == opAck
                    return SyncResult(ok && opMatch, text, json.optString("message", "OK"))
                }

                if (code in listOf(301, 302, 303)) {
                    val loc = conn.getHeaderField("Location")
                        ?: return SyncResult(false, "", "Missing redirect Location")
                    val next = URL(url, loc)
                    val isTrusted = next.host == origin.host ||
                        next.host.endsWith("googleusercontent.com")
                    if (!isTrusted) return SyncResult(false, "", "Untrusted redirect blocked")
                    url = next
                    method = "GET"
                } else {
                    return SyncResult(false, "", "HTTP $code")
                }
            } catch (e: Exception) {
                return SyncResult(false, "", e.message ?: "Network error")
            } finally {
                conn?.disconnect()
            }
        }
        return SyncResult(false, "", "Redirect limit exceeded")
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/worker/PendingSyncWorker.kt',
    layer: 'Workers & Utils',
    language: 'kotlin',
    summary: 'WorkManager worker flushing PendingSyncQueue with operationId ACK verification and pulling GET_SYNC_DATA (role-scoped Leads, ADMIN Daily_Reports, Templates).',
    code: `package com.realestate.crm.worker

import android.content.Context
import androidx.work.*
import com.realestate.crm.data.local.*
import com.realestate.crm.data.remote.AppsScriptSyncProtocol
import com.realestate.crm.util.PhoneNormalizer
import org.json.JSONObject
import java.util.UUID
import java.util.concurrent.TimeUnit

class PendingSyncWorker(
    private val appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val session = SessionManager(appContext).getSession() ?: return Result.success()
        val dao = CrmDatabase.get(appContext).crmDao()

        // 1. Flush PendingSyncQueue FIFO — delete row ONLY on matching operationId ACK
        val pendingItems = dao.getPendingSyncs()
        var hasFailures = false

        for (item in pendingItems) {
            val payload = JSONObject(item.payloadJson).apply {
                put("sessionToken", session.sessionToken)
                put("operationId", item.operationId)
                put("action", item.action)
            }
            val res = AppsScriptSyncProtocol.post(payload)
            if (res.accepted) {
                dao.removePendingSync(item.operationId)
                when (item.action) {
                    "UPSERT_CALL_LOG" -> dao.markCallSynced(item.operationId)
                    "UPSERT_WHATSAPP_LOG" -> dao.markWhatsAppSynced(item.operationId)
                }
            } else {
                hasFailures = true
            }
        }

        // 2. Pull GET_SYNC_DATA (only AssignedTo leads for TELECALLER; all + Daily_Reports for ADMIN; Templates)
        val pullOpId = "OP_PULL_" + UUID.randomUUID().toString().take(8)
        val pullRes = AppsScriptSyncProtocol.get(
            action = "GET_SYNC_DATA",
            params = mapOf(
                "sessionToken" to session.sessionToken,
                "operationId" to pullOpId
            )
        )

        if (pullRes.accepted) {
            val json = JSONObject(pullRes.body)
            val leadsArr = json.optJSONArray("leads")
            if (leadsArr != null) {
                val list = (0 until leadsArr.length()).map { i ->
                    val o = leadsArr.getJSONObject(i)
                    LeadEntity(
                        leadId = o.getString("Lead_ID"),
                        name = o.getString("Name"),
                        phone = PhoneNormalizer.last10Digits(o.getString("Phone")),
                        campaignSource = o.optString("Campaign_Source"),
                        configRequirement = o.optString("Config_Requirement"),
                        preferredLocation = o.optString("Preferred_Location"),
                        budget = o.optString("Budget"),
                        assignedTo = o.optString("Assigned_To"),
                        status = o.optString("Status", "New"),
                        nextFollowUpAt = o.optString("Next_Follow_Up_At"),
                        notes = o.optString("Notes"),
                        createdBy = o.optString("Created_By"),
                        lastCalledAt = o.optString("Last_Called_At"),
                        whatsAppSharedCount = o.optInt("WhatsApp_Shared_Count", 0),
                        updatedAt = o.optString("Updated_At")
                    )
                }
                dao.upsertLeads(list)
            }
            val tplArr = json.optJSONArray("templates")
            if (tplArr != null) {
                val tpls = (0 until tplArr.length()).map { i ->
                    val o = tplArr.getJSONObject(i)
                    TemplateEntity(
                        templateId = o.getString("Template_ID"),
                        projectName = o.getString("Project_Name"),
                        messageBody = o.getString("Message_Body"),
                        brochureUrl = o.optString("Brochure_Url")
                    )
                }
                dao.upsertTemplates(tpls)
            }
        } else {
            hasFailures = true
        }

        return if (hasFailures) Result.retry() else Result.success()
    }

    companion object {
        fun enqueueImmediate(context: Context) {
            val req = OneTimeWorkRequestBuilder<PendingSyncWorker>()
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueueUniqueWork("pending_sync_now", ExistingWorkPolicy.REPLACE, req)
        }

        fun schedulePeriodic(context: Context) {
            val req = PeriodicWorkRequestBuilder<PendingSyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "pending_sync_periodic",
                ExistingPeriodicWorkPolicy.KEEP,
                req
            )
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/data/local/SessionManager.kt',
    layer: 'Network & Security',
    language: 'kotlin',
    summary: 'EncryptedSharedPreferences session store. Holds sessionToken, userId, name, phone, and role — never exposes Google Sheet URLs.',
    code: `package com.realestate.crm.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

data class UserSession(
    val sessionToken: String,
    val userId: String,
    val name: String,
    val phone: String,
    val role: String // "TELECALLER" or "ADMIN"
)

class SessionManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "realestate_crm_session",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveSession(session: UserSession) {
        prefs.edit()
            .putString(KEY_TOKEN, session.sessionToken)
            .putString(KEY_USER_ID, session.userId)
            .putString(KEY_NAME, session.name)
            .putString(KEY_PHONE, session.phone)
            .putString(KEY_ROLE, session.role)
            .apply()
    }

    fun getSession(): UserSession? {
        val token = prefs.getString(KEY_TOKEN, null) ?: return null
        val userId = prefs.getString(KEY_USER_ID, null) ?: return null
        val name = prefs.getString(KEY_NAME, "") ?: ""
        val phone = prefs.getString(KEY_PHONE, "") ?: ""
        val role = prefs.getString(KEY_ROLE, "TELECALLER") ?: "TELECALLER"
        return UserSession(token, userId, name, phone, role)
    }

    fun clear() = prefs.edit().clear().apply()

    companion object {
        private const val KEY_TOKEN = "session_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_NAME = "name"
        private const val KEY_PHONE = "phone"
        private const val KEY_ROLE = "role"
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/util/PhoneNormalizer.kt',
    layer: 'Workers & Utils',
    language: 'kotlin',
    summary: 'Last-10-digit normalizer, HH:MM:SS formatter, 00:00–23:59 day bounds, and [DD/MM hh:mm a - TelecallerName] remark timeline helper.',
    code: `package com.realestate.crm.util

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object PhoneNormalizer {
    private val remarkFormatter = DateTimeFormatter.ofPattern("dd/MM hh:mm a", Locale.ENGLISH)

    fun last10Digits(raw: String?): String {
        if (raw.isNullOrBlank()) return ""
        val digits = raw.filter { it.isDigit() }
        return if (digits.length >= 10) digits.takeLast(10) else digits
    }

    fun formatHms(totalSeconds: Int): String {
        val h = totalSeconds / 3600
        val m = (totalSeconds % 3600) / 60
        val s = totalSeconds % 60
        return "%02d:%02d:%02d".format(h, m, s)
    }

    fun todayYmd(): String = LocalDate.now(ZoneId.systemDefault()).format(DateTimeFormatter.ISO_LOCAL_DATE)

    fun todayEpochBounds(): Pair<Long, Long> {
        val zone = ZoneId.systemDefault()
        val today = LocalDate.now(zone)
        val start = today.atStartOfDay(zone).toInstant().toEpochMilli()
        val end = today.plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli() - 1
        return start to end
    }

    fun appendTimestampedRemark(existingNotes: String, telecallerName: String, newRemark: String): String {
        val trimmed = newRemark.trim()
        if (trimmed.isBlank()) return existingNotes
        val stamp = LocalDateTime.now().format(remarkFormatter).lowercase(Locale.ENGLISH)
        val entry = "[$stamp - $telecallerName]: $trimmed"
        return if (existingNotes.isBlank()) entry else "$entry\\n\${existingNotes.trim()}"
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/util/WhatsAppHelper.kt',
    layer: 'Workers & Utils',
    language: 'kotlin',
    summary: 'Launches https://wa.me/91<10_digit_phone>?text=<encoded_message> for template or custom messages.',
    code: `package com.realestate.crm.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import java.net.URLEncoder

object WhatsAppHelper {
    fun openWhatsApp(context: Context, phone: String, leadName: String, rawMessage: String): Boolean {
        val phone10 = PhoneNormalizer.last10Digits(phone)
        val personalized = rawMessage.replace("{{Name}}", leadName.trim())
        val encoded = URLEncoder.encode(personalized, "UTF-8")
        val uri = Uri.parse("https://wa.me/91$phone10?text=$encoded")
        return runCatching {
            context.startActivity(Intent(Intent.ACTION_VIEW, uri).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) })
            true
        }.getOrDefault(false)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/worker/CallLogSyncWorker.kt',
    layer: 'Workers & Utils',
    language: 'kotlin',
    summary: 'Reads CallLog.Calls (12:00 AM–11:59 PM), matches ONLY assigned CRM 10-digit phones, sets isConnected = (duration >= 15s), deduplicates by (phone, startedAt), and enqueues PendingSyncWorker.',
    code: `package com.realestate.crm.worker

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CallLog
import androidx.core.content.ContextCompat
import androidx.work.*
import com.realestate.crm.data.local.*
import com.realestate.crm.util.PhoneNormalizer
import org.json.JSONObject
import java.util.UUID
import java.util.concurrent.TimeUnit

class CallLogSyncWorker(
    private val appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val session = SessionManager(appContext).getSession() ?: return Result.success()
        if (ContextCompat.checkSelfPermission(appContext, Manifest.permission.READ_CALL_LOG)
            != PackageManager.PERMISSION_GRANTED
        ) return Result.failure()

        val dao = CrmDatabase.get(appContext).crmDao()
        val crmPhones = dao.getAllLeadPhones().toSet()
        if (crmPhones.isEmpty()) return Result.success()

        val (dayStart, dayEnd) = PhoneNormalizer.todayEpochBounds()
        val projection = arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.TYPE, CallLog.Calls.DURATION, CallLog.Calls.DATE)
        var addedAny = false

        appContext.contentResolver.query(
            CallLog.Calls.CONTENT_URI,
            projection,
            "\${CallLog.Calls.DATE} BETWEEN ? AND ?",
            arrayOf(dayStart.toString(), dayEnd.toString()),
            "\${CallLog.Calls.DATE} DESC"
        )?.use { cursor ->
            val numIdx = cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER)
            val typeIdx = cursor.getColumnIndexOrThrow(CallLog.Calls.TYPE)
            val durIdx = cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION)
            val dateIdx = cursor.getColumnIndexOrThrow(CallLog.Calls.DATE)

            while (cursor.moveToNext()) {
                val phone10 = PhoneNormalizer.last10Digits(cursor.getString(numIdx))
                if (phone10 !in crmPhones) continue // Ignore personal/non-CRM calls

                val lead = dao.findLeadByPhone(phone10) ?: continue
                val callType = when (cursor.getInt(typeIdx)) {
                    CallLog.Calls.OUTGOING_TYPE -> "OUTGOING"
                    CallLog.Calls.INCOMING_TYPE -> "INCOMING"
                    CallLog.Calls.MISSED_TYPE -> "MISSED"
                    CallLog.Calls.REJECTED_TYPE -> "REJECTED"
                    else -> "OTHER"
                }

                val durationSec = cursor.getInt(durIdx).coerceAtLeast(0)
                val startedAt = cursor.getLong(dateIdx)
                val isConnected = callType != "MISSED" && callType != "REJECTED" && durationSec >= 15
                val opId = "OP_CL_" + UUID.randomUUID().toString().take(10)
                val callId = "CL_" + UUID.randomUUID().toString().take(8).uppercase()

                // Deduplicates cleanly via Room UNIQUE(phone, startedAt)
                val rowId = dao.insertCallLog(
                    CallLogEntity(
                        operationId = opId,
                        callId = callId,
                        leadId = lead.leadId,
                        telecallerId = session.userId,
                        phone = phone10,
                        callType = callType,
                        startedAt = startedAt,
                        durationSec = durationSec,
                        isConnected = isConnected
                    )
                )

                if (rowId != -1L) {
                    addedAny = true
                    val payload = JSONObject().apply {
                        put("callId", callId)
                        put("leadId", lead.leadId)
                        put("phone", phone10)
                        put("callType", callType)
                        put("startedAt", startedAt)
                        put("durationSec", durationSec)
                        put("isConnected", isConnected)
                    }
                    dao.enqueueSync(PendingSyncEntity(operationId = opId, action = "UPSERT_CALL_LOG", payloadJson = payload.toString()))
                }
            }
        }

        if (addedAny) PendingSyncWorker.enqueueImmediate(appContext)
        return Result.success()
    }

    companion object {
        fun schedulePeriodic(context: Context) {
            val req = PeriodicWorkRequestBuilder<CallLogSyncWorker>(15, TimeUnit.MINUTES).build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "call_log_periodic_sync",
                ExistingPeriodicWorkPolicy.KEEP,
                req
            )
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/worker/CallStateReceiver.kt',
    layer: 'Workers & Utils',
    language: 'kotlin',
    summary: 'Detects call end -> triggers immediate CallLogSyncWorker and launches Post-Call Disposition Bottom Sheet for CRM leads.',
    code: `package com.realestate.crm.worker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import androidx.work.*
import com.realestate.crm.MainActivity
import com.realestate.crm.data.local.CrmDatabase
import com.realestate.crm.data.local.SessionManager
import com.realestate.crm.util.PhoneNormalizer
import kotlinx.coroutines.*

class CallStateReceiver : BroadcastReceiver() {
    companion object {
        private var lastState = TelephonyManager.CALL_STATE_IDLE
        private var lastNumber: String? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return
        if (SessionManager(context).getSession() == null) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        val num = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
        if (!num.isNullOrBlank()) lastNumber = num

        val state = when (stateStr) {
            TelephonyManager.EXTRA_STATE_OFFHOOK -> TelephonyManager.CALL_STATE_OFFHOOK
            TelephonyManager.EXTRA_STATE_RINGING -> TelephonyManager.CALL_STATE_RINGING
            else -> TelephonyManager.CALL_STATE_IDLE
        }

        if (lastState != TelephonyManager.CALL_STATE_IDLE && state == TelephonyManager.CALL_STATE_IDLE) {
            val pending = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    delay(1500)
                    WorkManager.getInstance(context).enqueueUniqueWork(
                        "call_sync_now",
                        ExistingWorkPolicy.REPLACE,
                        OneTimeWorkRequestBuilder<CallLogSyncWorker>().build()
                    )

                    val phone10 = PhoneNormalizer.last10Digits(lastNumber)
                    if (phone10.length == 10) {
                        val lead = CrmDatabase.get(context).crmDao().findLeadByPhone(phone10)
                        if (lead != null) {
                            context.startActivity(Intent(context, MainActivity::class.java).apply {
                                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
                                putExtra("EXTRA_POST_CALL_LEAD_ID", lead.leadId)
                            })
                        }
                    }
                } finally {
                    lastNumber = null
                    pending.finish()
                }
            }
        }
        lastState = state
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/worker/FollowUpReminderScheduler.kt',
    layer: 'Workers & Utils',
    language: 'kotlin',
    summary: 'Schedules local Android notifications 15 minutes before Next_Follow_Up_At (yyyy-MM-dd HH:mm).',
    code: `package com.realestate.crm.worker

import android.app.*
import android.content.*
import android.os.Build
import androidx.core.app.NotificationCompat
import com.realestate.crm.MainActivity
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class FollowUpReminderScheduler(private val context: Context) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    fun schedule15MinBefore(leadId: String, leadName: String, config: String, followUpStr: String) {
        val triggerMs = runCatching {
            val ldt = LocalDateTime.parse(followUpStr, formatter)
            ldt.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() - (15 * 60 * 1000L)
        }.getOrNull() ?: return
        if (triggerMs <= System.currentTimeMillis()) return

        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, FollowUpAlarmReceiver::class.java).apply {
            putExtra("LEAD_ID", leadId)
            putExtra("LEAD_NAME", leadName)
            putExtra("CONFIG", config)
        }
        val pi = PendingIntent.getBroadcast(
            context, leadId.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarm.canScheduleExactAlarms()) {
            alarm.set(AlarmManager.RTC_WAKEUP, triggerMs, pi)
        } else {
            alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerMs, pi)
        }
    }
}

class FollowUpAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val leadId = intent.getStringExtra("LEAD_ID") ?: return
        val leadName = intent.getStringExtra("LEAD_NAME") ?: "CRM Lead"
        val config = intent.getStringExtra("CONFIG") ?: "Follow-Up"
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "crm_followup_reminders"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(channelId, "Follow-Up Reminders", NotificationManager.IMPORTANCE_HIGH)
            )
        }
        val tapPi = PendingIntent.getActivity(
            context, leadId.hashCode(),
            Intent(context, MainActivity::class.java).apply { putExtra("EXTRA_OPEN_LEAD_ID", leadId) },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notif = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_menu_call)
            .setContentTitle("Follow-Up in 15 mins: $leadName")
            .setContentText("Requirement: $config — Tap to call")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(tapPi)
            .build()
        manager.notify(leadId.hashCode(), notif)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/components/PermissionGate.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Cleanly requests READ_CALL_LOG, READ_PHONE_STATE, and POST_NOTIFICATIONS on first launch.',
    code: `package com.realestate.crm.ui.components

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*

@Composable
fun RequestCrmPermissionsOnLaunch(onResult: (granted: Boolean) -> Unit = {}) {
    val permissions = remember {
        buildList {
            add(Manifest.permission.READ_CALL_LOG)
            add(Manifest.permission.READ_PHONE_STATE)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }.toTypedArray()
    }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { resultMap ->
        onResult(resultMap.values.all { it })
    }

    LaunchedEffect(Unit) {
        launcher.launch(permissions)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/LoginScreen.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Phone Number + 4-digit PIN Login screen validating against Users tab via Apps Script Web App.',
    code: `package com.realestate.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp

@Composable
fun LoginScreen(
    isLoading: Boolean,
    errorMessage: String?,
    onLogin: (phone: String, pin: String) -> Unit
) {
    var phone by remember { mutableStateOf("") }
    var pin by remember { mutableStateOf("") }

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(modifier = Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
            Text("RealEstate CRM", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text("Sign in with your 10-digit Phone Number and 4-digit PIN.", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(24.dp))

            OutlinedTextField(
                value = phone,
                onValueChange = { if (it.length <= 10 && it.all(Char::isDigit)) phone = it },
                label = { Text("Phone Number") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = pin,
                onValueChange = { if (it.length <= 4 && it.all(Char::isDigit)) pin = it },
                label = { Text("4-Digit PIN") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            if (!errorMessage.isNullOrBlank()) {
                Spacer(Modifier.height(10.dp))
                Text(errorMessage, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
            Spacer(Modifier.height(20.dp))
            Button(
                onClick = { onLogin(phone, pin) },
                enabled = !isLoading && phone.length == 10 && pin.length == 4,
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                if (isLoading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                else Text("Sign In")
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/TelecallerHomeScreen.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Top bar with Sync Now (pending count), Search bar, Campaign filter chips (All, Magarpatta Residents, Burgundy, Godrej, Kharadi Kohinoor, Prospects), 4 Queue Tabs, and CrmLeadCard.',
    code: `package com.realestate.crm.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.realestate.crm.data.local.LeadEntity
import com.realestate.crm.ui.theme.BorderGrey
import com.realestate.crm.util.PhoneNormalizer

enum class QueueTab(val label: String) {
    TODAY("Today's Follow-Ups"),
    OVERDUE("Overdue"),
    SITE_VISITS("Site Visits"),
    ALL("All Leads")
}

val CAMPAIGN_CHIPS = listOf(
    "All", "Magarpatta Residents", "Burgundy", "Godrej", "Kharadi Kohinoor", "Prospects"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TelecallerHomeScreen(
    telecallerName: String,
    isAdmin: Boolean,
    leads: List<LeadEntity>,
    pendingSyncCount: Int,
    onSyncNow: () -> Unit,
    onCallLead: (LeadEntity) -> Unit,
    onWhatsAppLead: (LeadEntity) -> Unit,
    onOpenLeadDetail: (LeadEntity) -> Unit,
    onOpenAddLead: () -> Unit,
    onOpenDailyReport: () -> Unit,
    onOpenManagerDashboard: () -> Unit,
    onLogout: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(QueueTab.TODAY) }
    var selectedCampaign by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    val todayYmd = remember { PhoneNormalizer.todayYmd() }

    val filtered = remember(leads, selectedTab, selectedCampaign, searchQuery) {
        val q = searchQuery.trim().lowercase()
        leads.filter { lead ->
            val matchCampaign = selectedCampaign == "All" || lead.campaignSource.equals(selectedCampaign, ignoreCase = true)
            val matchSearch = q.isBlank() ||
                lead.name.lowercase().contains(q) ||
                lead.phone.contains(q) ||
                lead.preferredLocation.lowercase().contains(q) ||
                lead.campaignSource.lowercase().contains(q)
            val fuDate = lead.nextFollowUpAt.take(10)
            val matchTab = when (selectedTab) {
                QueueTab.TODAY -> fuDate == todayYmd
                QueueTab.OVERDUE -> fuDate.isNotBlank() && fuDate < todayYmd && lead.status !in listOf("Booked", "Lost / Invalid")
                QueueTab.SITE_VISITS -> lead.status == "Site Visit Scheduled" || lead.status == "Site Visit Done"
                QueueTab.ALL -> true
            }
            matchCampaign && matchSearch && matchTab
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(telecallerName, fontWeight = FontWeight.Bold) },
                actions = {
                    TextButton(onClick = onSyncNow) {
                        Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Sync ($pendingSyncCount)")
                    }
                    if (isAdmin) {
                        TextButton(onClick = onOpenManagerDashboard) { Text("Dashboard") }
                    } else {
                        TextButton(onClick = onOpenDailyReport) { Text("Report") }
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Sign Out")
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onOpenAddLead,
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("Add Lead") }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search name, phone, location, campaign...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)
            )

            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CAMPAIGN_CHIPS.forEach { campaign ->
                    FilterChip(
                        selected = selectedCampaign == campaign,
                        onClick = { selectedCampaign = campaign },
                        label = { Text(campaign) }
                    )
                }
            }

            ScrollableTabRow(selectedTabIndex = selectedTab.ordinal, edgePadding = 16.dp) {
                QueueTab.entries.forEach { tab ->
                    Tab(selected = selectedTab == tab, onClick = { selectedTab = tab }, text = { Text(tab.label) })
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filtered, key = { it.leadId }) { lead ->
                    CrmLeadCard(
                        lead = lead,
                        onClick = { onOpenLeadDetail(lead) },
                        onCall = { onCallLead(lead) },
                        onWhatsApp = { onWhatsAppLead(lead) }
                    )
                }
            }
        }
    }
}

@Composable
fun CrmLeadCard(
    lead: LeadEntity,
    onClick: () -> Unit,
    onCall: () -> Unit,
    onWhatsApp: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = MaterialTheme.shapes.medium,
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, BorderGrey),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(lead.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                AssistChip(onClick = onClick, label = { Text(lead.campaignSource.ifBlank { "Prospects" }) })
            }
            Text(
                "\${lead.configRequirement} · \${lead.preferredLocation} · \${lead.budget}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(6.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Status: \${lead.status}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                Text("Last Called: \${lead.lastCalledAt.ifBlank { "Never" }}", style = MaterialTheme.typography.labelSmall)
            }
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onCall, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Call")
                }
                OutlinedButton(onClick = onWhatsApp, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("WhatsApp (\${lead.whatsAppSharedCount})")
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/LeadDetailScreen.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Displays full remark timeline and appends [DD/MM hh:mm a - TelecallerName]: note without erasing prior remarks.',
    code: `package com.realestate.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.realestate.crm.data.local.LeadEntity
import com.realestate.crm.util.PhoneNormalizer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeadDetailScreen(
    lead: LeadEntity,
    telecallerName: String,
    onCallLead: () -> Unit,
    onWhatsAppLead: () -> Unit,
    onOpenDisposition: () -> Unit,
    onAppendRemark: (updatedNotes: String) -> Unit,
    onBack: () -> Unit
) {
    var newNote by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(lead.name, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(onClick = onOpenDisposition) { Text("Update Stage") }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("\${lead.configRequirement} · \${lead.preferredLocation} · \${lead.budget}", style = MaterialTheme.typography.titleSmall)
            Text("Status: \${lead.status} · Campaign: \${lead.campaignSource} · Created By: \${lead.createdBy}", style = MaterialTheme.typography.bodySmall)

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                Button(onClick = onCallLead, modifier = Modifier.weight(1f)) { Text("Call") }
                OutlinedButton(onClick = onWhatsAppLead, modifier = Modifier.weight(1f)) {
                    Text("WhatsApp (\${lead.whatsAppSharedCount})")
                }
            }

            OutlinedTextField(
                value = newNote,
                onValueChange = { newNote = it },
                label = { Text("Add Timestamped Remark") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth()
            )
            Button(
                onClick = {
                    val updated = PhoneNormalizer.appendTimestampedRemark(lead.notes, telecallerName, newNote)
                    onAppendRemark(updated)
                    newNote = ""
                },
                enabled = newNote.isNotBlank(),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Append Remark")
            }

            HorizontalDivider()
            Text("Remark History Timeline", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text(
                text = lead.notes.ifBlank { "No remarks logged yet." },
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/AddLeadScreen.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Manual walk-in/referral lead form setting CreatedBy = TelecallerName, enforcing mandatory NextFollowUpAt for active stages, and queuing PendingSyncWorker.',
    code: `package com.realestate.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.realestate.crm.data.local.LeadEntity
import com.realestate.crm.util.PhoneNormalizer
import java.time.Instant
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddLeadScreen(
    telecallerId: String,
    telecallerName: String,
    onSaveLead: (LeadEntity) -> Unit,
    onCancel: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var config by remember { mutableStateOf("3 BHK") }
    var location by remember { mutableStateOf("") }
    var budget by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("New") }
    var nextFollowUp by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    val needsFollowUp = status in setOf("Follow-Up", "Ringing / Callback", "Hot / Interested", "Site Visit Scheduled")
    val isValid = name.isNotBlank() && PhoneNormalizer.last10Digits(phone).length == 10 && (!needsFollowUp || nextFollowUp.isNotBlank())

    Scaffold(
        topBar = { TopAppBar(title = { Text("Add Walk-In / Referral Lead", fontWeight = FontWeight.Bold) }) }
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name *") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("10-Digit Phone *") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = config, onValueChange = { config = it }, label = { Text("Config (e.g. 3 BHK)") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = location, onValueChange = { location = it }, label = { Text("Preferred Location") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = budget, onValueChange = { budget = it }, label = { Text("Budget") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = status, onValueChange = { status = it }, label = { Text("Initial Status") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(
                value = nextFollowUp,
                onValueChange = { nextFollowUp = it },
                label = { Text(if (needsFollowUp) "NextFollowUpAt (yyyy-MM-dd HH:mm) *" else "NextFollowUpAt (Optional)") },
                isError = needsFollowUp && nextFollowUp.isBlank(),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text("Initial Remark") }, minLines = 2, modifier = Modifier.fillMaxWidth())

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedButton(onClick = onCancel, modifier = Modifier.weight(1f)) { Text("Cancel") }
                Button(
                    onClick = {
                        val timeline = PhoneNormalizer.appendTimestampedRemark("", telecallerName, notes)
                        onSaveLead(
                            LeadEntity(
                                leadId = "LD_" + UUID.randomUUID().toString().take(6).uppercase(),
                                name = name.trim(),
                                phone = PhoneNormalizer.last10Digits(phone),
                                campaignSource = "Prospects",
                                configRequirement = config.trim(),
                                preferredLocation = location.trim(),
                                budget = budget.trim(),
                                assignedTo = telecallerId,
                                status = status,
                                nextFollowUpAt = nextFollowUp.trim(),
                                notes = timeline,
                                createdBy = telecallerName,
                                updatedAt = Instant.now().toString()
                            )
                        )
                    },
                    enabled = isValid,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Save & Queue Sync")
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/WhatsAppShareSheet.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Template picker populated from Templates table PLUS a Custom Message option; opens wa.me/91<phone>?text=... and logs WhatsAppLog.',
    code: `package com.realestate.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.realestate.crm.data.local.LeadEntity
import com.realestate.crm.data.local.TemplateEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppShareSheet(
    lead: LeadEntity,
    templates: List<TemplateEntity>,
    onSendAndLog: (templateName: String, messageBody: String) -> Unit,
    onDismiss: () -> Unit
) {
    var useCustom by remember { mutableStateOf(templates.isEmpty()) }
    var selectedTemplate by remember { mutableStateOf(templates.firstOrNull()) }
    var customMessage by remember { mutableStateOf("Hello \${lead.name}, sharing project details for your \${lead.configRequirement} inquiry:") }

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Send on WhatsApp — \${lead.name}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = !useCustom, onClick = { useCustom = false }, label = { Text("Project Templates") })
                FilterChip(selected = useCustom, onClick = { useCustom = true }, label = { Text("Custom Message") })
            }

            if (!useCustom && templates.isNotEmpty()) {
                templates.forEach { tpl ->
                    Row(modifier = Modifier.fillMaxWidth()) {
                        RadioButton(selected = selectedTemplate?.templateId == tpl.templateId, onClick = { selectedTemplate = tpl })
                        Column(Modifier.padding(start = 6.dp)) {
                            Text(tpl.projectName, fontWeight = FontWeight.SemiBold)
                            Text(tpl.messageBody.take(90) + "...", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            } else {
                OutlinedTextField(
                    value = customMessage,
                    onValueChange = { customMessage = it },
                    label = { Text("Custom WhatsApp Message") },
                    minLines = 4,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Button(
                onClick = {
                    val tplName = if (useCustom) "Custom Message" else (selectedTemplate?.projectName ?: "Custom")
                    val body = if (useCustom) customMessage else (selectedTemplate?.messageBody ?: customMessage)
                    onSendAndLog(tplName, body)
                },
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Text("Open WhatsApp & Log Share")
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/worker/DailyReportAggregator.kt',
    layer: 'Workers & Utils',
    language: 'kotlin',
    summary: 'Computes live & end-of-day (12:00 AM–11:59 PM) Daily Calling Records per telecaller and enqueues UPSERT_DAILY_REPORT.',
    code: `package com.realestate.crm.worker

import android.content.Context
import com.realestate.crm.data.local.*
import com.realestate.crm.util.PhoneNormalizer
import org.json.JSONObject
import java.util.UUID

data class DailyCallingSummary(
    val dateYmd: String,
    val telecallerId: String,
    val telecallerName: String,
    val totalCalls: Int,
    val connectedCalls: Int,
    val notConnectedCalls: Int,
    val whatsAppSharedCount: Int,
    val totalCallingSeconds: Int,
    val totalCallingHoursHHMMSS: String,
    val followUpsCompleted: Int,
    val followUpsPending: Int
)

object DailyReportAggregator {
    suspend fun computeTodayAndEnqueueSync(
        context: Context,
        session: UserSession,
        leads: List<LeadEntity>
    ): DailyCallingSummary {
        val dao = CrmDatabase.get(context).crmDao()
        val todayYmd = PhoneNormalizer.todayYmd()
        val (dayStart, dayEnd) = PhoneNormalizer.todayEpochBounds()

        val callsToday = dao.getCallsBetween(dayStart, dayEnd).filter { it.telecallerId == session.userId }
        val totalCalls = callsToday.size
        val connectedCalls = callsToday.count { it.isConnected }
        val notConnectedCalls = totalCalls - connectedCalls
        val totalCallingSeconds = callsToday.sumOf { it.durationSec }
        val totalHoursHms = PhoneNormalizer.formatHms(totalCallingSeconds)
        val waSharedCount = dao.getTodayWhatsAppCount(todayYmd)

        val myLeads = leads.filter { it.assignedTo == session.userId }
        val followUpsCompleted = myLeads.count { it.lastCalledAt.startsWith(todayYmd) }
        val followUpsPending = myLeads.count {
            it.nextFollowUpAt.isNotBlank() &&
                it.nextFollowUpAt.take(10) <= todayYmd &&
                it.status !in listOf("Booked", "Lost / Invalid")
        }

        val summary = DailyCallingSummary(
            dateYmd = todayYmd,
            telecallerId = session.userId,
            telecallerName = session.name,
            totalCalls = totalCalls,
            connectedCalls = connectedCalls,
            notConnectedCalls = notConnectedCalls,
            whatsAppSharedCount = waSharedCount,
            totalCallingSeconds = totalCallingSeconds,
            totalCallingHoursHHMMSS = totalHoursHms,
            followUpsCompleted = followUpsCompleted,
            followUpsPending = followUpsPending
        )

        val opId = "OP_DR_" + UUID.randomUUID().toString().take(8)
        val payload = JSONObject().apply {
            put("date", todayYmd)
            put("telecallerId", session.userId)
            put("telecallerName", session.name)
            put("totalCalls", totalCalls)
            put("connectedCalls", connectedCalls)
            put("notConnectedCalls", notConnectedCalls)
            put("whatsAppSharedCount", waSharedCount)
            put("totalCallingSeconds", totalCallingSeconds)
            put("totalCallingHoursHHMMSS", totalHoursHms)
            put("followUpsCompleted", followUpsCompleted)
            put("followUpsPending", followUpsPending)
        }
        dao.enqueueSync(PendingSyncEntity(operationId = opId, action = "UPSERT_DAILY_REPORT", payloadJson = payload.toString()))
        return summary
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/DailyReportScreen.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Telecaller My Daily Report screen with live KPI cards and scrollable today\'s synced CRM calls showing mm:ss duration.',
    code: `package com.realestate.crm.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.realestate.crm.data.local.CallLogEntity
import com.realestate.crm.data.local.LeadEntity
import com.realestate.crm.ui.theme.*
import com.realestate.crm.worker.DailyCallingSummary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyReportScreen(
    summary: DailyCallingSummary,
    callsToday: List<CallLogEntity>,
    leadsMap: Map<String, LeadEntity>,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Daily Report (\${summary.dateYmd})", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    KpiBox("Total Calls", "\${summary.totalCalls}", Modifier.weight(1f))
                    KpiBox("Connected (>=15s)", "\${summary.connectedCalls}", Modifier.weight(1f))
                    KpiBox("Not Connected", "\${summary.notConnectedCalls}", Modifier.weight(1f))
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    KpiBox("Calling Hours", summary.totalCallingHoursHHMMSS, Modifier.weight(1f))
                    KpiBox("WhatsApp Sent", "\${summary.whatsAppSharedCount}", Modifier.weight(1f))
                    KpiBox("FU Done / Pend", "\${summary.followUpsCompleted} / \${summary.followUpsPending}", Modifier.weight(1f))
                }
            }
            item {
                Text("Today's Synced CRM Calls (12:00 AM – 11:59 PM)", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            }
            items(callsToday, key = { it.operationId }) { call ->
                val leadName = leadsMap[call.leadId]?.name ?: call.phone
                val mmSs = "%02d:%02d".format(call.durationSec / 60, call.durationSec % 60)
                Surface(
                    shape = MaterialTheme.shapes.medium,
                    color = SurfaceWhite,
                    border = BorderStroke(1.dp, BorderGrey),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    ListItem(
                        headlineContent = { Text(leadName, fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("\${call.callType} · \${if (call.isConnected) "Connected" else "Not Connected"}") },
                        trailingContent = {
                            Text(
                                text = mmSs,
                                fontWeight = FontWeight.Bold,
                                color = if (call.isConnected) SuccessGreen else WarningAmber
                            )
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun KpiBox(label: String, value: String, modifier: Modifier = Modifier) {
    Surface(
        shape = MaterialTheme.shapes.medium,
        color = SurfaceWhite,
        border = BorderStroke(1.dp, BorderGrey),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = SecondaryText)
            Spacer(Modifier.height(4.dp))
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = PrimaryNavy)
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/ManagerDashboardScreen.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Visible ONLY when Role == ADMIN. Team-wide daily summary table, tap telecaller drill-down into daily calls & overdue follow-ups, plus Export CSV.',
    code: `package com.realestate.crm.ui.screens

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import com.realestate.crm.data.local.CallLogEntity
import com.realestate.crm.data.local.LeadEntity
import com.realestate.crm.ui.theme.*
import com.realestate.crm.worker.DailyCallingSummary
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ManagerDashboardScreen(
    userRole: String,
    reports: List<DailyCallingSummary>,
    callsByTelecaller: Map<String, List<CallLogEntity>>,
    overdueByTelecaller: Map<String, List<LeadEntity>>,
    onOpenAllLeads: () -> Unit,
    onLogout: () -> Unit
) {
    if (userRole != "ADMIN") return
    val context = LocalContext.current
    var selectedTelecaller by remember { mutableStateOf<DailyCallingSummary?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Manager Dashboard", fontWeight = FontWeight.Bold) },
                actions = {
                    TextButton(onClick = { exportDailyReportCsv(context, reports) }) {
                        Text("Export CSV")
                    }
                    TextButton(onClick = onOpenAllLeads) { Text("Leads") }
                    TextButton(onClick = onLogout) { Text("Sign Out") }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(reports, key = { it.telecallerId }) { rep ->
                Surface(
                    onClick = { selectedTelecaller = rep },
                    shape = MaterialTheme.shapes.medium,
                    color = SurfaceWhite,
                    border = BorderStroke(1.dp, BorderGrey),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(rep.telecallerName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(rep.totalCallingHoursHHMMSS, fontWeight = FontWeight.Bold, color = PrimaryTeal)
                        }
                        Text("Calls: \${rep.totalCalls} (Conn: \${rep.connectedCalls} / Not Conn: \${rep.notConnectedCalls})", style = MaterialTheme.typography.bodySmall)
                        Text("WhatsApp: \${rep.whatsAppSharedCount} · FU Done: \${rep.followUpsCompleted} · Pending: \${rep.followUpsPending}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }

    selectedTelecaller?.let { tc ->
        val calls = callsByTelecaller[tc.telecallerId].orEmpty()
        val overdue = overdueByTelecaller[tc.telecallerId].orEmpty()
        ModalBottomSheet(onDismissRequest = { selectedTelecaller = null }) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("\${tc.telecallerName} — Daily Calls (\${calls.size}) & Overdue (\${overdue.size})", fontWeight = FontWeight.Bold)
                overdue.forEach { l ->
                    Text("Overdue: \${l.name} (\${l.nextFollowUpAt})", color = ErrorRed, style = MaterialTheme.typography.bodySmall)
                }
                calls.forEach { c ->
                    val mmSs = "%02d:%02d".format(c.durationSec / 60, c.durationSec % 60)
                    Text("\${c.phone} · \${c.callType} · $mmSs (\${if (c.isConnected) "Connected" else "Not Connected"})", style = MaterialTheme.typography.bodySmall)
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

private fun exportDailyReportCsv(context: Context, reports: List<DailyCallingSummary>) {
    val header = "Date,Telecaller,TotalCalls,ConnectedCalls,NotConnectedCalls,WhatsAppSharedCount,TotalCallingSeconds,TotalCallingHoursHHMMSS,FollowUpsCompleted,FollowUpsPending\n"
    val rows = reports.joinToString("\n") {
        "\${it.dateYmd},\${it.telecallerName},\${it.totalCalls},\${it.connectedCalls},\${it.notConnectedCalls},\${it.whatsAppSharedCount},\${it.totalCallingSeconds},\${it.totalCallingHoursHHMMSS},\${it.followUpsCompleted},\${it.followUpsPending}"
    }
    val file = File(context.cacheDir, "daily_calling_report.csv").apply { writeText(header + rows) }
    val uri = FileProvider.getUriForFile(context, "\${context.packageName}.fileprovider", file)
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/csv"
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(shareIntent, "Export Daily Calling Report CSV"))
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/screens/PostCallDispositionSheet.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Post-Call Disposition Bottom Sheet opened after a CRM call ends or from Lead Detail; enforces NextFollowUpAt for active stages and appends timestamped remarks.',
    code: `package com.realestate.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.realestate.crm.data.local.LeadEntity

val PIPELINE_STAGES = listOf(
    "New", "Ringing / Callback", "Follow-Up", "Hot / Interested",
    "Site Visit Scheduled", "Site Visit Done", "Negotiation", "Booked", "Lost / Invalid"
)

val MANDATORY_FOLLOWUP_STAGES = setOf(
    "Follow-Up", "Ringing / Callback", "Hot / Interested", "Site Visit Scheduled"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PostCallDispositionSheet(
    lead: LeadEntity,
    onSaveDisposition: (newStatus: String, nextFollowUpAt: String, newRemark: String) -> Unit,
    onOpenWhatsApp: () -> Unit,
    onDismiss: () -> Unit
) {
    var selectedStage by remember { mutableStateOf(lead.status.ifBlank { "Follow-Up" }) }
    var stageMenuExpanded by remember { mutableStateOf(false) }
    var nextFollowUpAt by remember { mutableStateOf(lead.nextFollowUpAt) }
    var newRemark by remember { mutableStateOf("") }

    val requiresFollowUp = selectedStage in MANDATORY_FOLLOWUP_STAGES
    val isValid = !requiresFollowUp || nextFollowUpAt.isNotBlank()

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Post-Call Disposition", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("\${lead.name} · \${lead.configRequirement} · \${lead.preferredLocation}", style = MaterialTheme.typography.bodySmall)

            ExposedDropdownMenuBox(
                expanded = stageMenuExpanded,
                onExpandedChange = { stageMenuExpanded = !stageMenuExpanded }
            ) {
                OutlinedTextField(
                    value = selectedStage,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Pipeline Stage") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = stageMenuExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = stageMenuExpanded,
                    onDismissRequest = { stageMenuExpanded = false }
                ) {
                    PIPELINE_STAGES.forEach { stage ->
                        DropdownMenuItem(
                            text = { Text(stage) },
                            onClick = {
                                selectedStage = stage
                                stageMenuExpanded = false
                            }
                        )
                    }
                }
            }

            OutlinedTextField(
                value = nextFollowUpAt,
                onValueChange = { nextFollowUpAt = it },
                label = {
                    Text(if (requiresFollowUp) "Next Follow-Up (yyyy-MM-dd HH:mm) *" else "Next Follow-Up (Optional)")
                },
                isError = requiresFollowUp && nextFollowUpAt.isBlank(),
                supportingText = if (requiresFollowUp) {
                    { Text("Schedules local reminder 15 minutes before due time.") }
                } else null,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = newRemark,
                onValueChange = { newRemark = it },
                label = { Text("Add Remark (Appended with Timestamp)") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth()
            )

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedButton(onClick = onOpenWhatsApp, modifier = Modifier.weight(1f)) {
                    Text("Send WhatsApp")
                }
                Button(
                    onClick = { onSaveDisposition(selectedStage, nextFollowUpAt.trim(), newRemark.trim()) },
                    enabled = isValid,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Save & Schedule")
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/CrmViewModel.kt',
    layer: 'Data & Room',
    language: 'kotlin',
    summary: 'Central MVVM ViewModel wiring Room DAO, EncryptedSharedPreferences session, AppsScriptSyncProtocol, PendingSyncWorker, WhatsAppHelper, and 15-min FollowUpReminderScheduler.',
    code: `package com.realestate.crm.ui

import android.app.Application
import android.content.Intent
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.realestate.crm.data.local.*
import com.realestate.crm.data.remote.AppsScriptSyncProtocol
import com.realestate.crm.util.PhoneNormalizer
import com.realestate.crm.util.WhatsAppHelper
import com.realestate.crm.worker.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.time.Instant
import java.util.UUID

class CrmViewModel(application: Application) : AndroidViewModel(application) {
    private val context = application.applicationContext
    private val dao = CrmDatabase.get(context).crmDao()
    private val sessionManager = SessionManager(context)
    private val reminderScheduler = FollowUpReminderScheduler(context)

    private val _session = MutableStateFlow(sessionManager.getSession())
    val session: StateFlow<UserSession?> = _session.asStateFlow()

    private val _loginLoading = MutableStateFlow(false)
    val loginLoading: StateFlow<Boolean> = _loginLoading.asStateFlow()

    private val _loginError = MutableStateFlow<String?>(null)
    val loginError: StateFlow<String?> = _loginError.asStateFlow()

    private val _managerReports = MutableStateFlow<List<DailyCallingSummary>>(emptyList())
    val managerReports: StateFlow<List<DailyCallingSummary>> = _managerReports.asStateFlow()

    val leads: StateFlow<List<LeadEntity>> = dao.observeLeads()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val templates: StateFlow<List<TemplateEntity>> = dao.observeTemplates()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val pendingSyncCount: StateFlow<Int> = dao.observePendingSyncCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val todayCalls: StateFlow<List<CallLogEntity>> = run {
        val (dayStart, dayEnd) = PhoneNormalizer.todayEpochBounds()
        dao.observeTodayCalls(dayStart, dayEnd)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    }

    private val _dailySummary = MutableStateFlow<DailyCallingSummary?>(null)
    val dailySummary: StateFlow<DailyCallingSummary?> = _dailySummary.asStateFlow()

    init {
        if (_session.value != null) {
            PendingSyncWorker.schedulePeriodic(context)
            CallLogSyncWorker.schedulePeriodic(context)
            PendingSyncWorker.enqueueImmediate(context)
        }
    }

    fun login(phone: String, pin: String) {
        viewModelScope.launch(Dispatchers.IO) {
            _loginLoading.value = true
            _loginError.value = null
            val opId = "OP_LOGIN_" + UUID.randomUUID().toString().take(8)
            val req = JSONObject().apply {
                put("action", "LOGIN")
                put("operationId", opId)
                put("phone", PhoneNormalizer.last10Digits(phone))
                put("pin", pin)
            }
            val res = AppsScriptSyncProtocol.post(req)
            if (res.accepted) {
                val json = JSONObject(res.body)
                val u = json.getJSONObject("user")
                val userSession = UserSession(
                    sessionToken = json.getString("sessionToken"),
                    userId = u.getString("userId"),
                    name = u.getString("name"),
                    phone = u.getString("phone"),
                    role = u.getString("role")
                )
                sessionManager.saveSession(userSession)
                _session.value = userSession
                PendingSyncWorker.schedulePeriodic(context)
                CallLogSyncWorker.schedulePeriodic(context)
                PendingSyncWorker.enqueueImmediate(context)
                if (userSession.role == "ADMIN") refreshManagerDashboard()
            } else {
                _loginError.value = res.message.ifBlank { "Invalid Phone Number or PIN" }
            }
            _loginLoading.value = false
        }
    }

    fun logout() {
        sessionManager.clear()
        _session.value = null
    }

    fun syncNow() {
        PendingSyncWorker.enqueueImmediate(context)
    }

    fun dialLead(lead: LeadEntity) {
        val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:\${lead.phone}")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(dialIntent)
    }

    fun addLead(lead: LeadEntity) {
        viewModelScope.launch(Dispatchers.IO) {
            dao.upsertLead(lead)
            if (lead.nextFollowUpAt.isNotBlank()) {
                reminderScheduler.schedule15MinBefore(lead.leadId, lead.name, lead.configRequirement, lead.nextFollowUpAt)
            }
            enqueueLeadUpsert(lead)
            PendingSyncWorker.enqueueImmediate(context)
        }
    }

    fun saveDisposition(lead: LeadEntity, newStatus: String, nextFollowUpAt: String, newRemark: String) {
        val actor = _session.value?.name ?: "Telecaller"
        val updatedNotes = PhoneNormalizer.appendTimestampedRemark(lead.notes, actor, newRemark)
        val updated = lead.copy(
            status = newStatus,
            nextFollowUpAt = nextFollowUpAt,
            notes = updatedNotes,
            updatedAt = Instant.now().toString()
        )
        viewModelScope.launch(Dispatchers.IO) {
            dao.upsertLead(updated)
            if (nextFollowUpAt.isNotBlank()) {
                reminderScheduler.schedule15MinBefore(updated.leadId, updated.name, updated.configRequirement, nextFollowUpAt)
            }
            enqueueLeadUpsert(updated)
            PendingSyncWorker.enqueueImmediate(context)
        }
    }

    fun appendRemark(lead: LeadEntity, updatedNotes: String) {
        val updated = lead.copy(notes = updatedNotes, updatedAt = Instant.now().toString())
        viewModelScope.launch(Dispatchers.IO) {
            dao.upsertLead(updated)
            enqueueLeadUpsert(updated)
            PendingSyncWorker.enqueueImmediate(context)
        }
    }

    fun shareOnWhatsApp(lead: LeadEntity, templateName: String, messageBody: String) {
        WhatsAppHelper.openWhatsApp(context, lead.phone, lead.name, messageBody)
        val user = _session.value ?: return
        val opId = "OP_WA_" + UUID.randomUUID().toString().take(8)
        val nowIso = Instant.now().toString()
        viewModelScope.launch(Dispatchers.IO) {
            dao.insertWhatsAppLog(
                WhatsAppLogEntity(
                    operationId = opId,
                    leadId = lead.leadId,
                    telecallerId = user.userId,
                    templateName = templateName,
                    sentAt = nowIso
                )
            )
            dao.upsertLead(lead.copy(whatsAppSharedCount = lead.whatsAppSharedCount + 1, updatedAt = nowIso))
            val payload = JSONObject().apply {
                put("leadId", lead.leadId)
                put("templateName", templateName)
                put("sentAt", nowIso)
            }
            dao.enqueueSync(PendingSyncEntity(operationId = opId, action = "UPSERT_WHATSAPP_LOG", payloadJson = payload.toString()))
            PendingSyncWorker.enqueueImmediate(context)
        }
    }

    fun refreshDailyReport() {
        val user = _session.value ?: return
        viewModelScope.launch(Dispatchers.IO) {
            _dailySummary.value = DailyReportAggregator.computeTodayAndEnqueueSync(context, user, leads.value)
            PendingSyncWorker.enqueueImmediate(context)
        }
    }

    fun refreshManagerDashboard() {
        val user = _session.value ?: return
        if (user.role != "ADMIN") return
        viewModelScope.launch(Dispatchers.IO) {
            val opId = "OP_MGR_" + UUID.randomUUID().toString().take(8)
            val res = AppsScriptSyncProtocol.get(
                action = "GET_MANAGER_DASHBOARD",
                params = mapOf(
                    "sessionToken" to user.sessionToken,
                    "operationId" to opId,
                    "date" to PhoneNormalizer.todayYmd()
                )
            )
            if (res.accepted) {
                val arr = JSONObject(res.body).optJSONArray("reports") ?: return@launch
                _managerReports.value = (0 until arr.length()).map { i ->
                    val o = arr.getJSONObject(i)
                    DailyCallingSummary(
                        dateYmd = o.optString("Date"),
                        telecallerId = o.optString("Telecaller_ID"),
                        telecallerName = o.optString("Telecaller_Name"),
                        totalCalls = o.optInt("Total_Calls_Attempted"),
                        connectedCalls = o.optInt("Connected_Calls"),
                        notConnectedCalls = o.optInt("Not_Connected_Calls"),
                        whatsAppSharedCount = o.optInt("WhatsApp_Details_Shared"),
                        totalCallingSeconds = o.optInt("Total_Calling_Seconds"),
                        totalCallingHoursHHMMSS = o.optString("Total_Calling_Hours", "00:00:00"),
                        followUpsCompleted = o.optInt("Follow_Ups_Completed"),
                        followUpsPending = o.optInt("Follow_Ups_Pending")
                    )
                }
            }
        }
    }

    private suspend fun enqueueLeadUpsert(lead: LeadEntity) {
        val opId = "OP_LD_" + UUID.randomUUID().toString().take(8)
        val payload = JSONObject().apply {
            put("leadId", lead.leadId)
            put("name", lead.name)
            put("phone", lead.phone)
            put("campaignSource", lead.campaignSource)
            put("configRequirement", lead.configRequirement)
            put("preferredLocation", lead.preferredLocation)
            put("budget", lead.budget)
            put("assignedTo", lead.assignedTo)
            put("status", lead.status)
            put("nextFollowUpAt", lead.nextFollowUpAt)
            put("notes", lead.notes)
            put("createdBy", lead.createdBy)
            put("updatedAt", lead.updatedAt)
        }
        dao.enqueueSync(PendingSyncEntity(operationId = opId, action = "UPSERT_LEAD", payloadJson = payload.toString()))
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/ui/navigation/CrmNavHost.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Navigation Compose graph wiring Login, TelecallerHome, LeadDetail, AddLead, DailyReport, ManagerDashboard, PostCallDispositionSheet, and WhatsAppShareSheet.',
    code: `package com.realestate.crm.ui.navigation

import androidx.compose.runtime.*
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.realestate.crm.data.local.LeadEntity
import com.realestate.crm.ui.CrmViewModel
import com.realestate.crm.ui.components.RequestCrmPermissionsOnLaunch
import com.realestate.crm.ui.screens.*
import com.realestate.crm.util.PhoneNormalizer
import com.realestate.crm.worker.DailyCallingSummary

object CrmRoutes {
    const val LOGIN = "login"
    const val TELECALLER_HOME = "telecaller_home"
    const val LEAD_DETAIL = "lead_detail/{leadId}"
    const val ADD_LEAD = "add_lead"
    const val DAILY_REPORT = "daily_report"
    const val MANAGER_DASHBOARD = "manager_dashboard"
    fun leadDetail(leadId: String) = "lead_detail/$leadId"
}

@Composable
fun CrmNavHost(
    viewModel: CrmViewModel,
    initialPostCallLeadId: String? = null,
    initialOpenLeadId: String? = null
) {
    val navController = rememberNavController()
    val session by viewModel.session.collectAsState()
    val leads by viewModel.leads.collectAsState()
    val templates by viewModel.templates.collectAsState()
    val todayCalls by viewModel.todayCalls.collectAsState()
    val pendingCount by viewModel.pendingSyncCount.collectAsState()
    val loginLoading by viewModel.loginLoading.collectAsState()
    val loginError by viewModel.loginError.collectAsState()
    val dailySummary by viewModel.dailySummary.collectAsState()
    val managerReports by viewModel.managerReports.collectAsState()

    var dispositionLead by remember { mutableStateOf<LeadEntity?>(null) }
    var whatsAppLead by remember { mutableStateOf<LeadEntity?>(null) }
    var lastSessionToken by remember { mutableStateOf(session?.sessionToken) }

    if (session != null) {
        RequestCrmPermissionsOnLaunch()
    }

    LaunchedEffect(initialPostCallLeadId, leads) {
        if (!initialPostCallLeadId.isNullOrBlank()) {
            leads.find { it.leadId == initialPostCallLeadId }?.let { dispositionLead = it }
        }
    }

    LaunchedEffect(initialOpenLeadId, session) {
        if (!initialOpenLeadId.isNullOrBlank() && session != null) {
            navController.navigate(CrmRoutes.leadDetail(initialOpenLeadId))
        }
    }

    LaunchedEffect(session) {
        val currentSession = session
        if (currentSession?.sessionToken != lastSessionToken) {
            lastSessionToken = currentSession?.sessionToken
            if (currentSession == null) {
                navController.navigate(CrmRoutes.LOGIN) { popUpTo(0) { inclusive = true } }
            } else {
                val target = if (currentSession.role == "ADMIN") CrmRoutes.MANAGER_DASHBOARD else CrmRoutes.TELECALLER_HOME
                navController.navigate(target) { popUpTo(0) { inclusive = true } }
            }
        }
    }

    val startDest = remember {
        when {
            session == null -> CrmRoutes.LOGIN
            session?.role == "ADMIN" -> CrmRoutes.MANAGER_DASHBOARD
            else -> CrmRoutes.TELECALLER_HOME
        }
    }

    NavHost(navController = navController, startDestination = startDest) {
        composable(CrmRoutes.LOGIN) {
            LoginScreen(
                isLoading = loginLoading,
                errorMessage = loginError,
                onLogin = { phone, pin -> viewModel.login(phone, pin) }
            )
        }

        composable(CrmRoutes.TELECALLER_HOME) {
            val activeSession = session ?: return@composable
            val scopedLeads = remember(leads, activeSession) {
                if (activeSession.role == "ADMIN") leads else leads.filter { it.assignedTo == activeSession.userId }
            }
            TelecallerHomeScreen(
                telecallerName = activeSession.name,
                isAdmin = activeSession.role == "ADMIN",
                leads = scopedLeads,
                pendingSyncCount = pendingCount,
                onSyncNow = { viewModel.syncNow() },
                onCallLead = { lead ->
                    viewModel.dialLead(lead)
                    dispositionLead = lead
                },
                onWhatsAppLead = { lead -> whatsAppLead = lead },
                onOpenLeadDetail = { lead -> navController.navigate(CrmRoutes.leadDetail(lead.leadId)) },
                onOpenAddLead = { navController.navigate(CrmRoutes.ADD_LEAD) },
                onOpenDailyReport = {
                    viewModel.refreshDailyReport()
                    navController.navigate(CrmRoutes.DAILY_REPORT)
                },
                onOpenManagerDashboard = {
                    viewModel.refreshManagerDashboard()
                    navController.navigate(CrmRoutes.MANAGER_DASHBOARD)
                },
                onLogout = { viewModel.logout() }
            )
        }

        composable(
            route = CrmRoutes.LEAD_DETAIL,
            arguments = listOf(navArgument("leadId") { type = NavType.StringType })
        ) { backStack ->
            val activeSession = session ?: return@composable
            val leadId = backStack.arguments?.getString("leadId") ?: return@composable
            val lead = leads.find { it.leadId == leadId } ?: return@composable
            LeadDetailScreen(
                lead = lead,
                telecallerName = activeSession.name,
                onCallLead = {
                    viewModel.dialLead(lead)
                    dispositionLead = lead
                },
                onWhatsAppLead = { whatsAppLead = lead },
                onOpenDisposition = { dispositionLead = lead },
                onAppendRemark = { updatedNotes -> viewModel.appendRemark(lead, updatedNotes) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(CrmRoutes.ADD_LEAD) {
            val activeSession = session ?: return@composable
            AddLeadScreen(
                telecallerId = activeSession.userId,
                telecallerName = activeSession.name,
                onSaveLead = { newLead ->
                    viewModel.addLead(newLead)
                    navController.popBackStack()
                },
                onCancel = { navController.popBackStack() }
            )
        }

        composable(CrmRoutes.DAILY_REPORT) {
            val activeSession = session ?: return@composable
            val fallbackSummary = DailyCallingSummary(
                dateYmd = PhoneNormalizer.todayYmd(),
                telecallerId = activeSession.userId,
                telecallerName = activeSession.name,
                totalCalls = todayCalls.size,
                connectedCalls = todayCalls.count { it.isConnected },
                notConnectedCalls = todayCalls.count { !it.isConnected },
                whatsAppSharedCount = 0,
                totalCallingSeconds = todayCalls.sumOf { it.durationSec },
                totalCallingHoursHHMMSS = PhoneNormalizer.formatHms(todayCalls.sumOf { it.durationSec }),
                followUpsCompleted = 0,
                followUpsPending = 0
            )
            DailyReportScreen(
                summary = dailySummary ?: fallbackSummary,
                callsToday = todayCalls.filter { it.telecallerId == activeSession.userId },
                leadsMap = leads.associateBy { it.leadId },
                onBack = { navController.popBackStack() }
            )
        }

        composable(CrmRoutes.MANAGER_DASHBOARD) {
            val activeSession = session ?: return@composable
            val todayYmd = PhoneNormalizer.todayYmd()
            LaunchedEffect(Unit) { viewModel.refreshManagerDashboard() }
            ManagerDashboardScreen(
                userRole = activeSession.role,
                reports = managerReports,
                callsByTelecaller = todayCalls.groupBy { it.telecallerId },
                overdueByTelecaller = leads
                    .filter { it.nextFollowUpAt.isNotBlank() && it.nextFollowUpAt.take(10) < todayYmd }
                    .groupBy { it.assignedTo },
                onOpenAllLeads = { navController.navigate(CrmRoutes.TELECALLER_HOME) },
                onLogout = { viewModel.logout() }
            )
        }
    }

    dispositionLead?.let { lead ->
        PostCallDispositionSheet(
            lead = lead,
            onSaveDisposition = { newStatus, nextFollowUpAt, newRemark ->
                viewModel.saveDisposition(lead, newStatus, nextFollowUpAt, newRemark)
                dispositionLead = null
            },
            onOpenWhatsApp = { whatsAppLead = lead },
            onDismiss = { dispositionLead = null }
        )
    }

    whatsAppLead?.let { lead ->
        WhatsAppShareSheet(
            lead = lead,
            templates = templates,
            onSendAndLog = { tplName, body ->
                viewModel.shareOnWhatsApp(lead, tplName, body)
                whatsAppLead = null
            },
            onDismiss = { whatsAppLead = null }
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/com/realestate/crm/MainActivity.kt',
    layer: 'Jetpack Compose UI',
    language: 'kotlin',
    summary: 'Single-Activity launcher hosting RealEstateCrmTheme + CrmNavHost and handling CallStateReceiver / FollowUpAlarmReceiver intents.',
    code: `package com.realestate.crm

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import com.realestate.crm.ui.CrmViewModel
import com.realestate.crm.ui.navigation.CrmNavHost
import com.realestate.crm.ui.theme.RealEstateCrmTheme

class MainActivity : ComponentActivity() {
    private val postCallLeadIdState = mutableStateOf<String?>(null)
    private val openLeadIdState = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleLaunchExtras(intent)
        setContent {
            RealEstateCrmTheme {
                val vm: CrmViewModel = viewModel()
                CrmNavHost(
                    viewModel = vm,
                    initialPostCallLeadId = postCallLeadIdState.value,
                    initialOpenLeadId = openLeadIdState.value
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleLaunchExtras(intent)
    }

    private fun handleLaunchExtras(intent: Intent?) {
        postCallLeadIdState.value = intent?.getStringExtra("EXTRA_POST_CALL_LEAD_ID")
        openLeadIdState.value = intent?.getStringExtra("EXTRA_OPEN_LEAD_ID")
    }
}`,
  },
];
