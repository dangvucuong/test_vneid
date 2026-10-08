package com.rs.ca2.fragments

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.squareup.picasso.Picasso
import com.stfalcon.imageviewer.StfalconImageViewer
import com.rs.ca2.R
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.FragmentOcrResultEkycBinding
import co.vnsafe.xverifysdk.jmrtd.VerificationStatus
import java.io.File

class OcrResultEkycFragment : Fragment() {

    private lateinit var mBinding: FragmentOcrResultEkycBinding
    private var listFace : ArrayList<Bitmap> = ArrayList()
    private lateinit var imageViewTransition : StfalconImageViewer<Bitmap>

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        mBinding = FragmentOcrResultEkycBinding.inflate(inflater, container, false)
        return mBinding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)


        val colorSuccess = ContextCompat.getColor(requireContext(), R.color.success)
        val colorFailed = ContextCompat.getColor(requireContext(), R.color.failed)


        val asystemSuccess = ONBOARDDATAMANAGER.eid?.chipAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED
                && ONBOARDDATAMANAGER.eid?.passiveAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED
                && ONBOARDDATAMANAGER.eid?.activeAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED

        val verifyIdSuccess = ONBOARDDATAMANAGER.isValidIdCard
        val faceMatchingSuccess = ONBOARDDATAMANAGER.isFaceMatch
        val fileRefImagePath = ONBOARDDATAMANAGER.referenceFaceImagePath
        val fileOnboardingImagePath = ONBOARDDATAMANAGER.onboardingFaceImagePath

        if (asystemSuccess && faceMatchingSuccess && verifyIdSuccess) {
            mBinding.ivOnboardingStatus.setImageResource(R.drawable.ic_checkmark)
            mBinding.ivOnboardingStatus.setColorFilter(colorSuccess)
        } else {
            mBinding.ivOnboardingStatus.setImageResource(R.drawable.ic_crossing)
            mBinding.ivOnboardingStatus.setColorFilter(colorFailed)
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
        mBinding.valuePodASystems.setColorFilter(if (asystemSuccess) colorSuccess else colorFailed)
        mBinding.valuePodVerifyFace.setColorFilter(if (faceMatchingSuccess) colorSuccess else colorFailed)
        mBinding.valuePodVerifyEid.setColorFilter(if (verifyIdSuccess) colorSuccess else colorFailed)
        mBinding.valuePodASystems.setImageResource(if (asystemSuccess) R.drawable.ic_checkmark else R.drawable.ic_crossing)
        mBinding.valuePodVerifyFace.setImageResource(if (faceMatchingSuccess) R.drawable.ic_checkmark else R.drawable.ic_crossing)
        mBinding.valuePodVerifyEid.setImageResource(if (verifyIdSuccess) R.drawable.ic_checkmark else R.drawable.ic_crossing)
    }

    private fun showImageLarge(context: Context, listBitmap: List<Bitmap>, position: Int, imageView: ImageView) {
        if (listBitmap.isEmpty()) {
            return
        }
        imageViewTransition = StfalconImageViewer.Builder(context, listBitmap) { imageViewLarge, imageLink -> viewImage(imageLink, imageViewLarge) }
            .withStartPosition(position)
            .withTransitionFrom(imageView).withImageChangeListener { imageViewTransition.updateTransitionImage(imageView) }.show()
    }

    private fun viewImage(bitmap: Bitmap, imageViewLarge: ImageView) {
        imageViewLarge.setImageBitmap(bitmap)
    }
}