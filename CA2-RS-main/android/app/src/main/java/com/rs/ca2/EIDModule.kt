package com.rs.ca2

import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.rs.ca2.activities.verifyekyc.VerifyEkycMainActivity
import co.vnsafe.xverifysdk.network.ApiService

@ReactModule(name = EIDModule.NAME)
class EIDModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val NAME = "EIDModule"
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun StartEKYC(name: String, successCallback: Callback, errorCallback: Callback) {
        try {
            // Khởi tạo API service
            ApiService.APISERVICE.init(
                BuildConfig.API_KEY,
                BuildConfig.API_BASE_URL,
                BuildConfig.CUSTOMER_CODE
            )

            // Tạo intent để mở VerifyEkycMainActivity
            val intent = Intent(reactContext, VerifyEkycMainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            // Khởi động activity
            reactContext.startActivity(intent)

            // Gọi successCallback
            successCallback.invoke("eKYC activity started successfully")
        } catch (e: Exception) {
            // Gọi errorCallback nếu có lỗi
            errorCallback.invoke("Error starting eKYC: ${e.message}")
            Log.e("EIDModule", "Error in StartEKYC", e)
        }
    }
}