package com.rs.ca2.activities.qrcode

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.google.mlkit.vision.barcode.common.Barcode
import com.rs.ca2.R

import com.rs.ca2.common.IntentData
import com.rs.ca2.fragments.CameraQrFragment
import com.rs.ca2.vision.QRCodeCallback
import com.rs.ca2.vision.QRCodeFacade
import co.vnsafe.xverifysdk.card.EidFacade


class ScanQrCodeEidActivity: AppCompatActivity() , QRCodeCallback {

    @SuppressLint("CommitTransaction")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_qrcode_scanner)

        val cameraMrzFragment = CameraQrFragment()
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, cameraMrzFragment,"QRCODE")
            .commit()
    }

    @Deprecated("Deprecated in Java")
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
            if (!qrValue.isNullOrEmpty()) {
                parserData(qrValue)
            }
        }
    }

    private fun parserData(string: String) {
        try {
            val result = EidFacade.parserQrCode(string)
            QRCodeFacade.unregisterListener(this)
            val intent = Intent()
            intent.putExtra(IntentData.KEY_QRCODE_INFO, result)
            setResult(RESULT_OK, intent)
            finish()
        }catch (e:Exception){
            Log.e(TAG,"Lỗi: ${e.message}")
        }
    }

    companion object{
        private val TAG = ScanQrCodeEidActivity::class.java.name
    }
}