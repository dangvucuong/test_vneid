package com.rs.ca2.activities.verifyeid

import android.app.Dialog
import android.content.Intent
import android.view.View
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.common.NfcActivity
import com.rs.ca2.activities.common.ScanMrzActivity
import com.rs.ca2.activities.qrcode.ScanQrCodeEidActivity
import com.rs.ca2.common.IntentData
import com.rs.ca2.databinding.ActivityVerifyEidMainBinding
import com.rs.ca2.databinding.DialogSelectScanMrzOrQrcodeBinding
import co.vnsafe.xverifysdk.data.BasicInformation

class VerifyEidMainActivity : BaseActivity() {

    private lateinit var mBinding: ActivityVerifyEidMainBinding

    override fun initUi() {
        mBinding.introView.introImage.setImageResource(R.drawable.img_splash_eid)
        mBinding.introView.introTitle.setText(R.string.intro_title_eid)
        mBinding.introView.introDescription.setText(R.string.intro_description_eid)
    }

    override fun setListeners() {
        mBinding.lheader.ivBack.setOnClickListener { finish() }
        mBinding.btnVerifyNfc.setOnClickListener {
            displayDialog()
        }
    }

    override fun populateData() {
    }

    override val layoutRes: Int
        get() = R.layout.activity_verify_eid_main

    override val layoutView: View
        get() {
            mBinding = ActivityVerifyEidMainBinding.inflate(layoutInflater)
            return mBinding.root
        }

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
                    startActivityForResult(intent, REQUEST_NFC)
                }
                REQUEST_SCAN_MRZ -> {
                    val mrzInfo = dataIntent.getSerializableExtra(IntentData.KEY_MRZ_INFO) as MRZInfo
                    val intent = Intent(this, NfcActivity::class.java)
                    intent.putExtra(IntentData.KEY_MRZ_INFO, mrzInfo)
                    startActivityForResult(intent, REQUEST_NFC)

                }
                REQUEST_NFC -> {
                    startActivity(Intent(this@VerifyEidMainActivity, VerifyingEidActivity::class.java))
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
            startActivityForResult(intent, REQUEST_SCAN_MRZ)
            dialog.dismiss()
        }
        viewBinding.rdoQrcode.setOnClickListener {
            val intent = Intent(this, ScanQrCodeEidActivity::class.java)
            startActivityForResult(intent, REQUEST_SCAN_QRCODE)
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