package com.rs.ca2.fragments.ekyb

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.R
import com.rs.ca2.activities.ocr.OcrTransporterActivity
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.FragmentEkybPreviewDocumentBinding
import com.rs.ca2.model.PreviewDocumentModel
import co.vnsafe.xverifysdk.data.DocumentType


private const val ARG_PARAM = "ARG_PARAM"


class EkybPreviewDocumentFragment : Fragment() {


    private lateinit var _binding: FragmentEkybPreviewDocumentBinding
    private val binding get() = _binding


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentEkybPreviewDocumentBinding.inflate(inflater, container, false)


        binding.btnContinue.setOnClickListener {
            startActivity(Intent(requireContext(), OcrTransporterActivity::class.java))
        }

        binding.lheader.ivBack.setOnClickListener {
            requireActivity().supportFragmentManager.popBackStack()
        }
        initView()
        return binding.root
    }


    override fun onResume() {
        super.onResume()
    }
    private fun initView() {
        val previewDocumentModel = ONBOARDDATAMANAGER.previewDocumentModel
        Log.d("DEBUG", "previewDocumentModel: $previewDocumentModel")
        binding.tvTypeHead.text = previewDocumentModel?.typeDocument?.getLocalized(requireContext())
        binding.valueTextType.text = previewDocumentModel?.textType
        binding.valueDocBusinessName.text = previewDocumentModel?.businessName
        binding.valueDocSigner.text = previewDocumentModel?.signer
        binding.valueDocAddress.text = previewDocumentModel?.address
        binding.valueDocPlaceOfIssue.text = previewDocumentModel?.placeOfIssue
        binding.valueRepresentativesId.text = previewDocumentModel?.representativeModel?.eId
        binding.valueRepresentativesName.text = previewDocumentModel?.representativeModel?.fullName
        binding.valueDocTaxCode.text = previewDocumentModel?.taxcode
        binding.valueDocPhoneNumber.text = previewDocumentModel?.phoneNumber
        binding.valueRepresentativesDob.text = previewDocumentModel?.representativeModel?.dateOfBirth
        binding.valueRepresentativesDoi.text = previewDocumentModel?.representativeModel?.dateOfIssue
        binding.valueRepresentativesAddress.text = previewDocumentModel?.representativeModel?.address

        binding.labelBusinessName.text =
            when (ONBOARDDATAMANAGER.previewDocumentModel?.typeDocument) {
                DocumentType.COMPANY -> getString(R.string.business_name)
                DocumentType.COMPANY_BRANCH -> getString(R.string.business_branch_name)
                DocumentType.HOUSEHOLD -> getString(R.string.business_household_name)
                null -> getString(R.string.business_name)
            }
    }

    companion object {
        @JvmStatic
        fun newInstance(param: PreviewDocumentModel) =
            EkybPreviewDocumentFragment().apply {
                arguments = Bundle().apply {
                    putSerializable(ARG_PARAM, param)
                }
            }
    }
}