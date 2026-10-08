package com.rs.ca2.activities.common

import android.annotation.SuppressLint
import android.graphics.Outline
import android.media.MediaPlayer
import android.os.CountDownTimer
import android.os.Handler
import android.util.Log
import android.view.View
import android.view.ViewOutlineProvider
import android.widget.Toast
import androidx.camera.core.CameraSelector
import androidx.camera.view.LifecycleCameraController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import com.rs.ca2.BuildConfig
import com.rs.ca2.R
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.common.Utils
import com.rs.ca2.databinding.ActivityLivenessBinding
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.ResponseModel
import co.vnsafe.xverifysdk.network.models.response.VerifyIdResponseModel
import co.vnsafe.xverifysdk.network.models.response.face.FaceMatchingModel
import co.vnsafe.xverifysdk.vision.EkycLivenessListener
import co.vnsafe.xverifysdk.vision.EkycVerifyError
import co.vnsafe.xverifysdk.vision.PassiveEkycUtils
import co.vnsafe.xverifysdk.vision.PassiveVerifyListener
import co.vnsafe.xverifysdk.vision.core.StepFace

class PassiveEkycActivity : BaseActivity() {

    private var mBinding: ActivityLivenessBinding? = null
    private var cameraController: LifecycleCameraController? = null
    private var mediaPlayer: MediaPlayer? = null
    private var REQUEST_FAILED = 1
    private val MAX_REQUEST_FAILED = 3
    private val MAX_TIME = 3
    private val MIN_TIME = 2

    private var passiveEkycUtils: PassiveEkycUtils? = null

    private enum class StepPassive {
        DETECT_FACE,
        FAR_FACE,
        NEAR_FACE,
        NONE
    }

    private var stepPassive = StepPassive.NONE

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
        passiveEkycUtils?.clearSession()
        passiveEkycUtils = null
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

