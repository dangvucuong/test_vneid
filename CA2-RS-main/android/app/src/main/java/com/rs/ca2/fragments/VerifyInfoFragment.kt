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
import com.rs.ca2.databinding.FragmentVerifyInfoBinding
import java.util.Calendar

class VerifyInfoFragment : Fragment() {

    private lateinit var mBinding: FragmentVerifyInfoBinding
    private var listFace : ArrayList<Bitmap> = ArrayList()
    private lateinit var imageViewTransition : StfalconImageViewer<Bitmap>

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        mBinding = FragmentVerifyInfoBinding.inflate(inflater, container, false)
        mBinding.llPersonalInfo.ivFace.setOnClickListener {
            this.context?.let { it1 -> showImageLarge(it1, listFace, mBinding.llPersonalInfo.ivFace) }
        }
        return mBinding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val eid = ONBOARDDATAMANAGER.eid
        if (eid?.faceImage == null) {
            mBinding.llPersonalInfo.ivFace.visibility = View.GONE
        } else {
            eid.faceImage?.let { listFace.add(it) }
            mBinding.llPersonalInfo.ivFace.setImageBitmap(eid.faceImage)
        }
        mBinding.llPersonalInfo.tvContentFullName.text = eid?.personOptionalDetails?.fullName
        mBinding.llPersonalInfo.tvContentGender.text = eid?.personOptionalDetails?.gender
        mBinding.llPersonalInfo.tvContentDateOfBirth.text = eid?.personOptionalDetails?.dateOfBirth
        mBinding.llPersonalInfo.tvContentAge.text = eid?.personOptionalDetails?.dateOfBirth?.let { calcAge(it) }
        mBinding.llPersonalInfo.tvContentDocumentNumber.text = eid?.personOptionalDetails?.eidNumber
        mBinding.llPersonalInfo.tvContentDateOfIssue.text = eid?.personOptionalDetails?.dateOfIssue
        mBinding.llPersonalInfo.tvContentDateOfExpiry.text = eid?.personOptionalDetails?.dateOfExpiry
        mBinding.llPersonalInfo.tvEthnicity.text = eid?.personOptionalDetails?.ethnicity
        mBinding.llPersonalInfo.tvReligion.text = eid?.personOptionalDetails?.religion
        mBinding.llPersonalInfo.tvPlaceOfOrigin.text = eid?.personOptionalDetails?.placeOfOrigin
        mBinding.llPersonalInfo.tvPlaceOfResidence.text = eid?.personOptionalDetails?.placeOfResidence
        mBinding.llPersonalInfo.tvPersonalIdentification.text = eid?.personOptionalDetails?.personalIdentification
        mBinding.llPersonalInfo.tvFatherName.text = eid?.personOptionalDetails?.fatherName
        mBinding.llPersonalInfo.tvMotherName.text = eid?.personOptionalDetails?.motherName
        mBinding.llPersonalInfo.tvSpouseName.text = eid?.personOptionalDetails?.spouseName
        mBinding.llPersonalInfo.tvOldEidNumber.text = eid?.personOptionalDetails?.oldEidNumber
        mBinding.llPersonalInfo.tvTypeCard.text = eid?.getCardType()!!.localized(requireContext())
    }

    private fun showImageLarge(context: Context, listBitmap: List<Bitmap>, imageView: ImageView) {
        if (listBitmap.isEmpty()) {
            return
        }
        imageViewTransition = StfalconImageViewer.Builder(context, listBitmap) { imageViewLarge, imageLink -> viewImage(imageLink, imageViewLarge) }
            .withStartPosition(0)
            .withTransitionFrom(imageView).withImageChangeListener { position1 -> imageViewTransition.updateTransitionImage(imageView) }.show()
    }

    private fun viewImage(bitmap: Bitmap, imageViewLarge: ImageView) {
        imageViewLarge.setImageBitmap(bitmap)
    }

    private fun calcAge(date: String): String {
        val sYear = date.substring(date.lastIndexOf("/") + 1)
        val calendar = Calendar.getInstance()
        val currentYear = calendar[Calendar.YEAR]
        try {
            val age = currentYear - sYear.toInt()
            return if (age > 0) age.toString() else "-"
        } catch (_: NumberFormatException) {
        }
        return "-"
    }
}