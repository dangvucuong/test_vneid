package com.rs.ca2.common

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import com.rs.ca2.R

object DialogLoading {
    private var dialogLoading:Dialog?=null
     fun showLoading(context:Context){
        dialogLoading = Dialog(context)
        dialogLoading?.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialogLoading?.setContentView(R.layout.popup_loading)
        dialogLoading?.setCancelable(false)
        dialogLoading?.show()
    }

     fun hideLoading(){
        if(dialogLoading!=null){
            dialogLoading?.dismiss()
        }
    }

}