package com.rs.ca2.adapters

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.util.Consumer
import androidx.recyclerview.widget.RecyclerView
import com.rs.ca2.R
import com.rs.ca2.databinding.ItemDashboardBinding
import com.rs.ca2.databinding.ItemUploadImageBinding
import com.rs.ca2.fragments.ekyb.EkybUploadDocumentFragment
class UploadDocumentAdapter(private val listener: OnAddImageListener,    private val removeListener: OnImageRemoveListener ) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private var images: MutableList<Uri> = mutableListOf()

    companion object {
        private const val TYPE_NORMAL = 1
        private const val TYPE_ADD_BUTTON = 2
    }

    override fun getItemViewType(position: Int): Int {
        return if (position == images.size) TYPE_ADD_BUTTON else TYPE_NORMAL
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_upload_image, parent, false)
        return if (viewType == TYPE_ADD_BUTTON) {
            AddButtonViewHolder(view, listener)
        } else {
            DocumentViewHolder(view, removeListener)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        if (holder is DocumentViewHolder && position < images.size) {
            holder.bind(images[position])
        }
    }

    fun addImage(uri: Uri) {
        images.add(uri)
        notifyItemInserted(images.size - 1)
    }

    fun getImages() = images

    override fun getItemCount(): Int {
        return images.size + 1
    }

    class DocumentViewHolder(itemView: View, private val removeListener: OnImageRemoveListener) : RecyclerView.ViewHolder(itemView) {
        private val binding = ItemUploadImageBinding.bind(itemView)

        fun bind(item: Uri) {
            binding.icAdd.visibility = View.GONE
            binding.llRemove.visibility = View.VISIBLE
            binding.image.setImageURI(item)

            binding.llRemove.setOnClickListener {
                val position = adapterPosition
                if (position != RecyclerView.NO_POSITION) {
                    removeListener.onRemoveImageClicked(position)
                }
            }
        }
    }

    class AddButtonViewHolder(itemView: View, listener: OnAddImageListener) : RecyclerView.ViewHolder(itemView) {
        private val binding = ItemUploadImageBinding.bind(itemView)

        init {
            binding.icAdd.setOnClickListener {
                listener.onAddImageClicked()
            }
        }
    }

    fun removeImage(position: Int) {
        if (position in images.indices) {
            images.removeAt(position)
            notifyItemRemoved(position)
            notifyItemRangeChanged(position, images.size)
        }
    }
}

interface OnAddImageListener {
    fun onAddImageClicked()
}
interface OnImageRemoveListener {
    fun onRemoveImageClicked(position: Int)
}

