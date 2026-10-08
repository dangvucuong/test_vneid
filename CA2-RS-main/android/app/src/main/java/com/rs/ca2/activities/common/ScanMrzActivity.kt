package com.rs.ca2.activities.common

import android.content.Context
import com.google.gson.Gson
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import org.jmrtd.lds.icao.MRZInfo
import com.rs.ca2.common.IntentData
import com.rs.ca2.R
import com.rs.ca2.fragments.CameraMrzFragment
import co.vnsafe.xverifysdk.card.EidFacade
import co.vnsafe.xverifysdk.card.MRZCallback
import co.vnsafe.xverifysdk.card.MRZException

@Suppress("DEPRECATION")
class ScanMrzActivity : AppCompatActivity(), MRZCallback {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_camera)
        EidFacade.registerMrzListener(this)
        val cameraMrzFragment = CameraMrzFragment()
        cameraMrzFragment.setInputTypeImageCallBack {
            startActivityForResult(Intent(this, ImportMrzActivity::class.java), IMPORT_MRZ)
        }
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, cameraMrzFragment)
            .commit()
    }

    override fun onBackPressed() {
        super.onBackPressed()
        setResult(RESULT_CANCELED)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        EidFacade.unregisterMrzListener(this)
    }

    override fun completionHandler(mrzInfo: MRZInfo) {
        val jsonString = Gson().toJson(mrzInfo)
        val pref = getSharedPreferences(packageName + "_preferences", Context.MODE_PRIVATE)
        pref.edit().putString("mrz_key", jsonString).apply()
        val intent = Intent()
        intent.putExtra(IntentData.KEY_MRZ_INFO, mrzInfo)
        setResult(RESULT_OK, intent)
        finish()
    }

    override fun errorHandler(e: MRZException?) {

    }

    companion object {

        private val TAG = ScanMrzActivity::class.java.simpleName
        private const val IMPORT_MRZ = 1
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (resultCode == RESULT_OK) {
            when (requestCode) {
                IMPORT_MRZ -> {
                    val mrzInfo = data?.getSerializableExtra(IntentData.KEY_MRZ_INFO) as MRZInfo
                    val intent = Intent()
                    intent.putExtra(IntentData.KEY_MRZ_INFO, mrzInfo)
                    val jsonString = Gson().toJson(mrzInfo)
                    val pref = getSharedPreferences(packageName + "_preferences", Context.MODE_PRIVATE)
                    pref.edit().putString("mrz_key", jsonString).apply()
                    setResult(RESULT_OK, intent)
                    finish()
                }
            }
        }
        super.onActivityResult(requestCode, resultCode, data)
    }


}
