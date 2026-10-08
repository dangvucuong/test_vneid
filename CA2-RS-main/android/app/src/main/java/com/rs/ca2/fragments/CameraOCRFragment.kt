package com.rs.ca2.fragments

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Outline
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.GestureDetector
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import androidx.camera.core.ImageAnalysis
import androidx.camera.view.PreviewView
import com.rs.ca2.R
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.FragmentCameraOrcBinding
import java.io.File
import kotlin.math.abs

class CameraOCRFragment : CameraAdvanceFragment() {

    private var binding: FragmentCameraOrcBinding? = null
    private var mediaPlayer: MediaPlayer? = null
    private var mCallBack: Runnable? = null

    fun setCallBack(callback: Runnable) {
        this.mCallBack = callback
    }

    fun reset() {
        captureStep = CaptureStep.CAPTURE_FRONT
        showDescription()
        ONBOARDDATAMANAGER.mFileFront = File(requireContext().cacheDir, "front_" + System.currentTimeMillis() + ".jpg")
        ONBOARDDATAMANAGER.mFileBack = File(requireContext().cacheDir, "back_" + System.currentTimeMillis() + ".jpg")
    }

    enum class CaptureStep {
        CAPTURE_FRONT,
        CAPTURE_BACK
    }

    private var captureStep: CaptureStep = CaptureStep.CAPTURE_FRONT

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        binding = FragmentCameraOrcBinding.inflate(inflater, container, false)
        mediaPlayer = MediaPlayer.create(requireContext(), R.raw.sound_take_photo)

        ONBOARDDATAMANAGER.mFileFront = File(requireContext().cacheDir, "front_" + System.currentTimeMillis() + ".jpg")
        ONBOARDDATAMANAGER.mFileBack = File(requireContext().cacheDir, "back_" + System.currentTimeMillis() + ".jpg")

        binding!!.framePreview.clipToOutline = true
        binding!!.framePreview.outlineProvider = object: ViewOutlineProvider() {
            override fun getOutline(view: View?, outline: Outline?) {
                view?.let {
                    outline?.setRoundRect(0, 0, it.width, (view.height), 16F)
                }
            }
        }

        binding!!.lheader.ivBack.setOnClickListener {
            activity?.finish()
        }
        setupGestureDetection()
        binding!!.btnCapture.setOnClickListener {
            if (captureStep == CaptureStep.CAPTURE_FRONT) {
                takePicture(ONBOARDDATAMANAGER.mFileFront) {
                    playSoundBeep()
                    captureStep = CaptureStep.CAPTURE_BACK
                    ONBOARDDATAMANAGER.mBitmapFront = it
                    showDescription()
                }
            } else {
                takePicture(ONBOARDDATAMANAGER.mFileBack) {
                    playSoundBeep()
                    ONBOARDDATAMANAGER.mBitmapBack = it
                    mCallBack?.run()
                }
            }
        }

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
                    if (abs(diffX) > 100) {
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
        get() {return binding?.cameraPreview!!}

    override val imageAnalyzer: ImageAnalysis?
        get() = null

    override fun onResume() {
        super.onResume()
        showDescription()
    }

    private fun playSoundBeep() {
        if (mediaPlayer != null && !mediaPlayer?.isPlaying!!) {
            mediaPlayer?.start()
        }
    }

    private fun showDescription() {
        if (captureStep == CaptureStep.CAPTURE_FRONT) {
            binding!!.tvInstructionTitle.setText(R.string.instruction_front)
        } else {
            binding!!.tvInstructionTitle.setText(R.string.instruction_back)
        }
    }

    override fun onPause() {
        super.onPause()
    }

    override fun onDestroyView() {
        binding = null
        if (mediaPlayer != null) {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        }
        super.onDestroyView()
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        val activity = activity
    }

    override fun onDetach() {
        super.onDetach()

    }

    companion object {
        private val TAG = CameraOCRFragment::class.java.simpleName

        private val REQUEST_CAMERA_PERMISSION = 1
        private val FRAGMENT_DIALOG = "CameraMLKitFragment"

        fun newInstance(): CameraOCRFragment {
            return CameraOCRFragment()
        }
    }
}
