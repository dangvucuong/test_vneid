package com.rs.ca2.vision

import com.google.mlkit.vision.barcode.common.Barcode
import java.lang.ref.WeakReference

object QRCodeFacade {
    private val callbacks: MutableList<WeakReference<QRCodeCallback>> = mutableListOf()

    // =================================
    // region Public
    // =================================

    fun broadcastEvent(barcode: List<Barcode>) {
        callbacks.filter { it.get() != null }.forEach {
            it.get()?.onResult(barcode);
        }
    }

    /**
     *  Register Mrz Listener to receive result from Mrz scanner.
     *  @param callback
     */
    fun registerListener(callback: QRCodeCallback) {
        callbacks.add(WeakReference(callback))
    }

    /**
     *  Unregister all Mrz Listener to receive result from Mrz scanner.
     *
     */
    fun unregisterListener() {
        callbacks.clear()
    }

    /**
     *  Unregister specify Mrz Listener to receive result from Mrz scanner.
     *  @param callback
     */
    fun unregisterListener(callback: QRCodeCallback) {
        val i: MutableIterator<WeakReference<QRCodeCallback>> = callbacks.iterator()
        while (i.hasNext()) {
            val item = i.next()
            if (item.get() == callback) {
                i.remove()
            }
        }
    }
}

interface QRCodeCallback {
    fun onResult(result: List<Barcode>);
}
