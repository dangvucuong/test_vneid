package com.rs.ca2.activities.common

import android.Manifest.permission.CAMERA
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.text.TextUtils
import android.view.WindowManager
import android.webkit.MimeTypeMap
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import com.squareup.picasso.Picasso
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.verifyeid.VerifyingEidActivity
import com.rs.ca2.activities.verifyekyc.VerifyingEkycActivity
import com.rs.ca2.common.BusinessType
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityImportMrzBinding
import co.vnsafe.xverifysdk.card.EidFacade
import co.vnsafe.xverifysdk.card.MRZCallback
import co.vnsafe.xverifysdk.card.MRZException
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream

class ImportMrzActivity : ComponentActivity(), MRZCallback {

    private lateinit var mBinding: ActivityImportMrzBinding
    private var mFile: File? = null
    private var mFileFinal: File? = null
    private var mBitmapFinal: Bitmap? = null
    private var uri: Uri? = null
    private val authority: String = BuildConfig.APPLICATION_ID + ".provider"
    private var typeImage : TypeImage = TypeImage.CAPTURE
    private var mMRZInfo : MRZInfo? = null

    enum class TypeImage(val type: Int) {
        CAPTURE(1),
        FROM_GALLERY(2)
    }

    private val permissionCamera: ActivityResultLauncher<Array<String>> = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        val values: List<Boolean> = ArrayList(result.values)
        if (!values.contains(false)) {
            takePicture()
        }
    }

    private val someActivityResultLauncher: ActivityResultLauncher<Intent> = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult(),
        ActivityResultCallback { result ->
            if (result.resultCode == RESULT_OK) {
                if (typeImage == TypeImage.FROM_GALLERY) {
                    val data = result.data ?: return@ActivityResultCallback
                    uri = data.data
                }
                mFileFinal = uri?.let { fileFromContentUri(this, it) }
                mBitmapFinal = BitmapFactory.decodeFile(mFileFinal?.absolutePath)
                mFileFinal?.let { Picasso.get().load(mFileFinal!!).fit().centerCrop().into(mBinding.ivPreview) }
            }
        }
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        mBinding = ActivityImportMrzBinding.inflate(layoutInflater)
        setContentView(mBinding.root)
        setListener()
        EidFacade.registerMrzListener(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        EidFacade.unregisterMrzListener()
    }


    override fun completionHandler(mrzInfo: MRZInfo) {
        mMRZInfo = mrzInfo
        val intent = Intent()
        intent.putExtra(IntentData.KEY_MRZ_INFO, mrzInfo)
        setResult(RESULT_OK, intent)
        finish()
    }

    override fun errorHandler(e: MRZException?) {
        if (e != null && e is MRZException) {
            CoreConstant.showAlertDialog(this, getString(R.string.error_read_mrz_not_success), CoreConstant.DialogType.ERROR)
        }
    }

    private fun setListener() {
        mBinding.lheader.ivBack.setOnClickListener { finish() }
        mBinding.btnVerifyNext.setOnClickListener {
            if (mFileFinal == null) {
                CoreConstant.showAlertDialog(this, getString(R.string.error_read_mrz_not_image), CoreConstant.DialogType.ERROR)
                return@setOnClickListener
            }
            mFileFinal?.let { it1 -> EidFacade.processMrz(file = it1, 0) }
        }

        mBinding.btnFromGallery.setOnClickListener {
            typeImage = TypeImage.FROM_GALLERY
            val galleryIntent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            galleryIntent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            someActivityResultLauncher.launch(galleryIntent)
        }

        mBinding.btnFromCamera.setOnClickListener {
            typeImage = TypeImage.CAPTURE
            permissionCamera.launch(arrayOf(CAMERA))
        }
    }

    private fun fileFromContentUri(context: Context, contentUri: Uri): File {
        // Preparing Temp file name
        val fileExtension = getFileExtension(context, contentUri)
        val fileName = "temp_file_" + System.currentTimeMillis() + if (fileExtension != null) ".$fileExtension" else ""

        // Creating Temp file
        val tempFile = File(context.cacheDir, fileName)
        tempFile.createNewFile()

        try {
            val oStream = FileOutputStream(tempFile)
            val inputStream = context.contentResolver.openInputStream(contentUri)

            inputStream?.let {
                copy(inputStream, oStream)
            }

            oStream.flush()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        return tempFile
    }

    private fun getFileExtension(context: Context, uri: Uri): String? {
        val fileType: String? = context.contentResolver.getType(uri)
        return MimeTypeMap.getSingleton().getExtensionFromMimeType(fileType)
    }

    @Throws(IOException::class)
    private fun copy(source: InputStream, target: OutputStream) {
        val buf = ByteArray(8192)
        var length: Int
        while (source.read(buf).also { length = it } > 0) {
            target.write(buf, 0, length)
        }
    }

    @Throws(IOException::class)
    fun createImageFile(context: Context, name: String): File? {
        val imageFileName = "IMG_" + name + "_"
        val storageDir = context.cacheDir
        return File.createTempFile(imageFileName,  ".jpg", storageDir)
    }
    private fun takePicture() {
        val captureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        try {
            mFile = createImageFile(this, "${System.currentTimeMillis()}")
        } catch (e: java.lang.Exception) {
            CoreConstant.showAlertDialog(this, getString(R.string.error_take_picture), CoreConstant.DialogType.ERROR)
            return
        }
        if (TextUtils.isEmpty(authority)) {
            CoreConstant.showAlertDialog(this, getString(R.string.error_take_picture), CoreConstant.DialogType.ERROR)
            return
        }
        uri = authority.let { mFile?.let { itFile -> FileProvider.getUriForFile(this, it, itFile) } }
        captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, uri)
        someActivityResultLauncher.launch(captureIntent)
    }

    companion object {

    }
}