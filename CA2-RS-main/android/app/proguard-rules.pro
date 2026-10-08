# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Gesture Handler / Screens / Navigation
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }

# react-native-pdf + react-native-blob-util (loaded when opening PDFViewer)
-keep class org.wonday.pdf.** { *; }
-keep class com.facebook.react.viewmanagers.RNPDFPdfViewManagerDelegate { *; }
-keep class com.facebook.react.viewmanagers.RNPDFPdfViewManagerInterface { *; }
-keep class com.ReactNativeBlobUtil.** { *; }
-dontwarn com.ReactNativeBlobUtil.**
-dontwarn org.wonday.pdf.**

-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn com.google.common.**
-dontwarn com.fasterxml.jackson.annotation.JsonFormat
-dontwarn com.fasterxml.jackson.annotation.JsonValue
-keep public class com.rs.ca2.common.OnboardDataManager { *; }
-keep public class com.rs.ca2.model.PreviewDocumentModel { *; }
-keep public class com.rs.ca2.model.RepresentativeModel { *; }
-keep class expo.** { *; }
-dontwarn expo.**
# ------------ SDK KEEPING -----------------------------------
-keep public class co.vnsafe.xverifysdk.data.* { *; }
-keep public class co.vnsafe.xverifysdk.vision.* { *; }
-keep public class co.vnsafe.xverifysdk.vision.core.* { *; }
-keep public class co.vnsafe.xverifysdk.card.* { *; }
-keep public class co.vnsafe.xverifysdk.jmrtd.VerificationStatus { *; }
-keep public class co.vnsafe.xverifysdk.jmrtd.VerificationStatus$* { *; }
-keep public class co.vnsafe.xverifysdk.jmrtd.FeatureStatus { *; }
-keep public class co.vnsafe.xverifysdk.jmrtd.FeatureStatus$* { *; }
-keep public class co.vnsafe.xverifysdk.utils.StringUtils { *; }
-keep public class co.vnsafe.xverifysdk.utils.HashedUtils { *; }

                # ------ Ekyc -----#
-keep public class co.vnsafe.xverifysdk.vision.core.StepFace { *; }

-keep public class co.vnsafe.xverifysdk.vision.core.StepFace { *; }
                # ------ CECA -----#
-keepclasseswithmembers class co.vnsafe.xverifysdk.utils.CecaUtils {
    public static boolean verifySignature (...);
    public static generateSignature(...);
    public static generateMessageId(...);
}
                # ------ OCR -----#
-keep public class co.vnsafe.xverifysdk.vision.ocr.TextRecognitionAnalyzer { *; }
-keep public class co.vnsafe.xverifysdk.vision.ocr.GraphicOverlay { *; }

# -----------------------Utils-------------------------------------
-keep public class co.vnsafe.xverifysdk.utils.DateUtils { *; }
-keep public class co.vnsafe.xverifysdk.utils.StringUtils { *; }
-keep public class co.vnsafe.xverifysdk.utils.ImageUtils { *; }
-keep public class co.vnsafe.xverifysdk.utils.SdkUtil { *; }



# ---------- Important ---------------------------------------
-keep class org.jmrtd.** { *; }
-keep class org.jmrtd.lds.icao.** { *; }
-keep class org.jmrtd.lds.** { *; }
-keep class org.spongycastle.jce.** { *; }
-keep class org.spongycastle.jce.provider.** { *; }
-keep class org.spongycastle.jcajce.provider.** { *; }
-keep class org.spongycastle.jcajce.provider.drbg.** { *; }
-keep class org.spongycastle.jcajce.provider.keystore.** { *; }
-keep class org.spongycastle.jcajce.provider.digest.** { *; }
-keep class org.spongycastle.jcajce.provider.asymmetric.** { *; }
-keep class org.spongycastle.jcajce.provider.symmetric.** { *; }
-keep class org.bouncycastle.jcajce.provider.digest.** { *; }
-keep class org.bouncycastle.jcajce.provider.symmetric.** { *; }
-keep class org.bouncycastle.jcajce.provider.keystore.** { *; }
-keep class org.bouncycastle.jcajce.provider.drbg.** { *; }
-keep class org.bouncycastle.jcajce.provider.asymmetric.** { *; }
# -------------------------------------------------------------



# ---------- Networks -----------------------------------------
-keep public class co.vnsafe.xverifysdk.network.* { *; }
-keep public class co.vnsafe.xverifysdk.network.models.* { *; }
-keep public class co.vnsafe.xverifysdk.network.models.request.* { *; }
-keep public class co.vnsafe.xverifysdk.network.models.response.* { *; }
-keep public class co.vnsafe.xverifysdk.network.models.response.face.* { *; }
-keep public class co.vnsafe.xverifysdk.network.models.response.bio.* { *; }
-keep public class co.vnsafe.xverifysdk.network.models.response.ekyb.* { *; }
-keep public class co.vnsafe.xverifysdk.network.models.request.bio.* { *; }
-keepattributes Exceptions, Signature, InnerClasses
# --------------------------------------------------------------


# ----------- Open source library ------------------------------
-keep public class net.sf.scuba.** { *; }
-keep public class retrofit2.** { *; }
-keep public class io.** { *; }
# --------------------------------------------------------------

-keep class co.vnsafe.xverifysdk.onboard.* { *; }

# Add any project specific keep options here:
