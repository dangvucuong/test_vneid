package com.rs.ca2.activities.bio2345

import android.content.Intent
import android.view.View
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.squareup.picasso.Picasso
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.R
import com.rs.ca2.activities.MainActivity
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PreferencesKeys
import com.rs.ca2.databinding.ActivityTransferSuccessBinding
import co.vnsafe.xverifysdk.network.models.response.bio.TransactionStatus
import java.io.File
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.Date

class TransferSuccessActivity : BaseActivity() {

    private lateinit var mBinding : ActivityTransferSuccessBinding

    private var transactionStatus = TransactionStatus.UNKNOWN.code
    override fun initUi() {

        transactionStatus = intent.getIntExtra(IntentData.KEY_TRANSACTION_STATUS, TransactionStatus.UNKNOWN.code)

        val format: DateFormat = SimpleDateFormat("HH:mm - dd/MM/yyyy")
        val dateTransaction = format.format(Date())
        mBinding.tvTimeTransfer.text = dateTransaction

        val typeC = intent.getBooleanExtra(IntentData.KEY_TRANSACTION_TYPE_C, false)
        mBinding.tvTitleAmountValue.text = if (typeC) "500,000 VND" else "50,000,000 VND"
        mBinding.tvSubtitleAmountValue.text = if (typeC) "500,000 VND" else "50,000,000 VND"
        mBinding.tvDescriptionAmount.text = if (typeC) "Năm trăm ngàn đồng" else "Năm mươi triệu đồng"

        mBinding.tvSuccess.text =
            if(transactionStatus == TransactionStatus.BIOMETRIC_VERIFIED.code)
                getString(R.string.transaction_success)
            else
                getString(R.string.transaction_failed)
        mBinding.tvSuccess.setTextColor(
            if(transactionStatus == TransactionStatus.BIOMETRIC_VERIFIED.code)
                ContextCompat.getColor(APPDELEGATE.context, R.color.white)
            else
                ContextCompat.getColor(APPDELEGATE.context, R.color.transaction_failed) )
    }

    override fun setListeners() {
        mBinding.btnGoHome.setOnClickListener {

            val intent = Intent(this@TransferSuccessActivity, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
    }

    override fun populateData() {

        val sharedPreferences =  getSharedPreferences(PreferencesKeys.KEY_SHARE_NAME, MODE_PRIVATE)
        val chipImageBase64 = sharedPreferences.getString(PreferencesKeys.KEY_CHIP_IMAGE,"")
        val onboardImageBase64 = sharedPreferences.getString(PreferencesKeys.KEY_ONBOARD_IMAGE,"")


        val requestOptions = RequestOptions()
            .diskCacheStrategy(DiskCacheStrategy.NONE)

        Glide.with(mBinding.ivOriginal.context)
            .asBitmap()
            .load(chipImageBase64)
            .apply(requestOptions)
            .into(mBinding.ivOriginal)
        Glide.with(context)
            .asBitmap()
            .load(onboardImageBase64)
            .apply(requestOptions)
            .into(mBinding.ivFaceEkyc)

        ONBOARDDATAMANAGER.liveFaceImagePath?.let {
            Picasso.get().load(File(it)).into(mBinding.ivFaceLive)
        }
    }

    override val layoutRes: Int
        get() = R.layout.activity_transfer_success
    override val layoutView: View
        get() {
            mBinding = ActivityTransferSuccessBinding.inflate(layoutInflater)
            return mBinding.root
        }
}