        passiveEkycUtils = PassiveEkycUtils(CoroutineScope(SupervisorJob() + Dispatchers.Main))
        passiveEkycUtils?.init(
            this,
            cameraController!!,
            object : EkycLivenessListener {
                override fun onMultiFace() {
                    stepPassive = StepPassive.NONE
                    mBinding!!.tvStepInstruction.text = getString(R.string.multi_face)
                }

                override fun onNoFace() {
                    stepPassive = StepPassive.NONE
                    mBinding!!.tvStepInstruction.text = getString(R.string.put_your_face_in_the_frame)
                }

                override fun onPlaySound() {
                    playSoundBeep(StepPassive.DETECT_FACE)
                }

                override fun onFaceResult(step: StepFace, path: String) {
                }

                override fun onStep(step: StepFace) {
                    when (step) {
                        StepFace.FACE_FAR -> {
                            playSoundBeep(StepPassive.FAR_FACE)
                            mBinding!!.tvStepInstruction.text = getString(R.string.is_face_so_far)
                        }
                        StepFace.FACE_NEAR -> {
                            playSoundBeep(StepPassive.NEAR_FACE)
                            mBinding!!.tvStepInstruction.text = getString(R.string.is_face_so_nearby)
                        }
                        StepFace.SMILE -> {
                            playSoundBeep(StepPassive.DETECT_FACE)
                            mBinding!!.tvStepInstruction.text = getString(R.string.please_smile)
                        }
                        else -> {
                            playSoundBeep(StepPassive.DETECT_FACE)
                            mBinding!!.tvStepInstruction.text = getString(R.string.put_your_face_in_the_frame)
                        }
                    }
                }
            },
            object : PassiveVerifyListener {
                override fun onProcess() {
                    showProgress()
                }

                override fun onFinishProcess() {
                    hideProgress()
                }

                override fun onFailed(
                    error: String,
                    capturedFace: String,
                    errorCodes: EkycVerifyError
                ) {
                    hideProgress()
                    CoreConstant.showAlertDialog(
                        this@PassiveEkycActivity,
                        error,
                        CoreConstant.DialogType.ERROR
                    )
                }

                override fun onVerifyCompleted(isMatching: Boolean, capturedFace: String) {
                    if (!ONBOARDDATAMANAGER.isValidIdCard) {
                        requestVerifyEid(capturedFace) {
                            requestVerifyFaceMatchingEKYC(capturedFace) {
                                setResult(RESULT_OK)
                                finish()
                            }
                        }
                    } else {
                        requestVerifyFaceMatchingEKYC(capturedFace) {
                            setResult(RESULT_OK)
                            finish()
                        }
                    }
                }
            }
        )
        passiveEkycUtils?.startAnalysis()

//        if (scheduledFutureOverTime == null) {
//            scheduledFutureOverTime = exeServiceOverTime.schedule(Runnable {
//                AppExecutors.get().mainThread().execute{
//                    CoreConstant.showAlertDialog(
//                        this@PassiveLivenessActivity,
//                        "Over time session",
//                        CoreConstant.DialogType.ERROR
//                    )
//                    LivenessUtils.EKYCSERVICE.cleanSession()
//                }
//            }, OVER_TIME.toLong(), TimeUnit.SECONDS)
//        }
    }

    private fun playSoundBeep(facePassive: StepPassive) {
        if (stepPassive != facePassive || stepPassive == StepPassive.NONE) {
            stepPassive = facePassive
            if (mediaPlayer != null && !mediaPlayer?.isPlaying!!) {
                mediaPlayer?.start()
            }
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

    private fun requestVerifyFaceMatchingEKYC(faceLive: String, runnableSuccess: Runnable) {
        mBinding!!.ivTipFace.visibility = View.GONE
        showProgress()
        APISERVICE.verifyFaceMatching(
            ONBOARDDATAMANAGER.referenceFaceImagePath!!,
            faceLive,
            object : RestCallback<FaceMatchingModel>() {
                override fun Success(model: FaceMatchingModel?) {
                    hideProgress()
                    if (model?.data != null && model.data.match == 1) {
                        ONBOARDDATAMANAGER.isFaceMatch = model.data.match == 1
                        ONBOARDDATAMANAGER.onboardingFaceImagePath = faceLive
                        runnableSuccess.run()
                    } else {
                        requestFailed()
                    }
                }

                override fun Error(error: String?) {
                    hideProgress()
                    requestFailed()
                }
            })
    }

    private fun requestVerifyEid(pathFace: String, runnableSuccess: Runnable) {
        mBinding!!.ivTipFace.visibility = View.GONE
        val requestModel = ONBOARDDATAMANAGER.verifyIdRequestModel
        APISERVICE.init(BuildConfig.API_KEY, BuildConfig.API_BASE_URL, BuildConfig.CUSTOMER_CODE)
        APISERVICE.verifyEid(
            requestModel!!,
            object : RestCallback<ResponseModel<VerifyIdResponseModel>>() {
                override fun Success(model: ResponseModel<VerifyIdResponseModel>?) {
                    if (model == null) {
                        showPopup(getString(R.string.error_system)) { finish() }
                        return
                    }
                    if (model.data == null) {
                        val errorMessage = model.error?.message
                        showPopup(if (!errorMessage.isNullOrEmpty()) errorMessage else getString(R.string.error_not_success)) { finish() }
                        finish()
                        return
                    }
                    val isValidIdCard = model.data.isValidIdCard
                    var checkSignature = false
                    if (isValidIdCard) {
                        val respondsMsg = model.data.responds.toJsonString()
                        val signature = model.data?.signature ?: ""
                        checkSignature = ONBOARDDATAMANAGER.eid?.verifyRsaSignature(
                            context,
                            signature,
                            respondsMsg
                        )!!
                    }

                    ONBOARDDATAMANAGER.isValidIdCard = isValidIdCard && checkSignature
                    Utils.storeImageEid(
                        this@PassiveEkycActivity,
                        ONBOARDDATAMANAGER.eid?.faceImage
                    ) {
                        ONBOARDDATAMANAGER.referenceFaceImagePath = it
                    }
                    ONBOARDDATAMANAGER.onboardingFaceImagePath = pathFace
                    runnableSuccess.run()
                }

                override fun Error(error: String?) {
                    showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error)) { finish() }
                }

            })
    }



    private fun requestFailed() {
        if (REQUEST_FAILED == MAX_REQUEST_FAILED) {
            passiveEkycUtils?.resetTasks()
        } else {
            showPopup("Quá $MAX_REQUEST_FAILED lần xác thực khuôn mặt không khớp") { finish() }
        }
    }
    // =================================
    // endregion
    // =================================




}
