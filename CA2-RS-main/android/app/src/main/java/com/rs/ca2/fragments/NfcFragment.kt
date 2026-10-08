package com.rs.ca2.fragments

import android.content.Context
import android.nfc.Tag
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.R
import com.rs.ca2.common.CoreConstant
import com.rs.ca2.common.IntentData
import com.rs.ca2.common.ONBOARDDATAMANAGER
import com.rs.ca2.databinding.FragmentNfcBinding
import co.vnsafe.xverifysdk.card.EidCallback
import co.vnsafe.xverifysdk.card.EidFacade
import co.vnsafe.xverifysdk.card.NFCError
import co.vnsafe.xverifysdk.data.BasicInformation
import co.vnsafe.xverifysdk.data.Eid
import co.vnsafe.xverifysdk.jmrtd.DataGroupId
import co.vnsafe.xverifysdk.jmrtd.VerificationStatus


class NfcFragment : Fragment() , PopupNfcInstructionFragment.PopUpNfcListener {
    private lateinit var _binding: FragmentNfcBinding
    private val binding get() = _binding
    private lateinit var popupNfc:PopupNfcInstructionFragment
    private var basicInformation: BasicInformation? = null
    private var mrzInfo: MRZInfo? = null
    private var mHandler = Handler(Looper.getMainLooper())
    private var nfcReadJob: Job? = null
    private var nfcFragmentListener: NfcFragmentListener?=null
    private var timeoutJob: Job? =
        null // Because, maybe the device hasn't time to restart the NFC reader
    private var isReadingNfc = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentNfcBinding.inflate(inflater, container, false)

