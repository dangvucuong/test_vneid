package com.rs.ca2.activities.ocr

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.rs.ca2.R
import com.rs.ca2.fragments.CameraOCRFragment

@Suppress("DEPRECATION")
class OcrMainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_camera)
        replaceFragment()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        super.onBackPressed()
        setResult(RESULT_CANCELED)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
    }

    @SuppressLint("CommitTransaction")
    private fun replaceFragment() {
        val cameraOCRFragment = CameraOCRFragment()
        cameraOCRFragment.setCallBack {
            setResult(RESULT_OK)
            finish()
        }
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, cameraOCRFragment)
            .commit()
    }
}
