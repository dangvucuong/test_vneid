package com.rs.ca2.common;

import android.content.Context;
import android.content.res.Resources;
import android.view.Gravity;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.pranavpandey.android.dynamic.toasts.DynamicToast;

import com.rs.ca2.R;

public class CoreConstant {
    public enum DialogType {
        SUCCESS, ERROR, WARNING, INFO
    }

    public static int getNavigationBarHeight(@NonNull Context context) {
        Resources resources = context.getResources();
        return resources.getDimensionPixelSize(com.intuit.sdp.R.dimen._50sdp);
    }

    public static void showAlertDialog(Context context, String message, DialogType type) {
        switch (type) {
            case SUCCESS:
                DynamicToast.Config.getInstance().setSuccessBackgroundColor(ContextCompat.getColor(context, R.color.success));
                Toast makeSuccess = DynamicToast.makeSuccess(context, message, Toast.LENGTH_LONG);
                makeSuccess.setGravity(Gravity.TOP | Gravity.CENTER_HORIZONTAL, 0, getNavigationBarHeight(context));
                makeSuccess.show();
                DynamicToast.Config.getInstance().reset();
                break;

            case ERROR:
                DynamicToast.Config.getInstance().setErrorBackgroundColor(ContextCompat.getColor(context, R.color.failed));
                Toast makeError = DynamicToast.makeError(context, message, Toast.LENGTH_LONG);
                makeError.setGravity(Gravity.TOP | Gravity.CENTER_HORIZONTAL, 0, getNavigationBarHeight(context));
                makeError.show();
                DynamicToast.Config.getInstance().reset();
                break;

            case WARNING:
                DynamicToast.Config.getInstance().setWarningBackgroundColor(ContextCompat.getColor(context, R.color.warning));
                Toast makeWarning = DynamicToast.makeWarning(context, message, Toast.LENGTH_LONG);
                makeWarning.setGravity(Gravity.TOP | Gravity.CENTER_HORIZONTAL, 0, getNavigationBarHeight(context));
                makeWarning.show();
                DynamicToast.Config.getInstance().reset();
                break;

            case INFO:
                DynamicToast.Config.getInstance().setWarningBackgroundColor(ContextCompat.getColor(context, R.color.colorPrimary));
                Toast makeInfo = DynamicToast.makeWarning(context, message, Toast.LENGTH_LONG);
                makeInfo.setGravity(Gravity.TOP | Gravity.CENTER_HORIZONTAL, 0, getNavigationBarHeight(context));
                makeInfo.show();
                DynamicToast.Config.getInstance().reset();
                break;
        }
    }
}
