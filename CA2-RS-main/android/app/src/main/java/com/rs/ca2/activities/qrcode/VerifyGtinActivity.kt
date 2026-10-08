package com.rs.ca2.activities.qrcode

import android.graphics.Bitmap
import android.text.TextUtils
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.google.gson.JsonSyntaxException
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.WriterException
import com.google.zxing.common.BitMatrix
import com.google.zxing.qrcode.QRCodeWriter
import com.rs.ca2.R
import com.rs.ca2.activities.common.BaseActivity
import com.rs.ca2.databinding.ActivityVerifyGtinBinding
import co.vnsafe.xverifysdk.network.ApiService.Companion.APISERVICE
import co.vnsafe.xverifysdk.network.models.RestCallback
import co.vnsafe.xverifysdk.network.models.response.GtinVerifyResponseModel
import co.vnsafe.xverifysdk.network.models.response.ResponseModel

class VerifyGtinActivity : BaseActivity() {

    private lateinit var mBinding : ActivityVerifyGtinBinding
    override fun initUi() {
    }

    override fun setListeners() {
        mBinding.lheader.ivBack.setOnClickListener { finish() }
    }

    override fun populateData() {
        val gtin  = intent.getStringExtra("gtin")
        if (gtin != null && !TextUtils.isEmpty(gtin)) {
            requestProductInfo(gtin);
        }
    }

    override fun onBackPressed() {
        super.onBackPressed()
    }

    override val layoutRes: Int
        get() = R.layout.activity_verify_gtin
    override val layoutView: View
        get() {
            mBinding = ActivityVerifyGtinBinding.inflate(layoutInflater)
            return mBinding.root
        }


    private fun setData(data: GtinVerifyResponseModel) {
        mBinding.mainContainer.visibility = View.VISIBLE
        mBinding.txtGtin.text = data.gtinRespondsModel.product.gtin.toString()

        mBinding.txtStatus.text = if (data.gtinRespondsModel.status == "verified") "GS1 Verified" else "GS1 Not Verified"
        mBinding.txtStatus.background = ContextCompat.getDrawable(context, if (data.gtinRespondsModel.status == "verified") R.drawable.green_rounded_bg else R.drawable.red_rounded_bg)
        mBinding.imgQrcode.setImageBitmap(generateEAN13Barcode(data.gtinRespondsModel.product.gtin.toString(), height = 300, width = 600))

        val gs1LicenseModel = data.gtinRespondsModel.gs1License
        if (gs1LicenseModel != null) {
            mBinding.recyclerView.layoutManager = LinearLayoutManager(this)
            val myAdapter = MyAdapter(convertModelToJsonArray(gs1LicenseModel))
            mBinding.recyclerView.adapter = myAdapter
        }
    }

    private fun convertModelToJsonArray(item: Any): JsonArray {
        val gson = Gson()
        val jsonObject = gson.toJsonTree(item).asJsonObject
        val jsonArray = JsonArray()

        for ((key, value) in jsonObject.entrySet()) {
            val fieldObject = JsonObject()
            fieldObject.addProperty("key", key)
            fieldObject.addProperty("value", value.asString)
            jsonArray.add(fieldObject)
        }
        return jsonArray
    }

    fun generateQRCode(text: String, width: Int, height: Int): Bitmap? {
        val qrCodeWriter = QRCodeWriter()
        return try {
            val bitMatrix: BitMatrix = qrCodeWriter.encode(text, BarcodeFormat.UPC_A, width, height)
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) android.graphics.Color.BLACK else android.graphics.Color.WHITE)
                }
            }
            bitmap
        } catch (e: WriterException) {
            e.printStackTrace()
            null
        }
    }

    fun generateEAN13Barcode(text: String, width: Int, height: Int): Bitmap? {
        if (text.length != 12 && text.length != 13) {
            throw IllegalArgumentException("EAN-13 barcode must be 12 or 13 digits long. Provided length: ${text.length}")
        }
        return try {
            val writer = MultiFormatWriter()
            val bitMatrix: BitMatrix = writer.encode(text, BarcodeFormat.EAN_13, width, height)
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) android.graphics.Color.BLACK else android.graphics.Color.WHITE)
                }
            }
            bitmap
        } catch (e: WriterException) {
            e.printStackTrace()
            null
        }
    }

    private fun requestProductInfo(gtin: String) {
        mBinding.progressBar.visibility = View.VISIBLE
        APISERVICE.verifyGtin(gtin,  object : RestCallback<ResponseModel<GtinVerifyResponseModel>>() {
            override fun Success(model: ResponseModel<GtinVerifyResponseModel>?) {
                mBinding.progressBar.visibility = View.GONE
                if (model == null) {
                    showPopup(getString(R.string.error_system)) { finish() }
                    return
                }
                if (model.data == null) {
                    val errorMessage = model.error?.message
                    showPopup(if (!errorMessage.isNullOrEmpty()) errorMessage else getString(R.string.error_not_success)) { finish() }
                    return
                }

                setData(model.data)
            }

            override fun Error(error: String?) {
                showPopup(if (!error.isNullOrEmpty()) error else getString(R.string.error_not_success)) { finish() }
            }
        })
    }

    class MyAdapter(private val itemList: JsonArray) : RecyclerView.Adapter<MyAdapter.MyViewHolder>() {

        class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val titleTextView: TextView = itemView.findViewById(R.id.txtTitle)
            val valueTextView: TextView = itemView.findViewById(R.id.txtValue)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_gs1_license, parent, false)
            return MyViewHolder(view)
        }

        override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
            val item = itemList[position].asJsonObject
            holder.titleTextView.text = convertToTitleCase(item.get("key").asString)
            var value = item.get("value").asString
            if (isJsonString(value)) {
                var jsonObject = convertStringToJsonObject(value)?.asJsonObject
                if (jsonObject != null) {
                    holder.valueTextView.text = jsonObject.get("value").asString
                } else {
                    holder.valueTextView.text = ""
                }
            } else {
                holder.valueTextView.text = value
            }
        }

        fun convertToTitleCase(input: String): String {
            return input.split("_") // Split by underscores
                .joinToString(" ") { it.capitalize() } // Capitalize each word and join with space
        }

        private fun isJsonString(input: String): Boolean {
            return try {
                val jsonParser = JsonParser()
                val element = jsonParser.parse(input)
                element.isJsonObject || element.isJsonArray
            } catch (e: JsonSyntaxException) {
                false
            }
        }

        private fun convertStringToJsonObject(jsonString: String): JsonElement? {
            return try {
                val jsonParser = JsonParser()
                return jsonParser.parse(jsonString)

            } catch (e: JsonSyntaxException) {
                e.printStackTrace()
                null
            }
        }

        override fun getItemCount() = itemList.size();
    }
}