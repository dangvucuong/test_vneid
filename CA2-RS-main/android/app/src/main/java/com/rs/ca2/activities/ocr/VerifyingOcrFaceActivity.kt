package com.rs.ca2.activities.ocr

import android.annotation.SuppressLint
import android.view.View
import android.view.View.GONE
import org.greenrobot.eventbus.EventBus
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.EventTransaction
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityVerifyingBinding
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE

import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.face.FaceMatchingModel

class VerifyingOcrFaceActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyingBinding

    override fun initUi() {
        mBinding.layoutHeader.ivBack.visibility = GONE
    }

    override fun setListeners() {

    }

    override fun populateData() {

        if (ONBOARDDATAMANAGER.referenceFaceImagePath == null) {
            CoreConstant.showAlertDialog(
                this@VerifyingOcrFaceActivity,
                "Vui lòng xác thực EKYC trước khi giao dịch",
                CoreConstant.DialogType.ERROR
            )
            finish()
        }

        if (ONBOARDDATAMANAGER.liveFaceImagePath == null) {
            CoreConstant.showAlertDialog(
                this@VerifyingOcrFaceActivity,
                "Vui lòng xác thực khuôn mặt trước khi giao dịch",
                CoreConstant.DialogType.ERROR
            )
            finish()
        }

        requestVerifyFaceMatchingLiveEKyc(ONBOARDDATAMANAGER.liveFaceImagePath!!)
    }


    override fun onBackPressed() {
        super.onBackPressed()
    }

    override val layoutRes: Int
        get() = R.layout.activity_verifying

    override val layoutView: View
        get() {
            mBinding = ActivityVerifyingBinding.inflate(layoutInflater)
            return mBinding.root
        }

    private fun requestVerifyFaceMatchingLiveEKyc(faceLive : String) {
        mBinding.tvStepInstruction.text = getString(R.string.loading_verify)
        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        APISERVICE.verifyFaceMatching(ONBOARDDATAMANAGER.onboardingFaceImagePath!!, faceLive, object: RestCallback<FaceMatchingModel>() {
            override fun Success(model: FaceMatchingModel?) {
                if (model?.data != null && model.data.match == 1) {
                    requestVerifyFaceMatchingLiveEid(faceLive)
                } else {
                    showPopup("Đặt lệnh chưa thành công. Khuôn mặt không trùng khớp") { finish() }
                }
            }

            override fun Error(error: String?) {
                showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { finish() }
            }

        })
    }

    private fun requestVerifyFaceMatchingLiveEid(faceLive : String) {
        mBinding.tvStepInstruction.text = getString(R.string.loading_verify)
        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        APISERVICE.verifyFaceMatching(ONBOARDDATAMANAGER.referenceFaceImagePath!!, faceLive, object: RestCallback<FaceMatchingModel>() {
            override fun Success(model: FaceMatchingModel?) {
                if (model?.data != null && model.data.match == 1) {
                    EventBus.getDefault().post(EventTransaction())
                    finish()
                } else {
                    showPopup("Đặt lệnh chưa thành công. Khuôn mặt không trùng khớp") { finish() }
                }
            }

            override fun Error(error: String?) {
                showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { finish() }
            }

        })
    }
}