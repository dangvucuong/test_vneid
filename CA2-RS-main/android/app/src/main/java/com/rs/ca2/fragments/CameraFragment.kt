package com.rs.ca2.fragments

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.app.Dialog
import android.content.Context
import android.content.Context.CAMERA_SERVICE
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.SparseIntArray
import android.view.Surface
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.camera.core.CameraSelector
import androidx.camera.core.CameraState
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.util.Consumer
import com.rs.ca2.R
import co.vnsafe.xverifysdk.utils.ImageUtils
import java.io.File
import java.util.concurrent.ExecutorService

import java.util.concurrent.Executors


abstract class CameraFragment:androidx.fragment.app.Fragment(), ActivityCompat.OnRequestPermissionsResultCallback {
    private var hasCameraPermission: Boolean = false
    abstract val cameraView:PreviewView
    abstract val imageAnalyzer:ImageAnalysis.Analyzer
    private val ORIENTATIONS = SparseIntArray()

    init {
        ORIENTATIONS.append(Surface.ROTATION_0, 0)
        ORIENTATIONS.append(Surface.ROTATION_90, 90)
        ORIENTATIONS.append(Surface.ROTATION_180, 180)
        ORIENTATIONS.append(Surface.ROTATION_270, 270)
    }


    protected var cameraSelector:CameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
    private var cameraController: LifecycleCameraController?=null

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
    }



    ////////////////////////////////////////////////////////////////////////////////////////
    //       region CAMERA
    ////////////////////////////////////////////////////////////////////////////////////////

    private fun startCamera(){
        cameraController = LifecycleCameraController(requireContext())
        cameraController!!.bindToLifecycle(this)
        cameraController!!.cameraSelector = cameraSelector
        cameraController!!.setImageAnalysisAnalyzer(Executors.newSingleThreadExecutor(),imageAnalyzer)
        cameraView.controller = cameraController
    }

    fun takePicture(file: File?, callBack: Consumer<Bitmap>){
        file?.let { fileResult->
            captureImage(fileResult){filePath ->
                val bitmapScaleDown = ImageUtils.scaleDown(BitmapFactory.decodeFile(filePath),1000f,true)
                val bitmap = ImageUtils.fixOrientation(bitmapScaleDown, filePath)
                if(bitmap!=null){
                    callBack.accept(bitmap)
                }else{
                    Toast.makeText(requireContext(),"Capture image failure",Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun captureImage(file: File, onSave: Consumer<String>) {
        val outputFileOptions = ImageCapture.OutputFileOptions.Builder(file).build()
        cameraController?.takePicture(
            outputFileOptions,
            ContextCompat.getMainExecutor(requireContext()),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                    onSave.accept(file.absolutePath)
                }
                override fun onError(exception: ImageCaptureException) {
                    Log.e(TAG, exception.message ?: "Unknown error")
                }
            }
        )
    }


    protected fun toggleCamera() {
        if (cameraController?.cameraSelector == CameraSelector.DEFAULT_BACK_CAMERA) {
            cameraController?.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
        } else {
            cameraController?.cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
        }
    }

    /**
     * Get the angle by which an image must be rotated given the device's current
     * orientation.
     */
    @Throws(CameraAccessException::class)
    private fun getRotationCompensation(cameraId: String, activity: Activity, isFrontFacing: Boolean): Int {
        // Get the device's current rotation relative to its "native" orientation.
        // Then, from the ORIENTATIONS table, look up the angle the image must be
        // rotated to compensate for the device's rotation.
        val deviceRotation = activity.windowManager.defaultDisplay.rotation
        var rotationCompensation = ORIENTATIONS.get(deviceRotation)

        // Get the device's sensor orientation.
        val cameraManager = activity.getSystemService(CAMERA_SERVICE) as CameraManager
        val sensorOrientation = cameraManager
            .getCameraCharacteristics(cameraId)
            .get(CameraCharacteristics.SENSOR_ORIENTATION)!!

        if (isFrontFacing) {
            rotationCompensation = (sensorOrientation + rotationCompensation) % 360
        } else { // back-facing
            rotationCompensation = (sensorOrientation - rotationCompensation + 360) % 360
        }
        return rotationCompensation
    }

    //////////////////////////////////////////////////////////////////////////////////////
    //  endregion
    /////////////////////////////////////////////////////////////////////////////////////


    override fun onDestroy() {
        super.onDestroy()
        cameraController = null
    }

    override fun onPause() {
        cameraController?.clearImageAnalysisAnalyzer()
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
                hasCameraPermission = true
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