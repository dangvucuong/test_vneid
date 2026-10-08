package com.rs.ca2.activities.verifyekyc

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.common.NfcActivity
import com.rs.ca2.activities.common.ScanMrzActivity
import com.rs.ca2.activities.qrcode.ScanQrCodeEidActivity
import com.rs.ca2.common.BusinessType
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.Utils
import com.rs.ca2.databinding.ActivityVerifyEkycMainBinding
import com.rs.ca2.databinding.DialogSelectScanMrzOrQrcodeBinding
import co.vnsafe.xverifysdk.data.BasicInformation
import co.vnsafe.xverifysdk.network.ApiService
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyIdResponseModel

class VerifyEkycMainActivity : BaseActivity() {

    private lateinit var mBinding: ActivityVerifyEkycMainBinding

    override fun initUi() {
        mBinding.introView.introImage.setImageResource(R.drawable.img_splash_ekyc)
        mBinding.introView.introTitle.setText(R.string.intro_title_ekyc)
        mBinding.introView.introDescription.setText(R.string.intro_description_ekyc)
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if ( intent.getBooleanExtra("EXIT", false)) {
            finish();
        }
    }
    override fun setListeners() {
        mBinding.lheader.ivBack.setOnClickListener { finish() }
//        mBinding.btnVerifyNfc.setOnClickListener {
//            displayDialog()
//        }
        mBinding.btnVerifyNfc.setOnClickListener {
            val intent = Intent(this, ScanMrzActivity::class.java)
            startActivityForResult(intent, REQUEST_SCAN_MRZ)
        }
    }

    override fun populateData() {

    }

    override val layoutRes: Int
        get() = R.layout.activity_verify_ekyc_main

    override val layoutView: View
        get() {
            mBinding = ActivityVerifyEkycMainBinding.inflate(layoutInflater)
            return mBinding.root
        }


    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        var dataIntent = data
        if (dataIntent == null) {
            dataIntent = Intent()
        }
        if (resultCode == RESULT_OK) {
            when (requestCode) {
                REQUEST_SCAN_QRCODE -> {
                    val basicInformation = dataIntent.getSerializableExtra(IntentData.KEY_QRCODE_INFO) as BasicInformation
                    val intent = Intent(this, NfcActivity::class.java)
                    intent.putExtra(IntentData.KEY_QRCODE_INFO, basicInformation)
                    startActivityForResult(intent,REQUEST_NFC)
                }
                REQUEST_SCAN_MRZ -> {
                    val mrzInfo = dataIntent.getSerializableExtra(IntentData.KEY_MRZ_INFO) as MRZInfo
                    val intent = Intent(this, NfcActivity::class.java)
                    intent.putExtra(IntentData.KEY_MRZ_INFO, mrzInfo)
                    startActivityForResult(intent,REQUEST_NFC)

                }
                REQUEST_NFC -> {
                    startActivity(Intent(this@VerifyEkycMainActivity, VerifyingEkycActivity::class.java))
                }
            }
        }
        super.onActivityResult(requestCode, resultCode, data)
    }


    private fun displayDialog(){
        val dialog = Dialog(this,R.style.Custom_Dialog)
        val viewBinding = DialogSelectScanMrzOrQrcodeBinding.inflate(layoutInflater)
        dialog.setContentView(viewBinding.root)

        viewBinding.rdoMrz.setOnClickListener {
            val intent = Intent(this, ScanMrzActivity::class.java)
            startActivityForResult(intent,
                REQUEST_SCAN_MRZ
            )
            dialog.dismiss()
        }
        viewBinding.rdoQrcode.setOnClickListener {
            val intent = Intent(this, ScanQrCodeEidActivity::class.java)
            startActivityForResult(intent,
                REQUEST_SCAN_QRCODE
            )
            dialog.dismiss()
        }

        dialog.show()
    }
    companion object {
        private val REQUEST_SCAN_QRCODE = 12
        private val REQUEST_SCAN_MRZ = 15
        private val REQUEST_NFC = 11

    }
}