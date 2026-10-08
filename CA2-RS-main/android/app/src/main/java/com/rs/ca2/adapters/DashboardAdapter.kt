package com.rs.ca2.adapters

import android.os.Build
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.RequiresApi
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.rs.ca2.APPDELEGATE
import com.rs.ca2.R
import com.rs.ca2.common.DASHBOARDMANAGER
import com.rs.ca2.common.DashboardItem
import com.rs.ca2.databinding.ItemDashboardBinding
import java.util.function.Consumer

class DashboardAdapter(delegate: Consumer<DashboardItem>) : RecyclerView.Adapter<DashboardAdapter.DashboardViewHolder>() {

    private val delegate: Consumer<DashboardItem>

    init {
        this.delegate = delegate
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DashboardViewHolder {
        val itemView: View = LayoutInflater.from(parent.context).inflate(R.layout.item_dashboard, parent, false)
        return DashboardViewHolder(itemView)
    }

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onBindViewHolder(holder: DashboardViewHolder, position: Int) {
        val item: DashboardItem = DASHBOARDMANAGER.getListDashboard()[position]
        holder.binding.ivIcon.setImageResource(item.icon)
        holder.binding.tvTitle.text = item.title
        if (item.isEnable) {
            holder.binding.tvTitle.setTextColor(ContextCompat.getColor(APPDELEGATE.context, R.color.colorPrimary))
            holder.binding.ivIcon.clearColorFilter()
        } else {
            holder.binding.tvTitle.setTextColor(ContextCompat.getColor(APPDELEGATE.context, R.color.silver))
            holder.binding.ivIcon.setColorFilter(ContextCompat.getColor(APPDELEGATE.context, R.color.silver))
        }
        holder.binding.cardView.setCardBackgroundColor(ContextCompat.getColor(APPDELEGATE.context, item.background))
        holder.binding.root.setOnClickListener {
            if (item.isEnable) {
                delegate.accept(item)
            }
        }
    }

    override fun getItemCount(): Int {
        return DASHBOARDMANAGER.getListDashboard().size
    }

    class DashboardViewHolder(itemView: View?) : RecyclerView.ViewHolder(itemView!!) {

        val binding: ItemDashboardBinding
        init {
            binding = ItemDashboardBinding.bind(itemView!!)
            binding.tvTitle.isSelected = true
        }
    }
}