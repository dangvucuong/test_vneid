package com.rs.ca2.activities.ocr

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.rs.ca2.R
import com.rs.ca2.activities.common.LivenessActivity
import com.rs.ca2.activities.common.SimpleEkycActivity
import com.rs.ca2.activities.ekyb.VerifyEkybSuccessActivity
import com.rs.ca2.common.BusinessType
import com.rs.ca2.common.ONBOARDDATAMANAGER
import co.vnsafe.xverifysdk.network.models.CardTypeEnums

@Suppress("DEPRECATION")
class OcrTransporterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_transporter)
        val intent = Intent(this, OcrMainActivity::class.java)
        startActivityForResult(intent, REQUEST_OCR_MAIN)
    }

    override fun onBackPressed() {
        super.onBackPressed()
        setResult(RESULT_CANCELED)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
    }

    override fun onResume() {
        super.onResume()
    }

    override fun onStop() {
        super.onStop()
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (resultCode == RESULT_OK) {
            when (requestCode) {
                REQUEST_OCR_MAIN -> {
                    val intent = Intent(this@OcrTransporterActivity, OcrInfoActivity::class.java)
                    if(ONBOARDDATAMANAGER.mVerifyOCRModel?.backTypeCard == CardTypeEnums.PASSPORT || ONBOARDDATAMANAGER.mVerifyOCRModel?.frontTypeCard == CardTypeEnums.PASSPORT){
                        val intent2 = Intent(
                            this@OcrTransporterActivity,
                            if (ONBOARDDATAMANAGER.businessType == BusinessType.VERIFY_EKYB) VerifyEkybSuccessActivity::class.java else VerifyOcrSuccessActivity::class.java
                        )
                        startActivity(intent2)
                        finish()
                    }else{
                        startActivityForResult(intent, REQUEST_CHECK_CARD)
                    }
                }

                REQUEST_CHECK_CARD -> {
                    val intent =
                        Intent(this@OcrTransporterActivity, OcrFaceMatchingActivity::class.java)
                    startActivityForResult(intent, REQUEST_OCR_LIVENESS)
                }

                REQUEST_OCR_LIVENESS -> {
                    val intent = Intent(
                        this@OcrTransporterActivity,
                        if (ONBOARDDATAMANAGER.businessType == BusinessType.VERIFY_EKYB) VerifyEkybSuccessActivity::class.java else VerifyOcrSuccessActivity::class.java
                    )
                    startActivity(intent)
                    finish()
                }
            }
        } else if (resultCode == RESULT_CANCELED && requestCode == REQUEST_OCR_MAIN) {
            finish()
        } else if (resultCode == RESULT_CANCELED && requestCode == REQUEST_CHECK_CARD
            || resultCode == RESULT_CANCELED && requestCode == REQUEST_OCR_LIVENESS
        ) {
            val intent = Intent(this, OcrMainActivity::class.java)
            startActivityForResult(intent, REQUEST_OCR_MAIN)
        }
        super.onActivityResult(requestCode, resultCode, data)
    }

    companion object {
        private const val REQUEST_OCR_MAIN = 123888
        private const val REQUEST_CHECK_CARD = 123456
        private const val REQUEST_OCR_LIVENESS = 345678
    }

}
