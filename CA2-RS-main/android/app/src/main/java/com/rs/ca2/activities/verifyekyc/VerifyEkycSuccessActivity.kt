package com.rs.ca2.activities.verifyekyc

import com.google.gson.Gson
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.view.View
import android.widget.ImageView
import androidx.annotation.RequiresApi
import androidx.core.content.ContextCompat
import com.squareup.picasso.Picasso
import com.stfalcon.imageviewer.StfalconImageViewer
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityVerifyEkycSuccessBinding
import co.vnsafe.xverifysdk.jmrtd.VerificationStatus
import java.io.File
import android.content.Intent
class VerifyEkycSuccessActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyEkycSuccessBinding
    private lateinit var imageViewTransition : StfalconImageViewer<Bitmap>
    private var listFace : ArrayList<Bitmap> = ArrayList()

    @RequiresApi(Build.VERSION_CODES.M)
    override fun initUi() {


        val colorSuccess = ContextCompat.getColor(this, R.color.success)
        val colorFailed = ContextCompat.getColor(this, R.color.failed)

        val asystemSuccess =
            ONBOARDDATAMANAGER.eid?.chipAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED
                && ONBOARDDATAMANAGER.eid?.passiveAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED
                && ONBOARDDATAMANAGER.eid?.activeAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED

        val verifyIdSuccess = ONBOARDDATAMANAGER.isValidIdCard
        val faceMatchingSuccess = ONBOARDDATAMANAGER.isFaceMatch
        val fileRefImagePath = ONBOARDDATAMANAGER.referenceFaceImagePath
        val fileOnboardingImagePath = ONBOARDDATAMANAGER.onboardingFaceImagePath

        mBinding.valuePodASystems.setColorFilter(if (asystemSuccess) colorSuccess else colorFailed)
        mBinding.valuePodVerifyFace.setColorFilter(if (faceMatchingSuccess) colorSuccess else colorFailed)
        mBinding.valuePodVerifyEid.setColorFilter(if (verifyIdSuccess) colorSuccess else colorFailed)
        mBinding.valuePodASystems.setImageResource(if (asystemSuccess) R.drawable.ic_checkmark else R.drawable.ic_crossing)
        mBinding.valuePodVerifyFace.setImageResource(if (faceMatchingSuccess) R.drawable.ic_checkmark else R.drawable.ic_crossing)
        mBinding.valuePodVerifyEid.setImageResource(if (verifyIdSuccess) R.drawable.ic_checkmark else R.drawable.ic_crossing)
        if (asystemSuccess && faceMatchingSuccess && verifyIdSuccess) {
            mBinding.tvSuccess.text = getString(R.string.title_success_verification)
            mBinding.ivOnboardingStatus.setImageResource(R.drawable.ic_checkmark)
            mBinding.ivOnboardingStatus.setColorFilter(colorSuccess)
            mBinding.btnVerifyCompleted.text = getString(R.string.button_title_completed)
            mBinding.btnVerifyCompleted.setBackgroundColor(getColor(R.color.success))
            val jsonString = Gson().toJson(ONBOARDDATAMANAGER.eid?.personOptionalDetails)
            val pref = getSharedPreferences(packageName + "_preferences", Context.MODE_PRIVATE)
            pref.edit().putString("card_info",jsonString).apply();
            pref.edit().putString("EKYC_done", "1").apply();
            pref.edit().putString("faceMatching", faceMatchingSuccess.toString()).apply();
            pref.edit().putString("verifyID", verifyIdSuccess.toString()).apply();
        } else {
            mBinding.tvSuccess.text = getString(R.string.error_not_success)
            mBinding.ivOnboardingStatus.setImageResource(R.drawable.ic_crossing)
            mBinding.ivOnboardingStatus.setColorFilter(colorFailed)
            mBinding.btnVerifyCompleted.text = getString(R.string.button_title_try_again)
            mBinding.btnVerifyCompleted.setBackgroundColor(getColor(R.color.failed))
        }

        // IMAGE
        fileRefImagePath?.let {
            Picasso.get().load(File(it)).into(mBinding.ivOriginal)
            listFace.add(BitmapFactory.decodeFile(it))
        }
        fileOnboardingImagePath?.let {
            Picasso.get().load(File(it)).into(mBinding.ivFaceLive)
            listFace.add(BitmapFactory.decodeFile(it))
        }
        mBinding.ivOriginal.setOnClickListener {
            if (listFace.isEmpty()) {
                return@setOnClickListener
            }
            showImageLarge(it.context, listFace, 0, mBinding.ivOriginal)
        }
        mBinding.ivFaceLive.setOnClickListener {
            if (listFace.size > 1) {
                showImageLarge(it.context, listFace, 1, mBinding.ivFaceLive)
            }
        }

        // CHIP - Person Optional Details
        val personOptionalDetails = ONBOARDDATAMANAGER.eid?.personOptionalDetails
        if (personOptionalDetails != null) {
            mBinding.valuePodEid.text = personOptionalDetails.eidNumber
            mBinding.valuePodFullname.text = personOptionalDetails.fullName
            mBinding.valuePodDob.text = personOptionalDetails.dateOfBirth
            mBinding.valuePodGender.text = personOptionalDetails.gender
            mBinding.valuePodPlaceOfResidence.text = personOptionalDetails.placeOfResidence
        }
    }

    override fun setListeners() {
        mBinding.btnVerifyCompleted.setOnClickListener {
            finish()
            val intent = Intent(
                applicationContext,
                VerifyEkycMainActivity::class.java
            )
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            intent.putExtra("EXIT", true)
            startActivity(intent)
        }
        mBinding.ivOriginal.setOnClickListener {
            if (listFace.isEmpty()) {
                return@setOnClickListener
            }
            showImageLarge(this, listFace, 0, mBinding.ivOriginal)
        }
        mBinding.ivFaceLive.setOnClickListener {
            if (listFace.size > 1) {
                showImageLarge(this, listFace, 1, mBinding.ivFaceLive)
            }
        }
    }

    override fun populateData() {
    }

    override val layoutRes: Int
        get() = R.layout.activity_liveness

    override val layoutView: View
        get() {
            mBinding = ActivityVerifyEkycSuccessBinding.inflate(layoutInflater)
            return mBinding.root
        }

    private fun showImageLarge(context: Context, listBitmap: List<Bitmap>, position: Int, imageView: ImageView) {
        if (listBitmap.isEmpty()) {
            return
        }
        imageViewTransition = StfalconImageViewer.Builder(context, listBitmap) { imageViewLarge, imageLink -> viewImage(imageLink, imageViewLarge) }
            .withStartPosition(position)
            .withTransitionFrom(imageView).withImageChangeListener { position1 -> imageViewTransition.updateTransitionImage(imageView) }.show()
    }

    private fun viewImage(bitmap: Bitmap, imageViewLarge: ImageView) {
        imageViewLarge.setImageBitmap(bitmap)
    }
}