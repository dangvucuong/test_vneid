package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.view.View
import android.view.View.GONE
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.EventTransaction
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.IntentData.KEY_TRANSACTION_STATUS
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PreferencesKeys.KEY_ID_CARD
import com.rs.ca2.common.PreferencesKeys.KEY_SHARE_NAME
import com.rs.ca2.databinding.ActivityVerifyingBinding
import co.vnsafe.xverifysdk.network.BioApiService.BIOAPISERVICE
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.request.bio.TransactionFaceRequestModel
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.bio.RARResponseModel
import co.vnsafe.xverifysdk.network.models.response.bio.TransactionStatus
import co.vnsafe.xverifysdk.utils.StringUtils
import java.util.UUID

class VerifyingFaceTransferActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyingBinding

    override fun initUi() {
        mBinding.layoutHeader.ivBack.visibility = GONE
    }

    override fun setListeners() {

    }

    override fun populateData() {
        if (ONBOARDDATAMANAGER.liveFaceImagePath == null) {
            CoreConstant.showAlertDialog(
                this@VerifyingFaceTransferActivity,
                "Vui lòng xác thực khuôn mặt trước khi giao dịch",
                CoreConstant.DialogType.ERROR
            )
           finish()
            return
        }

        requestVerifyTransfer(ONBOARDDATAMANAGER.liveFaceImagePath!!)
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



    private fun requestVerifyTransfer(faceLive : String) {
        mBinding.tvStepInstruction.text = getString(R.string.loading_verify)

        val idCardNumber = if(ONBOARDDATAMANAGER.verifyIdRequestModel?.idCard.isNullOrEmpty()) getSharedPreferences(KEY_SHARE_NAME, MODE_PRIVATE).getString(
            KEY_ID_CARD,"") else ONBOARDDATAMANAGER.verifyIdRequestModel?.idCard
        val transactionFaceRequestModel =  TransactionFaceRequestModel().apply {
            deviceUuid = if(BuildConfig.DEBUG) APPDELEGATE.randomDeviceUUID else StringUtils.getDeviceUniqueId(context)
            idCard = idCardNumber
            bankTransactionType = ONBOARDDATAMANAGER.bankTransactionType
            bankTransactionType = if (ONBOARDDATAMANAGER.isTransactionTypeC) "C" else "D"
            capturedImg = StringUtils.convertFileBitmapToBase64(faceLive)
        }
        BIOAPISERVICE.bioFaceVerificationBankTransaction(
            UUID.randomUUID().toString()
            ,transactionFaceRequestModel, object: RestCallback<ResponseModel<RARResponseModel>>() {
            override fun Success(model: ResponseModel<RARResponseModel>?) {
                if (model?.data != null && model.success == true && model.data.transactionStatus != null) {
                    ONBOARDDATAMANAGER.isFaceMatch = model.data.transactionStatus == TransactionStatus.BIOMETRIC_VERIFIED.code
                    val intent = Intent(this@VerifyingFaceTransferActivity, TransferSuccessActivity::class.java)
                    intent.putExtra(IntentData.KEY_TRANSACTION_TYPE_C, transactionFaceRequestModel.bankTransactionType)
                    intent.putExtra(KEY_TRANSACTION_STATUS, model.data.transactionStatus)
                    startActivity(intent)
                    finish()
                } else {
                    showPopup("Giao dịch không thành công.") { finish() }
                }
            }

            override fun Error(error: String?) {
                showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { finish() }
            }

        })
    }



    companion object{
        const val TRANSFER_OTP = 1110

    }

}