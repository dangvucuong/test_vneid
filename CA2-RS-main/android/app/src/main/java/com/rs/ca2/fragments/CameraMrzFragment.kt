package com.rs.ca2.fragments

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Outline
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Bundle
import android.util.Log
import android.view.GestureDetector
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.view.PreviewView
import com.rs.ca2.R
import com.rs.ca2.databinding.FragmentCameraMrzBinding
import co.vnsafe.xverifysdk.vision.ocr.TextRecognitionAnalyzer

class CameraMrzFragment : CameraFragment() {

    private var binding: FragmentCameraMrzBinding? = null
    private var runnableInputTypeImage: Runnable? = null

    fun setInputTypeImageCallBack(runnable: Runnable) {
        this.runnableInputTypeImage = runnable
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentCameraMrzBinding.inflate(inflater, container, false)
        binding!!.lheader.tvTitleHeader.text = getString(R.string.step_1_scan_mrz)
        binding!!.framePreview.clipToOutline = true
        binding!!.framePreview.outlineProvider = object : ViewOutlineProvider() {
            override fun getOutline(view: View?, outline: Outline?) {
                view?.let {
                    outline?.setRoundRect(0, 0, it.width, (view.height), 16F)
                }
            }
        }
        binding!!.lheader.ivBack.setOnClickListener {
            activity?.finish()
        }

        binding!!.btnImageStatic.setOnClickListener {
            runnableInputTypeImage?.run()
        }
        setupGestureDetection()
        return binding?.root
    }

    override val imageAnalyzer: ImageAnalysis.Analyzer
        get() {return TextRecognitionAnalyzer() }


    override val cameraView: PreviewView
        get() {
            return binding?.cameraPreview!!
        }


    override fun onDestroyView() {
        binding = null
        super.onDestroyView()
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

}