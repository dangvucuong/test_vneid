package com.rs.ca2.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.rs.ca2.R
import com.rs.ca2.databinding.LayoutPopupNfcBinding

class PopupNfcInstructionFragment: BottomSheetDialogFragment() {

    private var listener: PopUpNfcListener? = null

    fun setListener(listener: PopUpNfcListener) {
        this.listener = listener
    }

    private var binding: LayoutPopupNfcBinding?=null
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = LayoutPopupNfcBinding.inflate(inflater, container, false)

        binding?.btnCancel?.setOnClickListener {
            dismiss()
            listener?.onCancel()
        }
        isCancelable = false

        return binding?.root
    }


    fun setInstruct(image:Int,title:String,des:String){
        binding?.icon?.setImageResource(image)
        binding?.tvGuide?.text = des
        binding?.tvTitle?.text = title
    }

    fun setTitle(title:String){
        binding?.tvTitle?.text = title
    }

    fun setVisibleButton(b:Boolean){
        binding?.btnCancel?.visibility = if(b) View.VISIBLE else View.GONE
    }

    override fun getTheme(): Int {
        return R.style.Custom_Dialog
    }


    interface PopUpNfcListener{
        fun onCancel()
    }
}
