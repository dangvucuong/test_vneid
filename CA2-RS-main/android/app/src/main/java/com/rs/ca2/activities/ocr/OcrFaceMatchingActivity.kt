package com.rs.ca2.activities.ocr

import android.annotation.SuppressLint
import android.graphics.Outline
import android.media.MediaPlayer
import android.os.Handler
import android.view.View
import android.view.ViewOutlineProvider
import androidx.camera.core.CameraSelector
import androidx.camera.view.LifecycleCameraController
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityLivenessBinding
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE
import co.vnsafe.xverifysdk.vision.ActiveEkycUtils
import co.vnsafe.xverifysdk.vision.EkycLivenessListener
import co.vnsafe.xverifysdk.vision.EkycVerificationMode
import co.vnsafe.xverifysdk.vision.EkycVerifyError
import co.vnsafe.xverifysdk.vision.EkycVerifyListener
import co.vnsafe.xverifysdk.vision.core.StepFace

class OcrFaceMatchingActivity : BaseActivity() {

    private var mBinding: ActivityLivenessBinding? = null
    private var cameraController: LifecycleCameraController? = null
    private var mediaPlayer: MediaPlayer? = null

    private val faceListener: EkycLivenessListener = object : EkycLivenessListener {
        override fun onMultiFace() {
            mBinding!!.tvStepInstruction.text = getString(R.string.multi_face)
        }

        override fun onNoFace() {
            mBinding!!.tvStepInstruction.text = getString(R.string.put_your_face_in_the_frame)
        }
        override fun onPlaySound() {
            playSoundBeep()
        }

        override fun onFaceResult(step: StepFace, path: String) {
        }

        override fun onStep(step: StepFace) {
            mBinding!!.tvStepInstruction.text = when(step) {
                StepFace.FACE -> getString(R.string.please_look_straight)
                StepFace.FACE_CENTER -> getString(R.string.please_look_straight)
                StepFace.LEFT -> getString(R.string.please_tilt_your_face_to_the_left)
                StepFace.RIGHT -> getString(R.string.please_tilt_your_face_to_the_right)
                StepFace.SURPRISED -> getString(R.string.please_surprised)
                StepFace.SADNESS -> getString(R.string.please_sadness)
                StepFace.SMILE -> getString(R.string.please_smile)
                StepFace.NOD_DOWN -> getString(R.string.please_nod_down)
                StepFace.NOD_UP -> getString(R.string.please_nod_up)
                StepFace.OPEN_MOUTH -> getString(R.string.please_open_your_mouth)
                StepFace.DONE -> {""}
                StepFace.FACE_FAR -> TODO()
                StepFace.FACE_NEAR -> TODO()
            }
        }
    }

    private val onVerifyListener: EkycVerifyListener = object : EkycVerifyListener {
        override fun onProcess() {
            showProgress()
            mBinding!!.tvStepInstruction.text = getString(R.string.nfc_verify)
        }

        override fun onFinishProcess() {
            hideProgress()
        }

        override fun onFailed(
            error: String,
            capturedFace: String,
            ekycVerificationMode: EkycVerificationMode,
            errorCodes: EkycVerifyError
        ) {
            hideProgress()
            CoreConstant.showAlertDialog(
                this@OcrFaceMatchingActivity,
                error,
                CoreConstant.DialogType.ERROR
            )
            Handler().postDelayed({
                ActiveEkycUtils.EKYCSERVICE.resetAnalysis()
            },2000)
        }

        override fun onVerifyCompleted(
            ekycVerificationMode: EkycVerificationMode,
            verifyLiveness: Boolean,
            isMatching: Boolean,
            matchingScore: Double,
            capturedFace: String
        ) {
            hideProgress()
            when (ekycVerificationMode) {
                EkycVerificationMode.LIVENESS_FACE_MATCHING -> {
                    ONBOARDDATAMANAGER.onboardingFaceImagePath = capturedFace
                    ONBOARDDATAMANAGER.isFaceMatch = isMatching
                    setResult(RESULT_OK)
                    finish()
                }
                else -> {
                    finish()
                }
            }
        }
    }

    // =================================
    // region Life Cycle
    // =================================
    override fun initUi() {
        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)

        mBinding!!.layoutHeader.tvTitleHeader.text = getString(R.string.verify_face_transfer)
        mBinding!!.cameraPreview.clipToOutline = true
        mBinding!!.cameraPreview.outlineProvider = object : ViewOutlineProvider() {
            override fun getOutline(view: View, outline: Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, view.height / 2.0f)
            }
        }
        mBinding!!.tvStepInstruction.text = getString(R.string.put_your_face_in_the_frame)
        mediaPlayer = MediaPlayer.create(this, R.raw.sound_beep)
    }

    override fun setListeners() {
        mBinding!!.layoutHeader.ivBack.setOnClickListener { v: View? -> finish() }
        mBinding!!.ivChangeCamera.setOnClickListener { v: View? ->

            if (cameraController?.cameraSelector == CameraSelector.DEFAULT_BACK_CAMERA) {
                cameraController?.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
            } else {
                cameraController?.cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            }
        }
    }

    override fun populateData() {
        checkPermissions { startCamera() }
    }

    override val layoutRes: Int
        get() = R.layout.activity_liveness
    override val layoutView: View
        get() {
            mBinding = ActivityLivenessBinding.inflate(layoutInflater)
            return mBinding!!.root
        }

    override fun onDestroy() {
        if (mediaPlayer != null) {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        }
        super.onDestroy()
    }

    // =================================
    // endregion
    // =================================

    // =================================
    // region Private Liveness
    // =================================

    @SuppressLint("SetTextI18n")
    private fun startCamera() {
        cameraController = LifecycleCameraController(this)
        cameraController?.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
        cameraController?.bindToLifecycle(this)
        mBinding!!.cameraPreview.controller = cameraController

        ActiveEkycUtils.EKYCSERVICE.init(
            this, cameraController!!, ONBOARDDATAMANAGER.eid?.faceImage,
            EkycVerificationMode.LIVENESS_FACE_MATCHING, faceListener, onVerifyListener,
            arrayListOf(
                StepFace.FACE_CENTER,
                StepFace.SMILE,
            ), false,true
        )

        ActiveEkycUtils.EKYCSERVICE.setCameraController(cameraController!!)
        ActiveEkycUtils.EKYCSERVICE.startAnalysis()
    }

    private fun playSoundBeep() {
        if (mediaPlayer != null && !mediaPlayer?.isPlaying!!) {
            mediaPlayer?.start()
        }
    }

    private fun showProgress() {
        runOnUiThread { mBinding!!.lavAnimationLoading.visibility = View.VISIBLE }
    }

    private fun hideProgress() {
        runOnUiThread { mBinding!!.lavAnimationLoading.visibility = View.INVISIBLE }
    }

    // =================================
    // endregion
    // =================================

}
