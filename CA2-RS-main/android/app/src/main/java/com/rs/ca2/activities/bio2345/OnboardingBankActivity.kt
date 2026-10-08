package com.rs.ca2.activities.bio2345

import android.app.Activity
import android.app.Dialog
import android.content.Intent
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.common.NfcActivity
import com.rs.ca2.activities.common.ScanMrzActivity
import com.rs.ca2.activities.qrcode.ScanQrCodeEidActivity

import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityOnboardingBankBinding
import com.rs.ca2.databinding.DialogSelectScanMrzOrQrcodeBinding
import co.vnsafe.xverifysdk.data.BasicInformation
import co.vnsafe.xverifysdk.network.BioApiService.BIOAPISERVICE
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.bio.OnboardStateResponseModel
import co.vnsafe.xverifysdk.onboard.OnboardStatus
import co.vnsafe.xverifysdk.utils.StringUtils

class OnboardingBankActivity : BaseActivity() {

    private lateinit var mBinding: ActivityOnboardingBankBinding

    override fun initUi() {
        mBinding.introView.introImage.setImageResource(R.drawable.img_splash_ekyc)
        mBinding.introView.introTitle.setText(R.string.intro_title_bio2345)
        mBinding.introView.introDescription.setText(R.string.intro_description_bio2345)
    }

    override fun setListeners() {
        mBinding.btnStartOnboard.setOnClickListener {

            requestCheckOnboardState()
        }

        mBinding.lheader.ivBack.setOnClickListener {
            finish()
        }
    }

    override fun populateData() {

    }

    override val layoutRes: Int
        get() = R.layout.activity_onboarding_bank

    override val layoutView: View
        get() {
            mBinding = ActivityOnboardingBankBinding.inflate(layoutInflater)
            return mBinding.root
        }


    private fun requestCheckOnboardState() {

        BIOAPISERVICE.bioGetOnboardStatus(if(BuildConfig.DEBUG) APPDELEGATE.randomDeviceUUID else StringUtils.getDeviceUniqueId(context),
            object : RestCallback<ResponseModel<OnboardStateResponseModel>>() {
            override fun Success(model: ResponseModel<OnboardStateResponseModel>?) {

                if (model == null) {
                    showPopup(getString(com.rs.ca2.R.string.error_system)) { finish() }
                    return
                }
                if (model.data == null) {
                    val errorMessage = model.error?.message
                    showPopup(if (!errorMessage.isNullOrEmpty()) errorMessage else getString(com.rs.ca2.R.string.error_not_success)) { finish() }
                    finish()
                    return
                }

                if (model.success == null) {
                    showPopup(getString(com.rs.ca2.R.string.error_not_success)) { finish() }
                    return
                }

                if (model.success == true) {
                    if (model.data.onboardingState == OnboardStatus.ONBOARD_COMPLETED.code) {
                        ONBOARDDATAMANAGER.isTransactionOnboard = false
                        startActivity(Intent(this@OnboardingBankActivity, TransferCreateActivity::class.java))
                    } else if (model.data.onboardingState == OnboardStatus.BIOMETRIC_VERIFIED.code) {
                        val intent = Intent(this@OnboardingBankActivity, VerifyOTPTransferActivity::class.java)
                        intent.putExtra(IntentData.KEY_OTP_TYPE, false)
                        startActivity(intent)
                    } else if (model.data.onboardingState == OnboardStatus.RAR_VERIFIED.code) {
                        startActivity(Intent(this@OnboardingBankActivity, LivenessOnboardingActivity::class.java))
                    } else {
                        displayDialog { activityClass ->
                            val intent = Intent(this@OnboardingBankActivity, activityClass)
                            if (activityClass == ScanQrCodeEidActivity::class.java) {
                                startActivityForResult(intent, REQUEST_SCAN_QRCODE)
                            } else if (activityClass == ScanMrzActivity::class.java) {
                                startActivityForResult(intent, REQUEST_SCAN_MRZ)
                            } else {
                                startActivity(intent)
                            }
                        }
                    }
                }

            }

            override fun Error(error: String?) {
                showPopup(error.toString()){}
            }
        })
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
                    startActivityForResult(intent, REQUEST_NFC)
                }
                REQUEST_SCAN_MRZ -> {
                    val mrzInfo = dataIntent.getSerializableExtra(IntentData.KEY_MRZ_INFO) as MRZInfo
                    val intent = Intent(this, NfcActivity::class.java)
                    intent.putExtra(IntentData.KEY_MRZ_INFO, mrzInfo)
                    startActivityForResult(intent, REQUEST_NFC)

                }

                REQUEST_NFC -> {
                    startActivity(Intent(this@OnboardingBankActivity, Bio2345VerifyingActivity::class.java))
                }
            }
        }
        super.onActivityResult(requestCode, resultCode, data)
    }
    private fun displayDialog(callback: (Class<out AppCompatActivity>) -> Unit) {
        val dialog = Dialog(this, R.style.Custom_Dialog)
        val viewBinding = DialogSelectScanMrzOrQrcodeBinding.inflate(layoutInflater)
        dialog.setContentView(viewBinding.root)

        viewBinding.rdoMrz.setOnClickListener {
            callback(ScanMrzActivity::class.java)
            dialog.dismiss()
        }

        viewBinding.rdoQrcode.setOnClickListener {
            callback(ScanQrCodeEidActivity::class.java)
            dialog.dismiss()
        }

        dialog.show()
    }




    companion object {
        private val REQUEST_NFC = 11
        private val REQUEST_SCAN_QRCODE = 12
        private val REQUEST_SCAN_MRZ = 15
    }
}


