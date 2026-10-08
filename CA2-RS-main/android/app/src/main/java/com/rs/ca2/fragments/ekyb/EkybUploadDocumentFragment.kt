package com.rs.ca2.fragments.ekyb

import android.app.Activity
import android.app.Activity.RESULT_OK
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.text.TextUtils
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.ActivityResultCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.core.content.FileProvider
import androidx.core.util.Consumer
import com.squareup.picasso.Picasso
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.ImportMrzActivity.TypeImage
import com.rs.ca2.activities.ocr.OcrTransporterActivity
import com.rs.ca2.adapters.OnAddImageListener
import com.rs.ca2.adapters.OnImageRemoveListener
import com.rs.ca2.adapters.UploadDocumentAdapter
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.DialogLoading
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.PopupDialog
import com.rs.ca2.databinding.FragmentEkybUploadDocumentBinding
import com.rs.ca2.model.PreviewDocumentModel
import com.rs.ca2.model.RepresentativeModel
import co.vnsafe.xverifysdk.data.DocumentType
import co.vnsafe.xverifysdk.network.ApiService
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.ekyb.OcrXDecodedResponse
import java.io.File
import java.io.IOException

class EkybUploadDocumentFragment : Fragment() {
    private lateinit var _binding: FragmentEkybUploadDocumentBinding
    private val binding get() = _binding
    private lateinit var adapter: UploadDocumentAdapter
    private var imageUri: Uri? = null
    private lateinit var documentsType: List<Pair<DocumentType, String>>
    private var selectedDocumentType: DocumentType? = null


    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentEkybUploadDocumentBinding.inflate(inflater, container, false)
        initView()
        setListener()
        return binding.root
    }

    private fun initView() {
        adapter = UploadDocumentAdapter(object : OnAddImageListener{
            override fun onAddImageClicked() {
                showImagePickerDialog()
            }
        }, object : OnImageRemoveListener{
            override fun onRemoveImageClicked(position: Int) {
                adapter.removeImage(position)
            }
        })
        binding.rvDocument.adapter = adapter

        documentsType = listOf(
            Pair(DocumentType.COMPANY, getString(R.string.doc_business)),
            Pair(DocumentType.COMPANY_BRANCH, getString(R.string.doc_branch)),
            Pair(DocumentType.HOUSEHOLD, getString(R.string.doc_business_household))
        )

        val documentNames = documentsType.map { it.second }
        val arrayAdapter = ArrayAdapter(requireContext(), R.layout.dropdown_item, documentNames)
        binding.autoCompleteTextView.setAdapter(arrayAdapter)
        binding.autoCompleteTextView.setText(documentNames.first(), false)
        selectedDocumentType = documentsType.first().first
    }

    private fun showImagePickerDialog() {
        val options = arrayOf("Chụp ảnh", "Chọn từ thư viện")
        AlertDialog.Builder(requireContext())
            .setTitle("Thêm ảnh")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> openCamera()
                    1 -> pickImageFromGallery()
                }
            }
            .show()
    }

    private fun openCamera() {
        val file = createImageFile(requireContext(), "${System.currentTimeMillis()}") ?: return
        imageUri = FileProvider.getUriForFile(
            requireContext(),
            "${requireContext().packageName}.provider",
            file
        )

        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        intent.putExtra(MediaStore.EXTRA_OUTPUT, imageUri)
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        startActivityForResult(intent, REQUEST_IMAGE_CAPTURE)
    }

    private fun pickImageFromGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        startActivityForResult(intent, REQUEST_IMAGE_PICK)
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK) {
            when (requestCode) {
                REQUEST_IMAGE_PICK -> {
                    data?.data?.let { uri ->
                        adapter.addImage(uri)
                    }
                }

                REQUEST_IMAGE_CAPTURE -> {
                    imageUri?.let { uri ->
                        adapter.addImage(uri)
                    }
                }
            }
        }
    }


    @Throws(IOException::class)
    fun createImageFile(context: Context, name: String): File? {
        val imageFileName = "IMG_" + name + "_"
        val storageDir = context.cacheDir
        return File.createTempFile(imageFileName, ".jpg", storageDir)
    }


    private fun setListener() {
        binding.lheader.ivBack.setOnClickListener {
            requireActivity().finish()
        }


        binding.autoCompleteTextView.setOnItemClickListener { parent, view, position, id ->
            selectedDocumentType = documentsType[position].first
        }

        binding.btnVerify.setOnClickListener {
            verifyDocument()
        }
    }


    private fun verifyDocument() {
        val uris = adapter.getImages()

        if (selectedDocumentType == null || uris.isEmpty()) {
            CoreConstant.showAlertDialog(
                requireContext(),
                "Vui lòng chọn tài liệu và ảnh trước khi xác minh",
                CoreConstant.DialogType.ERROR
            )
            return
        }

        val files = uris.map { uri -> uriToFile(requireContext(), uri) }

        DialogLoading.showLoading(requireContext())
        val callback = object : RestCallback<ResponseModel<OcrXDecodedResponse>>() {
            override fun Success(response: ResponseModel<OcrXDecodedResponse>) {
                DialogLoading.hideLoading()

                val result = response.data ?: return
                val representative = result.representatives?.firstOrNull()

                val preview = PreviewDocumentModel()
                preview.typeDocument = selectedDocumentType
                preview.transactionCode = result.transactionCode
                preview.businessName = result.name
                preview.textType = result.businessType
                preview.address = result.companyAddress
                preview.placeOfIssue = result.registrationOffice
                preview.signer = result.agentSignee
                preview.taxcode = result.taxCode
                preview.phoneNumber = null

                val representativeModel = RepresentativeModel()
                representativeModel.eId = representative?.idNumber
                representativeModel.fullName = representative?.name
                representativeModel.dateOfBirth = representative?.dateOfBirth
                representativeModel.dateOfIssue = representative?.idDateOfIssue
                representativeModel.address =
                    representative?.currentAddress ?: representative?.permanentAddress
                representativeModel.gender = representative?.gender

                preview.representativeModel = representativeModel
                ONBOARDDATAMANAGER.previewDocumentModel = preview

                requireActivity().supportFragmentManager.beginTransaction()
                    .replace(R.id.container, EkybPreviewDocumentFragment.newInstance(preview))
                    .addToBackStack(null)
                    .commit()
            }

            override fun Error(errorMessage: String) {
                DialogLoading.hideLoading()
                println("Error: $errorMessage")
                CoreConstant.showAlertDialog(requireContext(), errorMessage, CoreConstant.DialogType.ERROR)
            }
        }

        ApiService.APISERVICE.verifyDocumentBusiness(
            files,
            selectedDocumentType!!,
            OcrXDecodedResponse::class.java,
            callback
        )
    }


    fun uriToFile(context: Context, uri: Uri): File {
        val inputStream = context.contentResolver.openInputStream(uri)
        val file = File(context.cacheDir, "${System.currentTimeMillis()}.jpg")
        file.outputStream().use { output ->
            inputStream?.copyTo(output)
        }
        return file
    }

    private fun getRealPathFromUri(context: Context, uri: Uri): String? {
        var result: String? = null
        val cursor = context.contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val index = it.getColumnIndex(MediaStore.Images.ImageColumns.DATA)
                if (index != -1) {
                    result = it.getString(index)
                }
            }
        }
        return result
    }


    companion object {
        const val REQUEST_IMAGE_PICK = 100
        const val REQUEST_IMAGE_CAPTURE = 101
    }
}