package com.rs.ca2.activities.common

import android.content.Context
import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Outline
import android.media.MediaPlayer
import android.os.Handler
import android.view.View
import android.view.ViewOutlineProvider
import androidx.camera.core.CameraSelector
import androidx.camera.view.LifecycleCameraController
import androidx.core.content.ContextCompat
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.common.BusinessType
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.ActivityLivenessBinding
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE

import co.vnsafe.xverifysdk.network.models.CecaEnums
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ceca.CecaVerifyResponseModel
import co.vnsafe.xverifysdk.utils.CecaUtils
import co.vnsafe.xverifysdk.vision.ActiveEkycUtils
import co.vnsafe.xverifysdk.vision.EkycLivenessListener
import co.vnsafe.xverifysdk.vision.EkycLivenessNavigateListener
import co.vnsafe.xverifysdk.vision.EkycLivenessState
import co.vnsafe.xverifysdk.vision.EkycVerificationMode
import co.vnsafe.xverifysdk.vision.EkycVerifyError
import co.vnsafe.xverifysdk.vision.EkycVerifyListener
import co.vnsafe.xverifysdk.vision.core.StepFace

class LivenessActivity : BaseActivity() {

    private var mBinding: ActivityLivenessBinding? = null
    private var cameraController: LifecycleCameraController? = null
    private var mediaPlayer: MediaPlayer? = null
    private var tipNavigateState = ""


    private val navigateListener: EkycLivenessNavigateListener =
        object : EkycLivenessNavigateListener {
            override fun onNavigateState(ekycLivenessState: EkycLivenessState?) {
                tipNavigateState = when (ekycLivenessState) {
                    EkycLivenessState.KEEP_STABLE -> getString(R.string.tip_state_keep_stable)
                    EkycLivenessState.THE_DISTANCE_IS_NEAR -> getString(R.string.tip_state_distance_near)
                    EkycLivenessState.THE_DISTANCE_IS_FAR -> getString(R.string.tip_state_distance_far)
                    EkycLivenessState.NORMAL -> ""
                    null -> ""
                }
            }

            override fun onResetState() {
                tipNavigateState = ""
                CoreConstant.showAlertDialog(
                    this@LivenessActivity,
                    getString(R.string.active_ekyc_failed_message),
                    CoreConstant.DialogType.ERROR
                )
            }

            override fun onReadyDetect(isReady: Boolean) {
                if (isReady) {
                    mBinding!!.viewReady.setColorFilter(
                        ContextCompat.getColor(
                            this@LivenessActivity,
                            R.color.color_green
                        )
                    )
                }
            }
        }

    private val faceListener: EkycLivenessListener = object : EkycLivenessListener {
        override fun onMultiFace() {
            mBinding!!.viewReady.visibility = View.GONE
            mBinding!!.viewReady.setColorFilter(
                ContextCompat.getColor(
                    this@LivenessActivity,
                    R.color.color_red
                )
            )
            mBinding!!.ivTipFace.visibility = View.GONE
            mBinding!!.tvStepInstruction.text = getString(R.string.multi_face)
        }

        override fun onNoFace() {
            mBinding!!.viewReady.visibility = View.GONE
            mBinding!!.viewReady.setColorFilter(
                ContextCompat.getColor(
                    this@LivenessActivity,
                    R.color.color_red
                )
            )
            mBinding!!.ivTipFace.visibility = View.GONE
            mBinding!!.tvStepInstruction.text = getString(R.string.put_your_face_in_the_frame)
        }

        override fun onPlaySound() {
            playSoundBeep()
        }

        override fun onFaceResult(step: StepFace, path: String) {
        }

        override fun onStep(step: StepFace) {
            if (step == StepFace.FACE_NEAR || step == StepFace.FACE_FAR) {
                mBinding!!.viewReady.visibility = View.VISIBLE
            } else {
                mBinding!!.viewReady.visibility = View.GONE
            }
            mBinding!!.viewReady.setColorFilter(
                ContextCompat.getColor(
                    this@LivenessActivity,
                    R.color.color_red
                )
            )

            mBinding!!.ivTipFace.visibility = View.GONE

            mBinding!!.tvStepInstruction.text = when (step) {
                StepFace.FACE -> tipNavigateState + getString(R.string.please_look_straight)
                StepFace.FACE_CENTER -> tipNavigateState + getString(R.string.please_look_straight)
                StepFace.LEFT -> tipNavigateState + getString(R.string.please_tilt_your_face_to_the_left)
                StepFace.RIGHT -> tipNavigateState + getString(R.string.please_tilt_your_face_to_the_right)
                StepFace.SURPRISED -> tipNavigateState + getString(R.string.please_surprised)
                StepFace.SADNESS -> tipNavigateState + getString(R.string.please_sadness)
                StepFace.SMILE -> tipNavigateState + getString(R.string.please_smile)
                StepFace.NOD_DOWN -> tipNavigateState + getString(R.string.please_nod_down)
                StepFace.NOD_UP -> tipNavigateState + getString(R.string.please_nod_up)
                StepFace.OPEN_MOUTH -> tipNavigateState + getString(R.string.please_open_your_mouth)
                StepFace.DONE -> {
                    ""
                }

                StepFace.FACE_FAR -> getString(R.string.tip_face_far)
                StepFace.FACE_NEAR -> getString(R.string.tip_face_near)
            }
        }
    }


