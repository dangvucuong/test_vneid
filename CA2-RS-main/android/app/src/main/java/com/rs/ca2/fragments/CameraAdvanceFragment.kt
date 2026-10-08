package com.rs.ca2.fragments

import android.Manifest
import android.app.AlertDialog
import android.app.Dialog
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Log
import android.util.Size
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.OptIn
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.core.UseCase
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.util.Consumer
import androidx.lifecycle.LifecycleOwner
import com.google.common.util.concurrent.ListenableFuture
import com.rs.ca2.R
import com.rs.ca2.common.CoreConstant
import co.vnsafe.xverifysdk.utils.ImageUtils
import java.io.File

abstract class CameraAdvanceFragment:androidx.fragment.app.Fragment(), ActivityCompat.OnRequestPermissionsResultCallback  {

    abstract val cameraView: PreviewView
    private var cameraProvider: ProcessCameraProvider?=null
    var camera: Camera?=null
        private set
    private var cameraSelector:CameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
    abstract val imageAnalyzer:ImageAnalysis?
    private var imageCapture:ImageCapture?=null


    //==============================================================================================
    // region CAMERA
    //==============================================================================================
    @OptIn(ExperimentalGetImage::class)
    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(requireContext())
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()
            // Tạo Preview UseCase
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(cameraView.surfaceProvider)
            }

            imageCapture = ImageCapture.Builder()
                .setTargetResolution(Size(1280, 720))
                .build()

            val useCases = mutableSetOf<UseCase>()
            imageAnalyzer?.let { useCases.add(it) }
            useCases.add(preview)
            useCases.add(imageCapture!!)

            try {
                cameraProvider!!.unbindAll()
                camera = cameraProvider!!.bindToLifecycle(this, cameraSelector, *useCases.toTypedArray())
            } catch (exc: Exception) {
                Log.e(TAG, "Not init camera.", exc)
            }

        }, ContextCompat.getMainExecutor(requireContext()))
    }

    protected fun toggleCamera() {
        cameraSelector = if (cameraSelector == CameraSelector.DEFAULT_BACK_CAMERA) {
            CameraSelector.DEFAULT_FRONT_CAMERA
        } else {
            CameraSelector.DEFAULT_BACK_CAMERA
        }
        startCamera()
    }


    fun takePicture(file: File?, callBack: Consumer<Bitmap>) {
        file?.let { fileResult ->
            captureImage(fileResult) { filePath ->
                if(filePath!=null){
                    val bitmapScaleDown =
                        ImageUtils.scaleDown(BitmapFactory.decodeFile(filePath), 1000f, true)
                    val bitmap = ImageUtils.fixOrientation(bitmapScaleDown, filePath)
                    if (bitmap != null) {
                        callBack.accept(bitmap)
                    } else {
                        CoreConstant.showAlertDialog(requireContext(), "Capture image failure",CoreConstant.DialogType.ERROR)
                    }
                }
            }
        }

    }

    private fun captureImage(file: File, onSave: Consumer<String?>) {
        val outputFileOptions = ImageCapture.OutputFileOptions.Builder(file).build()
        imageCapture?.takePicture(
            outputFileOptions,
            ContextCompat.getMainExecutor(requireContext()),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                    onSave.accept(file.absolutePath)
                }

                override fun onError(exception: ImageCaptureException) {
                    Log.e(TAG, exception.message ?: "Unknown error")
                    onSave.accept(null)
                }
            }
        )
    }

    fun enableFlash(enable:Boolean){
        camera?.cameraControl?.enableTorch(enable)
    }

    fun setZoomRatioCamera(zoomLevel:Float): ListenableFuture<Void>? {
        return camera?.cameraControl?.setZoomRatio(zoomLevel)
    }

    //==============================================================================================
    // endregion CAMERA
    //==============================================================================================





    ////////////////////////////////////////////////////////////////////////////////////////
    //
    //        Permissions
    //
    ////////////////////////////////////////////////////////////////////////////////////////

    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(
            requireContext(), it) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestPermissions() {
        activityResultLauncher.launch(REQUIRED_PERMISSIONS)
    }
    private val activityResultLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions())
        { permissions ->
            // Handle Permission granted/rejected
            var permissionGranted = true
            permissions.entries.forEach {
                if (it.key in REQUIRED_PERMISSIONS && !it.value)
                    permissionGranted = false
            }
            if (!permissionGranted) {
                showErrorCameraPermissionDenied()
            } else {
                startCamera()
            }
        }
    protected fun showErrorCameraPermissionDenied() {
        ErrorDialog.newInstance(getString(R.string.permission_camera_rationale))
            .show(childFragmentManager, FRAGMENT_DIALOG)
    }


    ////////////////////////////////////////////////////////////////////////////////////////
    //
    //        Dialogs UI
    //
    ////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Shows a [Toast] on the UI thread.
     *
     * @param text The message to show
     */
    private fun showToast(text: String) {
        val activity = activity
        activity?.runOnUiThread { Toast.makeText(activity, text, Toast.LENGTH_SHORT).show() }
    }

    /**
     * Shows an error message dialog.
     */
    class ErrorDialog : androidx.fragment.app.DialogFragment() {

        override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
            val activity = activity
            return AlertDialog.Builder(activity)
                .setMessage(requireArguments().getString(ARG_MESSAGE))
                .setPositiveButton(android.R.string.ok) { dialogInterface, i -> activity!!.finish() }
                .create()
        }

        companion object {

            private val ARG_MESSAGE = "message"

            fun newInstance(message: String): ErrorDialog {
                val dialog = ErrorDialog()
                val args = Bundle()
                args.putString(ARG_MESSAGE, message)
                dialog.arguments = args
                return dialog
            }
        }

    }


    override fun onDestroyView() {
        cameraProvider?.unbindAll()
        imageCapture = null
        cameraProvider = null
        super.onDestroyView()
    }

    override fun onPause() {
        imageAnalyzer?.clearAnalyzer()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        // Request camera permissions
        if (allPermissionsGranted()) {
            startCamera()
        } else {
            requestPermissions()
        }
    }

    companion object {

        /**
         * Tag for the [Log].
         */
        private val TAG = CameraFragment::class.java.simpleName

        private const val REQUEST_CODE_PERMISSIONS = 10
        private val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.CAMERA)
        private val FRAGMENT_DIALOG = TAG

    }
}