package com.rs.ca2.activities.verifyeid

import android.content.Intent
import android.view.View
import android.view.View.GONE
import com.google.gson.Gson
import com.google.gson.JsonNull
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PopupDialog
import com.rs.ca2.databinding.ActivityVerifyingBinding
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE

import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyIdResponseModel
import co.vnsafe.xverifysdk.utils.HashedUtils
import java.util.function.Consumer

class VerifyingEidActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyingBinding

    override fun initUi() {
        mBinding.layoutHeader.ivBack.visibility = GONE
    }

    override fun setListeners() {

    }

    override fun populateData() {
        requestVerifyEid()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {

    }

    override val layoutRes: Int
        get() = R.layout.activity_verifying
    override val layoutView: View
        get() {
            mBinding = ActivityVerifyingBinding.inflate(layoutInflater)
            return mBinding.root
        }

    //This function will verify citizen identification card with RAR. After verify successful, we will verify signature from response
    private fun requestVerifyEid() {
        val requestModel = ONBOARDDATAMANAGER.verifyIdRequestModel
        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        APISERVICE.verifyEid(requestModel!!, object: RestCallback<ResponseModel<VerifyIdResponseModel>>() {
            override fun Success(model: ResponseModel<VerifyIdResponseModel>?) {
                if (model == null) {
                    showPopup(getString(R.string.error_system)) { finish() }
                    return
                }
                if (model.data == null) {
                    val errorMessage = model.error?.message
                    showPopup(if (!errorMessage.isNullOrEmpty()) errorMessage else getString(R.string.error_not_success)) { finish() }
                    return
                }
                val isValidIdCard = model.data.isValidModel
                if (isValidIdCard) {
                    val respondsMsg = model.data.responds.toJsonString()
                    val signature = model.data?.signature ?: ""
                    ONBOARDDATAMANAGER.eid?.verifyRsaSignature(context,signature,respondsMsg)
                    startActivity(Intent(this@VerifyingEidActivity, VerifyEidSuccessActivity::class.java))
                    finish()
                } else {
                    showPopup(getString(R.string.error_verification)) { finish() }
                }
            }

            override fun Error(error: String?) {
                showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { finish() }
            }

        })
    }
}