    private val onVerifyListener: EkycVerifyListener = object : EkycVerifyListener {
        override fun onProcess() {
            showProgress()
            mBinding!!.ivTipFace.visibility = View.GONE
            mBinding!!.tvStepInstruction.text = getString(R.string.nfc_verify)
        }

        override fun onFinishProcess() {
            hideProgress()
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
                EkycVerificationMode.LIVENESS -> {
                }

                EkycVerificationMode.LIVENESS_FACE_MATCHING -> {
                    // -> live face & eidFace : verifyFaceMatch
                }

                EkycVerificationMode.VERIFY_LIVENESS -> {
                }
                // -> (verify left - right - center) vs (live face & eidFace) : verifyFaceMatch
                EkycVerificationMode.VERIFY_LIVENESS_FACE_MATCHING -> {
                    when (ONBOARDDATAMANAGER.businessType) {
                        else -> verifyLivenessFaceMatchingSuccess(isMatching, capturedFace!!)
                    }
                }

                EkycVerificationMode.CAPTURE_LIVENESS -> {

                }
            }
        }

        override fun onFailed(
            error: String,
            capturedFace: String,
            ekycVerificationMode: EkycVerificationMode,
            errorCodes: EkycVerifyError
        ) {
            hideProgress()
            CoreConstant.showAlertDialog(
                this@LivenessActivity,
                error,
                CoreConstant.DialogType.ERROR
            )
            Handler().postDelayed({
                ActiveEkycUtils.EKYCSERVICE.resetAnalysis()
            },2000)
//            if (errorCodes == EkycVerifyError.EKYC_FAILED) {
//                when (ekycVerificationMode) {
//                    EkycVerificationMode.LIVENESS -> {}
//                    EkycVerificationMode.LIVENESS_FACE_MATCHING -> {
//                        // -> live face & eidFace : verifyFaceMatch
//                    }
//
//                    EkycVerificationMode.VERIFY_LIVENESS -> {
//                        CoreConstant.showAlertDialog(
//                            this@LivenessActivity,
//                            error,
//                            CoreConstant.DialogType.ERROR
//                        )
//
//                    }
//                    // -> (verify left - right - center) vs (live face & eidFace) : verifyFaceMatch
//                    EkycVerificationMode.VERIFY_LIVENESS_FACE_MATCHING -> {
//                        when (ONBOARDDATAMANAGER.businessType) {
//                            BusinessType.VERIFY_EID_CECA -> {
//                                capturedFace?.let {
//                                    requestVerifyCecaEid(
//                                        verifyFaceMatch = false,
//                                        capturedFace
//                                    )
//                                }
//                            }
//
//                            else -> {
//                                capturedFace?.let {
//                                    verifyLivenessFaceMatchingSuccess(
//                                        verifyFaceMatch = false,
//                                        capturedFace
//                                    )
//                                }
//                            }
//                        }
//                    }
//
//                    EkycVerificationMode.CAPTURE_LIVENESS -> {
//                    }
//                }
//            } else {
//                CoreConstant.showAlertDialog(
//                    this@LivenessActivity,
//                    error,
//                    CoreConstant.DialogType.ERROR
//                )
//            }
        }

    }

    // =================================
    // region Life Cycle
    // =================================

    override fun initUi() {
        mBinding!!.layoutHeader.tvTitleHeader.text = getString(R.string.step_3_verify_face)
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
        ActiveEkycUtils.EKYCSERVICE.clear()
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

        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        ActiveEkycUtils.EKYCSERVICE.init(
            this, cameraController!!, ONBOARDDATAMANAGER.eid?.faceImage,
            EkycVerificationMode.VERIFY_LIVENESS_FACE_MATCHING, faceListener, onVerifyListener,
            arrayListOf(
                StepFace.FACE_CENTER,
                StepFace.LEFT,
                StepFace.RIGHT,
            ), true, false
        )
        ActiveEkycUtils.EKYCSERVICE.setNavigateListener(navigateListener)
        ActiveEkycUtils.EKYCSERVICE.setCameraController(cameraController!!)
        ActiveEkycUtils.EKYCSERVICE.startAnalysis()

    }

    private fun playSoundBeep() {
        if (mediaPlayer != null && !mediaPlayer?.isPlaying!!) {
            mediaPlayer?.start()
        }
    }

    protected fun showProgress() {
        runOnUiThread { mBinding!!.lavAnimationLoading.visibility = View.VISIBLE }
    }

    protected fun hideProgress() {
        runOnUiThread { mBinding!!.lavAnimationLoading.visibility = View.INVISIBLE }
    }

    // =================================
    // endregion
    // =================================

    // =================================
    // region Private Services
    // =================================
