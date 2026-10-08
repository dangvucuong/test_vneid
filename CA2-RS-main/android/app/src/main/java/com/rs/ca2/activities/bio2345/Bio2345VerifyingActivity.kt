package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.os.Build
import android.view.View
import android.view.View.GONE
import com.google.gson.JsonObject
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PreferencesKeys
import com.rs.ca2.databinding.ActivityVerifyingBinding
import co.vnsafe.xverifysdk.network.BioApiService.BIOAPISERVICE
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.request.bio.RARRequestModel
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.bio.RARResponseModel
import co.vnsafe.xverifysdk.utils.StringUtils
import java.util.UUID

class Bio2345VerifyingActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyingBinding

    override fun initUi() {
        mBinding.layoutHeader.ivBack.visibility = GONE
    }

    override fun setListeners() {

    }

    override fun populateData() {
        mBinding.tvStepInstruction.text = getString(R.string.loading_verify)
        requestRarVerification{ message: String, result: Boolean ->
            if (result) {
                startActivity(Intent(this@Bio2345VerifyingActivity, LivenessOnboardingActivity::class.java))
                finish()
            } else {
                showPopup(message) {
                    finish()
                }
            }
        }
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

    private fun requestRarVerification(result: (String, Boolean) -> Unit) {

        val rarRequestModel = RARRequestModel()

        rarRequestModel.requestId = UUID.randomUUID().toString()
        rarRequestModel.deviceUuid = if(BuildConfig.DEBUG) APPDELEGATE.randomDeviceUUID else StringUtils.getDeviceUniqueId(context)
        rarRequestModel.province = StringUtils.getProvince(ONBOARDDATAMANAGER.eid?.personOptionalDetails?.placeOfOrigin)
        rarRequestModel.personalIdentification = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.personalIdentification
        rarRequestModel.placeOfOrigin  = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.placeOfOrigin
        rarRequestModel.chipImg  = StringUtils.bitmapToBase64(ONBOARDDATAMANAGER.eid?.faceImage!!).replace("\n","")
        rarRequestModel.dateOfBirth  = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.dateOfBirth
        rarRequestModel.dateOfExpiry = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.dateOfExpiry
        rarRequestModel.dateOfIssue = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.dateOfIssue
        rarRequestModel.deviceName =  Build.MODEL
        rarRequestModel.deviceType = "mobile"
        rarRequestModel.dsCert = ONBOARDDATAMANAGER.verifyIdRequestModel?.dsCert
        rarRequestModel.fatherName = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.fatherName
        rarRequestModel.fullName = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.fullName
        rarRequestModel.gender = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.gender
        rarRequestModel.idCard = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.eidNumber
        rarRequestModel.motherName = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.motherName
        rarRequestModel.nationality = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.nationality
        rarRequestModel.oldIdCard = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.oldEidNumber
        rarRequestModel.placeOfResidence = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.placeOfResidence
        rarRequestModel.race = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.ethnicity
        rarRequestModel.religion = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.religion

        BIOAPISERVICE.bioVerifyRAR(rarRequestModel, object: RestCallback<ResponseModel<RARResponseModel>>() {
            override fun Success(model: ResponseModel<RARResponseModel>?) {
                if (model == null) {
                    showPopup(getString(R.string.error_system)) { finish() }
                    return
                }
                if (model.data == null) {
                    val errorMessage = model.error?.message
                    showPopup(if (!errorMessage.isNullOrEmpty()) errorMessage else getString(R.string.error_not_success)) { finish() }
                    finish()
                    return
                }
                var rarVerified = false
                if (model.data.responds == null) {
                    rarVerified = false
                } else {
                    model.data.responds?.let { rarVerified = it.result?:false }
                }

                ONBOARDDATAMANAGER.isValidIdCard = true
                val share = getSharedPreferences(PreferencesKeys.KEY_SHARE_NAME, MODE_PRIVATE)
                share.edit().putString(PreferencesKeys.KEY_ID_CARD, ONBOARDDATAMANAGER.eid?.personOptionalDetails?.eidNumber).apply()
                share.edit().putString(PreferencesKeys.KEY_CHIP_IMAGE, StringUtils.bitmapToBase64(ONBOARDDATAMANAGER.eid?.faceImage!!).replace("\n","")).apply()
                val json = JsonObject()
                json.addProperty("eid_number", ONBOARDDATAMANAGER.eid?.personOptionalDetails?.eidNumber)
                json.addProperty("full_name", ONBOARDDATAMANAGER.eid?.personOptionalDetails?.fullName)
                json.addProperty("dob", ONBOARDDATAMANAGER.eid?.personOptionalDetails?.dateOfBirth)
                json.addProperty("gender", ONBOARDDATAMANAGER.eid?.personOptionalDetails?.gender)
                json.addProperty("place_of_residence", ONBOARDDATAMANAGER.eid?.personOptionalDetails?.placeOfResidence)
                share.edit().putString(PreferencesKeys.KEY_EID, json.toString()).apply()

                result(getString(R.string.error_not_success), rarVerified)
            }

            override fun Error(error: String?) {
                ONBOARDDATAMANAGER.isValidIdCard = false
                result(if (!error.isNullOrEmpty()) error else getString(R.string.error), false)
            }

        })
    }

}