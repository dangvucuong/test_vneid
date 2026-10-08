package com.rs.ca2

import android.annotation.SuppressLint
import android.app.Activity
import android.app.Application
import android.content.Context
import androidx.appcompat.app.AppCompatDelegate
import java.util.UUID
import kotlin.random.Random

@SuppressLint("StaticFieldLeak")
val APPDELEGATE = AppDelegate.shared

class AppDelegate : Application() {

    var activity: Activity? = null
    val context: Context get() = shared.applicationContext

    lateinit var randomDeviceUUID: String


    init { shared = this }

    override fun onCreate() {
        randomDeviceUUID = UUID.randomUUID().toString()
        super.onCreate()
        AppCompatDelegate.setCompatVectorFromResourcesEnabled(true)
    }

    companion object {
        val TAG = AppDelegate::class.java.simpleName
        @SuppressLint("StaticFieldLeak")
        @get:Synchronized
        var shared: AppDelegate = AppDelegate()
    }
}