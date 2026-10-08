package com.rs.ca2.activities.ekyb

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.fragments.ekyb.EkybUploadDocumentFragment

class EkybVerifyDocumentActivity : BaseActivity() {

    override fun initUi() {
    }

    override fun setListeners() {

    }

    override fun populateData() {
        checkPermissions{}
    }

    override val layoutRes: Int
        get() = R.layout.activity_ekyb_verify_document
    override val layoutView: View?
        get() = null

    @SuppressLint("CommitTransaction")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        if(savedInstanceState == null){
            supportFragmentManager.beginTransaction()
                .replace(R.id.container, EkybUploadDocumentFragment())
                .commitNow()
        }

    }
}