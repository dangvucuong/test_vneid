package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.view.View
import android.widget.Toast
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.common.NfcActivity
import com.rs.ca2.activities.qrcode.ScanQrCodeEidActivity
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityVerifyEkycMainBinding
import co.vnsafe.xverifysdk.data.BasicInformation
import co.vnsafe.xverifysdk.network.ApiService
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyIdResponseModel

class VerifyEkycTransferMainActivity : BaseActivity() {

    private lateinit var mBinding: ActivityVerifyEkycMainBinding

    override fun initUi() {
        mBinding.introView.introImage.setImageResource(R.drawable.img_splash_ekyc)
        mBinding.introView.introTitle.setText(R.string.intro_title_ekyc)
        mBinding.introView.introDescription.setText(R.string.intro_description_ekyc)
    }

    override fun setListeners() {
        mBinding.lheader.ivBack.setOnClickListener { finish() }
        mBinding.btnVerifyNfc.setOnClickListener {
            val intent = Intent(this, ScanQrCodeEidActivity::class.java)
            startActivityForResult(intent, REQUEST_QRCODE)
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
                REQUEST_QRCODE -> {
                    val basicInformation = dataIntent.getSerializableExtra(IntentData.KEY_QRCODE_INFO) as BasicInformation
                    val intent = Intent(this, NfcActivity::class.java)
                    intent.putExtra(IntentData.KEY_QRCODE_INFO, basicInformation)
                    startActivityForResult(intent,REQUEST_NFC)
                }

                REQUEST_NFC -> {

                    verifySignatureWithRAR { result ->
                        if (result) {
                            startActivity(
                                Intent(
                                    this@VerifyEkycTransferMainActivity,
                                    LivenessOnboardingActivity::class.java
                                )
                            )
                            finish()
                        } else {
                            Toast.makeText(
                                context,
                                getString(R.string.error_verification),
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            }
        }
        super.onActivityResult(requestCode, resultCode, data)
    }

    private fun verifySignatureWithRAR(result: (Boolean) -> Unit) {
        val requestModel = ONBOARDDATAMANAGER.verifyIdRequestModel
        ApiService.APISERVICE.init(
            BuildConfig.API_KEY,
            BuildConfig.API_BASE_URL,
            BuildConfig.CUSTOMER_CODE
        )
        ApiService.APISERVICE.verifyEid(
            requestModel!!,
            object : RestCallback<ResponseModel<VerifyIdResponseModel>>() {
                override fun Success(model: ResponseModel<VerifyIdResponseModel>?) {
                    //response check
                    if (model == null) {
                        showPopup(getString(R.string.error_system)) { finish() }
                        return
                    }
                    //data check
                    if (model.data == null) {
                        val errorMessage = model.error?.message
                        showPopup(if (!errorMessage.isNullOrEmpty()) errorMessage else getString(R.string.error_not_success)) { finish() }
                        finish()
                        return
                    }
                    // validate check
                    val isValidIdCard = model.data.isValidIdCard
                    if (isValidIdCard) {
                        val respondsMsg = model.data.responds.toJsonString()
                        val signature = model.data?.signature ?: ""
                        //verify signature with RAR
                        ONBOARDDATAMANAGER.eid?.verifyRsaSignature(context, signature, respondsMsg)
                    }

                    result(isValidIdCard && ONBOARDDATAMANAGER.eid?.dsCertChecksumVerified == true)
                }

                override fun Error(error: String?) {
                    showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { }
                    result(false)
                }
            })
    }

    companion object {
        private val REQUEST_QRCODE = 12
        private val REQUEST_NFC = 11
    }
}