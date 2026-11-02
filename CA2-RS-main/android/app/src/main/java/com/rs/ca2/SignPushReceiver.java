package com.rs.ca2;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.NotificationCompat;
import java.util.List;

public class SignPushReceiver extends BroadcastReceiver {
  private static final String CHANNEL_ID = "1";
  private static final String PREF = "com.rs.ca2_preferences";
  private static final String PENDING_CODE = "pending_sign_code";

  @Override
  public void onReceive(Context context, Intent intent) {
    try {
      deliver(context, intent);
    } catch (Exception error) {
      android.util.Log.e("SignPushReceiver", "sign push failed", error);
    }
  }

  private void deliver(Context context, Intent intent) {
    if (intent == null || intent.getExtras() == null || isForeground(context)) {
      return;
    }
    Bundle extras = intent.getExtras();
    String key = text(extras, "key");
    if (!"2".equals(key) && !"0".equals(key) && !"3".equals(key)) {
      return;
    }
    String code = text(extras, "code");
    if ("2".equals(key) && code != null && !code.isEmpty()) {
      SharedPreferences prefs = context.getSharedPreferences(PREF, Context.MODE_PRIVATE);
      prefs.edit().putString(PENDING_CODE, code).commit();
    }
    String body = text(extras, "gcm.notification.body");
    if (body == null || body.isEmpty()) {
      body = text(extras, "body");
    }
    if (body == null || body.isEmpty()) {
      if ("2".equals(key)) {
        body = "Bạn có một yêu cầu cần ký";
      } else if ("0".equals(key)) {
        body = "Bạn có mã OTP";
      } else {
        body = "Đã ký văn bản thành công";
      }
    }
    show(context, body);
  }

  private void show(Context context, String body) {
    NotificationManager manager =
        (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    if (manager == null) {
      return;
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel =
          new NotificationChannel(CHANNEL_ID, "CA2", NotificationManager.IMPORTANCE_HIGH);
      channel.enableVibration(true);
      manager.createNotificationChannel(channel);
    }
    Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
    if (launch == null) {
      return;
    }
    launch.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    PendingIntent pending =
        PendingIntent.getActivity(
            context,
            1002,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    int icon = context.getResources().getIdentifier("ic_notification", "drawable", context.getPackageName());
    if (icon == 0) {
      icon = context.getApplicationInfo().icon;
    }
    NotificationCompat.Builder builder =
        new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(icon)
            .setContentTitle("CA2 REMOTE SIGNNING")
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pending);
    manager.notify(1002, builder.build());
  }

  private String text(Bundle extras, String name) {
    Object value = extras.get(name);
    if (value == null) {
      return null;
    }
    String text = String.valueOf(value);
    return "null".equals(text) ? null : text;
  }

  private boolean isForeground(Context context) {
    ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
    if (manager == null) {
      return false;
    }
    List<ActivityManager.RunningAppProcessInfo> processes = manager.getRunningAppProcesses();
    if (processes == null) {
      return false;
    }
    String packageName = context.getPackageName();
    for (ActivityManager.RunningAppProcessInfo process : processes) {
      if (process.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
          && packageName.equals(process.processName)) {
        return true;
      }
    }
    return false;
  }
}
