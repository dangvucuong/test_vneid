package com.rs.ca2.fragments.ekyb

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import com.rs.ca2.R
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.DialogLoading
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.FragmentResultEkybBinding
import co.vnsafe.xverifysdk.data.DocumentType
import co.vnsafe.xverifysdk.network.ApiService
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.ekyb.CompanyInfo
import co.vnsafe.xverifysdk.network.models.response.ekyb.VerifyTaxCodeResponse


class ResultEkybFragment : Fragment() {
    private lateinit var binding: FragmentResultEkybBinding

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentResultEkybBinding.inflate(inflater, container, false)
        verifyTaxCode()
        return binding.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val personOptionalDetails = ONBOARDDATAMANAGER.eid?.personOptionalDetails
        binding.valueRepresentativesAddress.text = personOptionalDetails?.placeOfResidence
        binding.valueRepresentativesId.text = personOptionalDetails?.eidNumber
        binding.valueRepresentativesName.text = personOptionalDetails?.fullName
        binding.valueRepresentativesDob.text = personOptionalDetails?.dateOfBirth
        binding.valueRepresentativesDoi.text = personOptionalDetails?.dateOfIssue
        binding.labelBusinessName.text =
            when (ONBOARDDATAMANAGER.previewDocumentModel?.typeDocument) {
                DocumentType.COMPANY -> getString(R.string.business_name)
                DocumentType.COMPANY_BRANCH -> getString(R.string.business_branch_name)
                DocumentType.HOUSEHOLD -> getString(R.string.business_household_name)
                null -> getString(R.string.business_name)
            }

        val verifyIdSuccess = ONBOARDDATAMANAGER.isValidIdCard
        val colorSuccess = ContextCompat.getColor(requireContext(), R.color.success)
        if (verifyIdSuccess) {

            binding.valuePodVerifyEid.setColorFilter(colorSuccess)
            binding.valuePodVerifyEid.setImageResource(R.drawable.ic_checkmark)
        }

        if(ONBOARDDATAMANAGER.isFaceMatch){
            binding.valuePodVerifyFace.setColorFilter(colorSuccess)
            binding.valuePodVerifyFace.setImageResource(R.drawable.ic_checkmark)

        }
    }

    private fun verifyTaxCode() {
        val preview = ONBOARDDATAMANAGER.previewDocumentModel
        val taxCode = preview?.taxcode
        val documentType = preview?.typeDocument
        if (taxCode.isNullOrBlank() || documentType == null) {
            return
        }

        DialogLoading.showLoading(requireContext())
        ApiService.APISERVICE.verifyTaxcodeAdvance(
            taxCode,
            documentType,
            preview.transactionCode.orEmpty(),
            object : RestCallback<ResponseModel<VerifyTaxCodeResponse>>() {
                override fun Success(model: ResponseModel<VerifyTaxCodeResponse>?) {
                    DialogLoading.hideLoading()
                    if (model?.success == false || model?.data == null) {
                        CoreConstant.showAlertDialog(
                            requireContext(),
                            model?.error?.message,
                            CoreConstant.DialogType.ERROR
                        )
                        return
                    }
                    val data = model.data
                    val isValid = data.isValid.equals("true", ignoreCase = true) ||
                        data.isValid.equals("verified", ignoreCase = true)
                    val company = data.company
                    binding.valueDocTaxCode.text = company?.taxCode
                    binding.valueDocPhoneNumber.text = ""
                    binding.valueDocBusinessName.text = company?.name
                    binding.valueBusinessStatus.text = company?.businessStatus
                    binding.valueDocAddress.text = company?.companyAddress

                    if (isValid && company != null) {
                        Log.d("DEBUG", "response: ${model.data}")
                        validateData(company)
                    } else {
                        binding.tvTypeHead.text = getString(R.string.title_success_not_verification)
                    }
                }

                override fun Error(error: String?) {
                    DialogLoading.hideLoading()
                    CoreConstant.showAlertDialog(
                        requireContext(),
                        error,
                        CoreConstant.DialogType.ERROR
                    )
                }
            })
    }

    /*
     *User can photoshop image make to fake data, so you needn't verify information in chip with ocrx.
     * We need to get information from validate 2 (verify advance) then verify information in chip
     */
    private fun validateData(company: CompanyInfo) {
        val colorSuccess = ContextCompat.getColor(requireContext(), R.color.success)
        val colorFailed = ContextCompat.getColor(requireContext(), R.color.failed)

        binding.apply {
            valuePodVerifyTaxCode.setColorFilter(colorSuccess)
            valuePodVerifyTaxCode.setImageResource(R.drawable.ic_checkmark)

            val personDetails = ONBOARDDATAMANAGER.eid?.personOptionalDetails
            val isValid = personDetails?.let {
                it.fullName == company.representative &&
                        ONBOARDDATAMANAGER.isValidIdCard &&
                        ONBOARDDATAMANAGER.isFaceMatch
            } ?: false

            tvTypeHead.text = getString(
                if (isValid) R.string.title_success_verification
                else R.string.title_success_not_verification
            )

            if (isValid) {
                valuePodVerifyRepresentative.setColorFilter(colorSuccess)
                valuePodVerifyRepresentative.setImageResource(R.drawable.ic_checkmark)
            } else {
                personDetails?.let {
                    if (it.fullName != company.representative) {
                        valueRepresentativesName.setTextColor(colorFailed)
                    }
                }
            }
        }
    }

}
