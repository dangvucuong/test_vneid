package com.rs.ca2.fragments

import android.annotation.SuppressLint
import android.graphics.Outline
import android.os.Bundle
import android.util.Log
import android.util.Size
import android.view.GestureDetector
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import androidx.camera.core.ImageAnalysis
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.ZoomSuggestionOptions
import com.google.mlkit.vision.barcode.common.Barcode
import com.rs.ca2.databinding.FragmentCameraQrBinding
import com.rs.ca2.vision.QRCodeAndBarcodeAnalyzer


class CameraQrFragment : CameraAdvanceFragment() {
    private var binding: FragmentCameraQrBinding? = null
    private var options = BarcodeScannerOptions.Builder()
        .enableAllPotentialBarcodes()
        .setBarcodeFormats(
            Barcode.FORMAT_ALL_FORMATS
        )


    override val imageAnalyzer: ImageAnalysis?
        get() { return ImageAnalysis.Builder()
            .setTargetResolution(Size(1280, 720))
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build().apply {
                val zoomCallback = ZoomSuggestionOptions.ZoomCallback { zoomLevel: Float ->
                    Log.i(TAG, "Set zoom ratio $zoomLevel")
                    val ignored = setZoomRatioCamera(zoomLevel)
                    true
                }
                options.setZoomSuggestionOptions(ZoomSuggestionOptions.Builder(zoomCallback).build())
                setAnalyzer(ContextCompat.getMainExecutor(requireContext()),
                    QRCodeAndBarcodeAnalyzer(options.build())
                )
            }
        }
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentCameraQrBinding.inflate(inflater, container, false)
        binding!!.llHeader.ivBack.setOnClickListener {
            activity?.finish()
        }
        binding!!.cameraPreview.clipToOutline = true
        binding!!.cameraPreview.clipToOutline = true
        binding!!.cameraPreview.outlineProvider = object : ViewOutlineProvider() {
            override fun getOutline(view: View?, outline: Outline?) {
                view?.let {
                    outline?.setRoundRect(0, 0, it.width, (view.height), 16F)
                }
            }
        }
        setupGestureDetection()
        return binding?.root
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupGestureDetection() {
        val gestureDetector = GestureDetector(requireContext(), object : GestureDetector.SimpleOnGestureListener() {
            override fun onFling(
                e1: MotionEvent?,
                e2: MotionEvent,
                velocityX: Float,
                velocityY: Float
            ): Boolean {
                if (e1 != null) {
                    val diffX = e2.x - e1.x
                    if (Math.abs(diffX) > 100) {
                        toggleCamera()
                        return true
                    }
                }
                return false
            }
        })

        binding?.cameraPreview?.apply {
            isFocusable = true
            isClickable = true
            setOnTouchListener { _, event ->
                Log.d("Gesture", "Touch detected: ${event.action}")
                gestureDetector.onTouchEvent(event)
            }
        }

    }


    override val cameraView: PreviewView
        get() {
            return binding?.cameraPreview!!
        }


    override fun onDestroyView() {
        binding = null
        super.onDestroyView()
    }

    companion object{
        private val TAG = CameraQrFragment::class.java.name
    }
}