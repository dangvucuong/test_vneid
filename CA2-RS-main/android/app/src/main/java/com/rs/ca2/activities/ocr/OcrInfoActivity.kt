package com.rs.ca2.activities.ocr

import android.app.Dialog
import android.content.Intent
import android.graphics.Bitmap
import android.view.View
import android.widget.Toast
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.activities.common.NfcActivity
import com.rs.ca2.activities.common.ScanMrzActivity
import com.rs.ca2.activities.qrcode.ScanQrCodeEidActivity

import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityVerifyingOcrBinding
import com.rs.ca2.databinding.DialogSelectScanMrzOrQrcodeBinding
import com.rs.ca2.fragments.OcrInfoFragment
import co.vnsafe.xverifysdk.data.BasicInformation
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE
import co.vnsafe.xverifysdk.network.models.CardTypeEnums
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyOCRResponseModel

class OcrInfoActivity : BaseActivity() {

    private lateinit var mBinding: ActivityVerifyingOcrBinding
    private var isEid = false
    private var readMRZFromBitmap = false

    private var scanner: BarcodeScanner?=null


    override fun initUi() {

    }

    override fun setListeners() {
        mBinding.btnNext.setOnClickListener {
            displayDialog()
        }

        mBinding.lheader.ivBack.setOnClickListener {
            finish()
        }
    }

    override fun populateData() {
        requestVerifyOCR()
    }

    override fun onDestroy() {
        scanner?.close()
        super.onDestroy()
    }

    override val layoutRes: Int
        get() = R.layout.activity_verify_ocr_success

    override val layoutView: View
        get() {
            mBinding = ActivityVerifyingOcrBinding.inflate(layoutInflater)
            return mBinding.root
        }


    private fun requestVerifyOCR() {
        mBinding.btnNext.visibility = View.GONE
        mBinding.llProcessOcr.visibility = View.VISIBLE
        mBinding.tvStepInstruction.text = getString(R.string.loading)
        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        APISERVICE.verifyOCR(
            ONBOARDDATAMANAGER.mFileFront?.absolutePath!!,
            ONBOARDDATAMANAGER.mFileBack?.absolutePath!!,
            object : RestCallback<ResponseModel<VerifyOCRResponseModel>>() {
                override fun Success(model: ResponseModel<VerifyOCRResponseModel>?) {
                    if (model?.data != null) {
                        ONBOARDDATAMANAGER.mVerifyOCRModel = model.data
                        runOnUiThread {
                            if (!isFinishing && !isDestroyed) {
                                checkInfo()
                            }
                        }
                    } else {
                        showPopup(getString(R.string.error)) { finish() }
                    }
                    mBinding.btnNext.visibility = View.VISIBLE
                }

                override fun Error(error: String?) {
                    showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { finish() }
                }

            })
    }

