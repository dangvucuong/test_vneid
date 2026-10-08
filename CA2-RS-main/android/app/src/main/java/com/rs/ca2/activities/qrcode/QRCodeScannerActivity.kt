package com.rs.ca2.activities.qrcode

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.mlkit.vision.barcode.common.Barcode
import com.rs.ca2.R
import com.rs.ca2.fragments.CameraQrFragment
import com.rs.ca2.vision.QRCodeCallback
import com.rs.ca2.vision.QRCodeFacade


class QRCodeScannerActivity : AppCompatActivity() , QRCodeCallback {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_qrcode_scanner)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        val cameraMrzFragment = CameraQrFragment()
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, cameraMrzFragment)
            .commit()
    }

    override fun onBackPressed() {
        super.onBackPressed()
        setResult(RESULT_CANCELED)
        finish()
    }

    override fun onRestart() {
        super.onRestart()
    }

    override fun onResume() {
        super.onResume()
        QRCodeFacade.registerListener(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        QRCodeFacade.unregisterListener(this)
    }

    override fun onResult(result: List<Barcode>) {
        if (result.isNotEmpty()) {
            val qrValue  = result[0].displayValue;
            if(!qrValue.isNullOrEmpty()){
                QRCodeFacade.unregisterListener(this)
                val intent = Intent(this, VerifyGtinActivity::class.java);
                intent.putExtra("gtin", qrValue)
                startActivity(intent)
            }
        }
    }

}