//    private fun requestVerifyCecaEid(verifyFaceMatch: Boolean, capturedFacePath: String) {
//        mBinding!!.ivTipFace.visibility = View.GONE
//        showProgress()
//        mBinding!!.tvStepInstruction.text = getString(R.string.loading_verify)
//        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
//        APISERVICE.verifyCecaEid(
//            ONBOARDDATAMANAGER.cecaVerifyRequestModel!!,
//            CecaEnums.CecaServiceType.EVERIFY.code,
//            object : RestCallback<CecaVerifyResponseModel>() {
//                override fun Success(model: CecaVerifyResponseModel?) {
//                    hideProgress()
//                    val verifyCECASuccess = model != null && CecaUtils.verifySignature(
//                        BuildConfig.CECA_PROVIDER_SECRET_KEY,
//                        model
//                    )
//                    val intent =
//                        Intent(this@LivenessActivity, VerifyCecaSuccessActivity::class.java)
//                    intent.putExtra(IntentData.KEY_FACE_MATCHING_SUCCESS, verifyFaceMatch)
//                    intent.putExtra(IntentData.KEY_FACE_LIVE, capturedFacePath)
//                    intent.putExtra(IntentData.KEY_CECA_ID_SUCCESS, verifyCECASuccess)
//                    startActivity(intent)
//                    finish()
//                }
//
//                override fun Error(error: String) {
//                    hideProgress()
//                    showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { }
//                }
//            })
//    }


    private fun verifyLivenessFaceMatchingSuccess(verifyFaceMatch: Boolean, pathFace: String) {
        ONBOARDDATAMANAGER.onboardingFaceImagePath = pathFace
        ONBOARDDATAMANAGER.isFaceMatch = verifyFaceMatch
        val pref = getSharedPreferences(packageName + "_preferences", Context.MODE_PRIVATE)
        pref.edit().putString("isValidIdCard", ONBOARDDATAMANAGER.isValidIdCard.toString() ).apply()
        pref.edit().putString("isFaceMatch", verifyFaceMatch.toString()).apply()
        setResult(RESULT_OK)
        finish()
    }
    // =================================
    // endregion
    // =================================

}
