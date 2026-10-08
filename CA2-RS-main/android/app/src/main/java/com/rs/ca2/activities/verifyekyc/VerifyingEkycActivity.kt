package com.rs.ca2.activities.verifyekyc

import android.content.Intent
import android.view.View
import android.widget.Toast
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.common.LivenessActivity
import com.rs.ca2.activities.common.PassiveEkycActivity

import com.rs.ca2.activities.common.SimpleEkycActivity
import com.rs.ca2.common.BusinessType
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.Utils
import com.rs.ca2.databinding.ActivityVerifyingBinding
import co.vnsafe.xverifysdk.network.ApiService
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyIdResponseModel


class VerifyingEkycActivity : BaseActivity() {

    private lateinit var mBinding: ActivityVerifyingBinding

    override fun initUi() {
        mBinding.layoutHeader.ivBack.visibility = View.GONE
    }

    override fun setListeners() {

    }

    override fun populateData() {
        verifySignatureWithRAR { result ->
            if (result) {
                val intent = Intent(
                    this@VerifyingEkycActivity,
                    when (ONBOARDDATAMANAGER.businessType) {
                        BusinessType.VERIFY_EID_ACTIVE_EKYC -> LivenessActivity::class.java
                        BusinessType.VERIFY_EID_SIMPLE_EKYC -> SimpleEkycActivity::class.java
                        BusinessType.VERIFY_EID_PASSIVE_EKYC -> PassiveEkycActivity::class.java
                        else -> LivenessActivity::class.java
                    }
                )

                startActivityForResult(intent, REQUEST_LIVENESS)
            } else {
                Toast.makeText(context, getString(R.string.error_not_success), Toast.LENGTH_SHORT)
                    .show()
            }
        }
    }

    @Deprecated(
        "Deprecated in Java", ReplaceWith(
            "super.onBackPressed()",
            "com.rs.ca2.activities.common.BaseActivity"
        )
    )
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

                    ONBOARDDATAMANAGER.isValidIdCard =
                        isValidIdCard && ONBOARDDATAMANAGER.eid?.dsCertChecksumVerified == true

                    if (ONBOARDDATAMANAGER.isValidIdCard) {
                        ONBOARDDATAMANAGER.eid?.faceImage?.let { face ->
                            Utils.storeImageEid(this@VerifyingEkycActivity, face) {
                                ONBOARDDATAMANAGER.referenceFaceImagePath = it
                            }
                        }
                    }
                    result(ONBOARDDATAMANAGER.isValidIdCard)
                }

                override fun Error(error: String?) {
                    showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { }
                    result(ONBOARDDATAMANAGER.isValidIdCard)
                }
            })
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (resultCode == RESULT_OK) {
            when (requestCode) {
                REQUEST_LIVENESS -> {
                    val intent = Intent(this, VerifyEkycSuccessActivity::class.java)
                    startActivity(intent)
                    finish()
                }
                else -> {
                    finish()
                }
            }
        }else{
            finish()
        }
    }

    companion object {
        private const val REQUEST_LIVENESS = 13
    }
}