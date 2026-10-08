package com.rs.ca2.fragments

import android.content.Context
import android.graphics.Bitmap
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.stfalcon.imageviewer.StfalconImageViewer
import com.rs.ca2.R
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.FragmentOcrResultInfoBinding
import co.vnsafe.xverifysdk.network.models.CardTypeEnums

class OcrResultInfoFragment: Fragment() {

    private var mBinding: FragmentOcrResultInfoBinding? = null
    private var typeCard: String? = ""
    private var listImages : ArrayList<Bitmap> = ArrayList()
    private lateinit var imageViewTransition : StfalconImageViewer<Bitmap>

    fun setTypeCard(type: String) {
        this.typeCard = type
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        mBinding = FragmentOcrResultInfoBinding.inflate(inflater, container, false)
        return mBinding?.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val colorSuccess = ContextCompat.getColor(view.context, R.color.success)
        val colorFailed = ContextCompat.getColor(view.context, R.color.failed)

        var eIdMatch = false

        when (ONBOARDDATAMANAGER.mVerifyOCRModel?.frontTypeCard) {

            CardTypeEnums.FRONT_ID_CARD_9 -> {
                eIdMatch = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.oldEidNumber.equals(ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber)
            }



            CardTypeEnums.FRONT_ID_CARD_12,
            CardTypeEnums.FRONT_CHIP_ID_CARD ,  CardTypeEnums.FRONT_CHIP_ID_NEW_CARD-> {
                eIdMatch = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.eidNumber.equals(ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber)
            }

            CardTypeEnums.PASSPORT -> {
                if (ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber?.length == 12) {
                    eIdMatch = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.eidNumber.equals(ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber)
                } else if (ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber?.length == 9) {
                    eIdMatch = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.oldEidNumber.equals(ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber)
                }
            }
            else -> {}
        }

        val fullNameMatch = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.fullName.equals(ONBOARDDATAMANAGER.mVerifyOCRModel?.fullName, ignoreCase = true)
        val eIdDOB = ONBOARDDATAMANAGER.eid?.personOptionalDetails?.dateOfBirth?.replace("/", "")?.replace("-", "")
        val oEidDOB = ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfBirth?.replace("/", "")?.replace("-", "")
        val dobMatch = eIdDOB.equals(oEidDOB)

        mBinding?.valuePodEid?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.personNumber
        mBinding?.valuePodFullname?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.fullName
        mBinding?.valuePodDob?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfBirth?.replace("-","/")

        mBinding?.valueMatchIdNumber?.setColorFilter(if (eIdMatch) colorSuccess else colorFailed)
        mBinding?.valueMatchName?.setColorFilter(if (fullNameMatch) colorSuccess else colorFailed)
        mBinding?.valueMatchDateOfBirth?.setColorFilter(if (dobMatch) colorSuccess else colorFailed)

        mBinding?.valueMatchIdNumber?.setImageResource(if (eIdMatch) R.drawable.ic_checkmark else R.drawable.ic_crossing)
        mBinding?.valueMatchName?.setImageResource(if (fullNameMatch) R.drawable.ic_checkmark else R.drawable.ic_crossing)
        mBinding?.valueMatchDateOfBirth?.setImageResource(if (dobMatch) R.drawable.ic_checkmark else R.drawable.ic_crossing)

        if (!ONBOARDDATAMANAGER.mVerifyOCRModel?.passportNumber.isNullOrEmpty()) {
            mBinding?.valuePassportNumber?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.passportNumber
        } else {
            mBinding?.tbrPassportNumber?.visibility = View.GONE
        }

        if (!ONBOARDDATAMANAGER.mVerifyOCRModel?.placeOfResidence.isNullOrEmpty()) {
            mBinding?.valueAddress?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.placeOfResidence
        } else {
            mBinding?.tbrAddress?.visibility = View.GONE
        }

        if (!ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfExpiry.isNullOrEmpty()) {
            mBinding?.valueDueDate?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfExpiry?.replace("-","/")
        } else {
            mBinding?.tbrDueDate?.visibility = View.GONE
        }

        if (!ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfIssue.isNullOrEmpty()) {
            mBinding?.valueIssuedDate?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.dateOfIssue?.replace("-","/")
        } else {
            mBinding?.tbrIssuedDate?.visibility = View.GONE
        }

        if (!ONBOARDDATAMANAGER.mVerifyOCRModel?.identificationSign.isNullOrEmpty()) {
            mBinding?.valueIdentification?.text = ONBOARDDATAMANAGER.mVerifyOCRModel?.identificationSign?.replaceFirstChar { it.uppercase() }
        } else {
            mBinding?.tbrIdentification?.visibility = View.GONE
        }

        ONBOARDDATAMANAGER.mBitmapFront?.let { listImages.add(it) }
        ONBOARDDATAMANAGER.mBitmapBack?.let { listImages.add(it) }

        mBinding?.ivEidFront?.setImageBitmap(ONBOARDDATAMANAGER.mBitmapFront)
        mBinding?.ivEidBack?.setImageBitmap(ONBOARDDATAMANAGER.mBitmapBack)

        mBinding?.ivEidFront?.setOnClickListener {
            if (listImages.isEmpty()) {
                return@setOnClickListener
            }
            showImageLarge(it.context, listImages, 0, mBinding?.ivEidFront)
        }

        mBinding?.ivEidBack?.setOnClickListener {
            if (listImages.size > 1) {
                showImageLarge(it.context, listImages, 1, mBinding?.ivEidBack)
            }
        }
    }

    private fun showImageLarge(context: Context, listBitmap: List<Bitmap>, position: Int, imageView: ImageView?) {
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