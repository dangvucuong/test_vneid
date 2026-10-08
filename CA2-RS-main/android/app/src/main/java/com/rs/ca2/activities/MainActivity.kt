package com.rs.ca2.activities

import android.content.Intent
import android.util.Log
import android.view.View
import android.widget.Toast
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.bio2345.LivenessOnboardingActivity
import com.rs.ca2.activities.bio2345.OnboardingBankActivity
import com.rs.ca2.activities.bio2345.TransferCreateActivity
import com.rs.ca2.activities.bio2345.VerifyOTPTransferActivity
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.ekyb.EkybVerifyDocumentActivity
import com.rs.ca2.activities.ocr.OcrTransporterActivity
import com.rs.ca2.activities.qrcode.QRCodeScannerActivity
import com.rs.ca2.activities.verifyeid.VerifyEidMainActivity
import com.rs.ca2.activities.verifyekyc.VerifyEkycMainActivity
import com.rs.ca2.adapters.DashboardAdapter
import com.rs.ca2.common.BusinessType
import com.rs.ca2.common.DashboardItem
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityMainBinding
import co.vnsafe.xverifysdk.network.ApiService
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE
import co.vnsafe.xverifysdk.network.BioApiService.BIOAPISERVICE
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.bio.OnboardStateResponseModel
import co.vnsafe.xverifysdk.onboard.OnboardStatus
import co.vnsafe.xverifysdk.utils.HashedUtils
import co.vnsafe.xverifysdk.utils.StringUtils

class MainActivity : BaseActivity() {

    private lateinit var mBinding: ActivityMainBinding
    private val TAG = MainActivity::class.java.simpleName

    override fun initUi() {

        ApiService.APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        BIOAPISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BIO2345_BASE_URL, BuildConfig.CUSTOMER_CODE)

        mBinding.lheader.ivBack.visibility = View.INVISIBLE
        mBinding.lheader.tvTitleHeader.setText(R.string.title_verify_suite)
        val adapter = DashboardAdapter { itemSelect: DashboardItem ->
            if(BusinessType.VERIFY_BANK_TRANSFER == itemSelect.businessType){
                requestCheckOnboardState(itemSelect)
            } else {
                actionSelectDashboard(
                    itemSelect.businessType
                )
            }
        }
        mBinding.rvDashboard.adapter = adapter
    }

    override fun setListeners() {
    }

    override fun populateData() {
    }

    override val layoutRes: Int
        get() = R.layout.activity_main

    override val layoutView: View
        get() {
            mBinding = ActivityMainBinding.inflate(layoutInflater)
            return mBinding.root
        }

    private fun actionSelectDashboard(type: BusinessType) {
        ONBOARDDATAMANAGER.businessType = type
        val intent = Intent(
            this, when (type) {
                BusinessType.VERIFY_EID -> VerifyEidMainActivity::class.java
                BusinessType.VERIFY_EID_ACTIVE_EKYC -> VerifyEkycMainActivity::class.java
                BusinessType.VERIFY_EID_SIMPLE_EKYC -> VerifyEkycMainActivity::class.java
                BusinessType.VERIFY_EID_PASSIVE_EKYC -> VerifyEkycMainActivity::class.java
                BusinessType.VERIFY_BANK_TRANSFER -> {
                    if (ONBOARDDATAMANAGER.onboardingStatus == OnboardStatus.ONBOARD_COMPLETED) {
                        ONBOARDDATAMANAGER.isTransactionOnboard = false
                        TransferCreateActivity::class.java
                    } else if (ONBOARDDATAMANAGER.onboardingStatus == OnboardStatus.BIOMETRIC_VERIFIED) {
                        VerifyOTPTransferActivity::class.java
                    } else if (ONBOARDDATAMANAGER.onboardingStatus == OnboardStatus.RAR_VERIFIED) {
                        LivenessOnboardingActivity::class.java
                    } else {
                        OnboardingBankActivity::class.java
                    }
                }
                BusinessType.VERIFY_OCR -> OcrTransporterActivity::class.java
                BusinessType.VERIFY_QR_CODE -> QRCodeScannerActivity::class.java
                BusinessType.VERIFY_EKYB ->  EkybVerifyDocumentActivity::class.java
            }
        )
        intent.putExtra(IntentData.KEY_BUSINESS_TYPE, type)
        startActivity(intent)


    }


    private fun requestCheckOnboardState(itemSelect: DashboardItem) {
        val deviceId =  if(BuildConfig.DEBUG) APPDELEGATE.randomDeviceUUID else StringUtils.getDeviceUniqueId(context)
        BIOAPISERVICE.bioGetOnboardStatus(deviceId, object : RestCallback<ResponseModel<OnboardStateResponseModel>>() {
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
                    ONBOARDDATAMANAGER.businessType = itemSelect.businessType

                    val activityClass = if (model.data.onboardingState == OnboardStatus.ONBOARD_COMPLETED.code) {
                        ONBOARDDATAMANAGER.isTransactionOnboard = false
                        TransferCreateActivity::class.java
                    } else if (model.data.onboardingState == OnboardStatus.BIOMETRIC_VERIFIED.code) {
                        VerifyOTPTransferActivity::class.java
                    } else if (model.data.onboardingState == OnboardStatus.RAR_VERIFIED.code) {
                        LivenessOnboardingActivity::class.java
                    } else {
                        OnboardingBankActivity::class.java
                    }

                    val intent = Intent( this@MainActivity,
                        activityClass
                    )
                    if (activityClass == VerifyOTPTransferActivity::class.java) {
                        intent.putExtra(IntentData.KEY_OTP_TYPE, false)
                    }


                    intent.putExtra(IntentData.KEY_BUSINESS_TYPE, itemSelect.businessType)
                    startActivity(intent)

                }
            }

            override fun Error(error: String?) {
                showPopup(error.toString()){}
            }
        })
    }

    override fun onDestroy() {
        super.onDestroy()
    }
}