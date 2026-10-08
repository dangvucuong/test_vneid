package com.rs.ca2.activities.ocr

import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.View.GONE
import android.widget.Toast
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.Utils
import com.rs.ca2.databinding.ActivityVerifyingBinding
import co.vnsafe.xverifysdk.network.ApiService
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyIdResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyOCRResponseModel

class VerifyingOcrActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyingBinding

    override fun initUi() {
        mBinding.layoutHeader.ivBack.visibility = GONE
    }

    override fun setListeners() {

    }

    override fun populateData() {
        verifySignatureWithRAR { result ->
            if (result) {
                setResult(RESULT_OK)
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

    @Deprecated("Deprecated in Java")
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
                        isValidIdCard && ONBOARDDATAMANAGER.eid?.dsCertChecksumVerified == true;

                    if (ONBOARDDATAMANAGER.isValidIdCard) {
                        ONBOARDDATAMANAGER.eid?.faceImage?.let { face ->
                            Utils.storeImageEid(this@VerifyingOcrActivity, face) {
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

    companion object {
        private const val REQUEST_NFC = 1234
        private const val REQUEST_MRZ = 2345
    }
}