package com.rs.ca2.fragments

import android.content.Context
import android.graphics.Bitmap
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.fragment.app.Fragment
import com.stfalcon.imageviewer.StfalconImageViewer
import com.rs.ca2.common.ONBOARDDATAMANAGER

import com.rs.ca2.databinding.FragmentOcrInfoBinding

class OcrInfoFragment: Fragment() {

    private lateinit var mBinding: FragmentOcrInfoBinding
    private var typeCard: String? = ""
    private var listImages : ArrayList<Bitmap> = ArrayList()
    private lateinit var imageViewTransition : StfalconImageViewer<Bitmap>

    fun setTypeCard(type: String) {
        this.typeCard = type
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        mBinding = FragmentOcrInfoBinding.inflate(inflater, container, false)
        return mBinding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val dueDate = ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfExpiry?.ifEmpty { ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfIssue }
        mBinding.tvInfoType.text = typeCard
        mBinding.tvInfoFullname.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.fullName
        mBinding.tvInfoNumberId.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber
        mBinding.tvInfoBirthday.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfBirth?.replace("-","/")
        mBinding.tvInfoDueDate.text = dueDate?.replace("-","/")
        if (ONBOARDDATAMANAGER.mVerifyOCRModel?.gender.isNullOrEmpty()) {
            mBinding.llGender.visibility = View.GONE
        } else {
            mBinding.tvInfoGender.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.gender?.replaceFirstChar { it.uppercase() }
        }

        if (ONBOARDDATAMANAGER.mVerifyOCRModel?.passportNumber.isNullOrEmpty()) {
            mBinding.llPassportNumber.visibility = View.GONE
        } else {
            mBinding.tvPassportNumber.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.passportNumber
        }

        if (ONBOARDDATAMANAGER.mVerifyOCRModel?.placeOfResidence.isNullOrEmpty()) {
            mBinding.llAddress.visibility = View.GONE
        } else {
            mBinding.tvInfoAddress.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.placeOfResidence
        }

        if (ONBOARDDATAMANAGER.mVerifyOCRModel?.identificationSign.isNullOrEmpty()) {
            mBinding.llIdentification.visibility = View.GONE
        } else {
            mBinding.tvInfoIdentificationSign.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.identificationSign?.replaceFirstChar { it.uppercase() }
        }

        ONBOARDDATAMANAGER.mBitmapFront?.let { listImages.add(it) }
        ONBOARDDATAMANAGER.mBitmapBack?.let { listImages.add(it) }

        mBinding.ivEidFront.setImageBitmap(ONBOARDDATAMANAGER.mBitmapFront)
        mBinding.ivEidBack.setImageBitmap(ONBOARDDATAMANAGER.mBitmapBack)

        mBinding.ivEidFront.setOnClickListener {
            if (listImages.isEmpty()) {
                return@setOnClickListener
            }
            showImageLarge(it.context, listImages, 0, mBinding.ivEidFront)
        }

        mBinding.ivEidBack.setOnClickListener {
            if (listImages.size > 1) {
                showImageLarge(it.context, listImages, 1, mBinding.ivEidBack)
            }
        }
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