    private fun checkInfo() {
        mBinding.llProcessOcr.visibility = View.INVISIBLE
        var typeCardFront = ""
        var typeCardBack = ""

        when (ONBOARDDATAMANAGER.mVerifyOCRModel?.frontTypeCard) {
            CardTypeEnums.FRONT_ID_CARD_9 -> typeCardFront = getString(R.string.card_type_cmnd)
            CardTypeEnums.FRONT_ID_CARD_12 -> typeCardFront = getString(R.string.card_type_cccd_12)
            CardTypeEnums.FRONT_CHIP_ID_CARD -> typeCardFront =
                getString(R.string.card_type_cccd_chip)
            CardTypeEnums.FRONT_CHIP_ID_NEW_CARD -> typeCardFront = getString(R.string.card_type_new_cccd_chip)
            CardTypeEnums.PASSPORT -> typeCardFront = getString(R.string.card_type_passport)
            else -> {
            }
        }

        when (ONBOARDDATAMANAGER.mVerifyOCRModel?.backTypeCard) {
            CardTypeEnums.BACK_ID_CARD_9 -> typeCardBack = getString(R.string.card_type_cmnd)
            CardTypeEnums.BACK_ID_CARD_12 -> typeCardBack = getString(R.string.card_type_cccd_12)
            CardTypeEnums.BACK_CHIP_ID_CARD -> {
                typeCardBack = getString(R.string.card_type_cccd_chip)
                isEid = true
            }
            CardTypeEnums.BACK_CHIP_ID_NEW_CARD -> typeCardBack = getString(R.string.card_type_new_cccd_chip)
            CardTypeEnums.PASSPORT -> typeCardBack = getString(R.string.card_type_passport)
            else -> {
            }
        }

        if (ONBOARDDATAMANAGER.mVerifyOCRModel?.frontValid == false && ONBOARDDATAMANAGER.mVerifyOCRModel?.backValid == false) {
            showPopup("${ONBOARDDATAMANAGER.mVerifyOCRModel?.frontInvalidMessage}\n${ONBOARDDATAMANAGER.mVerifyOCRModel?.backInvalidMessage}") { finish() }
            return
        }
        val ocrInfoFragment = OcrInfoFragment()
        ocrInfoFragment.setTypeCard(typeCardFront)
        val transaction = supportFragmentManager.beginTransaction()
        transaction.replace(mBinding.fragContainerMain.id, ocrInfoFragment)
        transaction.commit()
//        if (typeCardFront == getString(R.string.card_type_passport) ||
//            typeCardFront.isNotEmpty() && typeCardBack.isNotEmpty() && typeCardFront == typeCardBack
//        ) {
//            val ocrInfoFragment = OcrInfoFragment()
//            ocrInfoFragment.setTypeCard(typeCardFront)
//            val transaction = supportFragmentManager.beginTransaction()
//            transaction.replace(mBinding.fragContainerMain.id, ocrInfoFragment)
//            transaction.commit()
//        } else {
//            showPopup(getString(R.string.error_ocr_not_same_document)) { finish() }
//        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == RESULT_OK) {
            when (requestCode) {
                REQUEST_SCAN_QRCODE -> {
                    val basicInformation = data?.getSerializableExtra(IntentData.KEY_QRCODE_INFO) as BasicInformation
                    val intent = Intent(this, NfcActivity::class.java)
                    intent.putExtra(IntentData.KEY_QRCODE_INFO, basicInformation)
                    startActivityForResult(intent,REQUEST_NFC)
                }
                REQUEST_SCAN_MRZ -> {
                    val mrzInfo = data?.getSerializableExtra(IntentData.KEY_MRZ_INFO) as MRZInfo
                    val intent = Intent(this, NfcActivity::class.java)
                    intent.putExtra(IntentData.KEY_MRZ_INFO, mrzInfo)
                    startActivityForResult(intent,REQUEST_NFC)

                }

                REQUEST_NFC -> {
                    val intent = Intent(this@OcrInfoActivity, VerifyingOcrActivity::class.java)
                    startActivityForResult(intent, REQUEST_VERIFYING_NFC)
                }

                REQUEST_VERIFYING_NFC -> {
                    setResult(RESULT_OK)
                    finish()
                }
            }
        } else {
            finish()
        }
    }

    private fun displayDialog(){
        val dialog = Dialog(this,R.style.Custom_Dialog)
        val viewBinding = DialogSelectScanMrzOrQrcodeBinding.inflate(layoutInflater)
        dialog.setContentView(viewBinding.root)

        viewBinding.rdoMrz.setOnClickListener {
            val intent = Intent(this, ScanMrzActivity::class.java)
            startActivityForResult(intent, REQUEST_SCAN_MRZ)
            dialog.dismiss()
        }
        viewBinding.rdoQrcode.setOnClickListener {
            val intent = Intent(this, ScanQrCodeEidActivity::class.java)
            startActivityForResult(intent, REQUEST_SCAN_QRCODE)
            dialog.dismiss()
        }

        dialog.show()
    }


    companion object {
        private const val REQUEST_NFC = 1234
        private val REQUEST_SCAN_QRCODE = 12
        private val REQUEST_SCAN_MRZ = 15
        private const val REQUEST_VERIFYING_NFC = 3456
    }
}