        popupNfc = PopupNfcInstructionFragment()
        popupNfc.setListener(this)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val arguments = arguments
        mrzInfo = arguments!!.getSerializable(IntentData.KEY_MRZ_INFO) as MRZInfo?
        basicInformation =
            arguments.getSerializable(IntentData.KEY_QRCODE_INFO) as BasicInformation?
        setListener()
    }

    fun handleNfcTag(tag: Tag) {
        nfcReadJob = EidFacade.readChipNfc(
            requireContext(),
            tag,
            mrzInfo!!,
            basicInformation,
            object : EidCallback {
                override fun onEidReadStart() {
                    onNFCReadStart()
                }

                override fun onEidReadFinish() {
                    onNFCReadFinish()
                }

                override fun onEidRead(eid: Eid?) {
                    this@NfcFragment.onEidRead(eid)
                }

                override fun onEidReading(dataGroupId: DataGroupId, progress: Int?) {
                }

                override fun onError(error: NFCError) {
                    when (error) {
                        NFCError.TAG_LOST_CONNECT_EXCEPTION -> onTagLost()
                        NFCError.BAC_DENIED_ERROR, NFCError.PACE_ERROR, NFCError.ACCESS_DENIED_ERROR -> {
                            Toast.makeText(
                                context,
                                getString(R.string.warning_authentication_failed),
                                Toast.LENGTH_SHORT
                            ).show()
                            this@NfcFragment.onCardException(Exception(error.message))
                        }
                        NFCError.CARD_SERVICE_ERROR -> {
                            Toast.makeText(context, error.message, Toast.LENGTH_SHORT).show()
                            this@NfcFragment.onCardException(Exception(error.message))
                        }
                        else -> this@NfcFragment.onCardException(Exception(error.message))
                    }
                }
            })
    }


    //========================================
    //  region LISTENER
    //=======================================

    private fun setListener() {
        binding.btnStart.setOnClickListener {
            nfcFragmentListener?.onStartNfc()
            showDialog()
        }
        binding.llHeader.ivBack.setOnClickListener {
            requireActivity().finish()
        }
    }

    private fun showDialog(){
        val existingFragment = childFragmentManager.findFragmentByTag(TAG_POPUP)
        if (existingFragment == null) {
            popupNfc.show(childFragmentManager, TAG_POPUP)
        } else {
            Log.d("Popup", "PopupNfcInstructionFragment is already shown")
        }
    }
    private fun onScheduleCheckNfc(){
        timeoutJob?.cancel()
        isReadingNfc = false
        timeoutJob = CoroutineScope(Dispatchers.Main).launch {
            delay(8000)
            if (!isReadingNfc) {
                Toast.makeText(context, getString(R.string.tag_lost_connect), Toast.LENGTH_SHORT)
                    .show()
                closePopup()
            }
        }
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        val activity = activity
        if (activity is NfcFragmentListener) {
            nfcFragmentListener = activity
        }
    }

    fun restartUi() {
        mHandler.post {
            closePopup()
        }
    }

    override fun onDetach() {
        nfcFragmentListener = null
        super.onDetach()
    }

    override fun onDestroyView() {
        nfcReadJob?.cancel()
        popupNfc.onDestroy()
        timeoutJob?.cancel()
        EidFacade.removeReadNfc()
        super.onDestroyView()
    }

    override fun onPause() {
        isReadingNfc = false
        timeoutJob?.cancel()
        super.onPause()
    }


    override fun onResume() {
        super.onResume()
    }

    private fun onNFCReadStart() {
        Log.d(TAG, "onNFCSReadStart")
        mHandler.post {
            timeoutJob?.cancel()
            isReadingNfc = true
            popupNfc.setInstruct(R.drawable.ic_reading_nfc,getString(R.string.popup_nfc_title_reading_info),getString(R.string.popup_nfc_content_guide_reading_info))
        }
    }

    private fun onNFCReadFinish() {
        Log.d(TAG, "onNFCReadFinish")
    }

    private fun onCardException(cardException: Exception?) {
        mHandler.post {
            Toast.makeText(
                requireContext(),
                getString(R.string.error_read_card),
                Toast.LENGTH_SHORT
            ).show();
            closePopup()
        }

    }

    private fun onEidRead(eid: Eid?) {
        mHandler.post {
            val dataIntegrity =
                eid?.chipAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED
                        && eid?.passiveAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED
                        && eid?.activeAuthenticationStatus == VerificationStatus.Verdict.SUCCEEDED

            if (!dataIntegrity) {
                CoreConstant.showAlertDialog(
                    requireContext(),
                    "Đọc thẻ không thành công. Thử lại và giữ thẻ cố định!",
                    CoreConstant.DialogType.ERROR
                )
                closePopup()
            }else{
                popupNfc.setInstruct(R.drawable.ic_reading_nfc,getString(R.string.popup_nfc_success),getString(R.string.popup_nfc_read_success))
                popupNfc.setVisibleButton(false)
                Handler(Looper.getMainLooper()).postDelayed({
                    if (nfcFragmentListener != null) {
                        nfcFragmentListener?.onEidRead(eid)
                    }
                }, 800)
            }
        }
    }

    private fun onTagLost() {
        mHandler.post {
            popupNfc.setTitle( getString(R.string.popup_nfc_waiting_connect_card))
        }
    }

    private fun closePopup() {
        popupNfc.dismiss()
        timeoutJob?.cancel()
        EidFacade.removeReadNfc()
        nfcFragmentListener?.onDisableNfc()
    }
    //========================================
    // endregion
    //========================================




    interface NfcFragmentListener {
        fun onEidRead(eid: Eid?)
        fun onStartNfc()
        fun onDisableNfc()
    }


    companion object {
        private val TAG = NfcFragment::class.java.simpleName
        const val TAG_POPUP = "PopupNfcInstructionFragment"

        @JvmStatic
        fun newInstance(mrzInfo: MRZInfo, value: BasicInformation?) =
            NfcFragment().apply {
                arguments = Bundle().apply {
                    putSerializable(IntentData.KEY_QRCODE_INFO, value)
                    putSerializable(IntentData.KEY_MRZ_INFO, mrzInfo)
                }
            }
    }

    override fun onCancel() {
        EidFacade.removeReadNfc()
        closePopup()
    }




}
