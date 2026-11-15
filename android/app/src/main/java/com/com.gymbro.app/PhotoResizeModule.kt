package com.gymbro.app

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import kotlin.math.max
import kotlin.math.min

/**
 * Reduce las fotos antes de guardarlas (las de la cámara ocupan 3-5 MB).
 * Es la parte `saveResized` del TicketImageModule de CestaBro.
 */
class PhotoResizeModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

  override fun getName() = "PhotoResize"

  /**
   * Guarda una copia reducida de la foto (lado largo `maxSide`, JPEG) en
   * `destPath`, ya girada según su EXIF.
   */
  @ReactMethod
  fun saveResized(uri: String, destPath: String, maxSide: Double, quality: Double, promise: Promise) {
    Thread {
      try {
        val source = decodeUpright(Uri.parse(uri), maxSide.toInt() * 2)
        val scale = min(1.0, maxSide / max(source.width, source.height))
        val bitmap = if (scale < 1.0) {
          Bitmap.createScaledBitmap(source, (source.width * scale).toInt(), (source.height * scale).toInt(), true).also { source.recycle() }
        } else {
          source
        }
        val file = File(destPath)
        file.parentFile?.mkdirs()
        FileOutputStream(file).use { bitmap.compress(Bitmap.CompressFormat.JPEG, quality.toInt(), it) }
        bitmap.recycle()
        promise.resolve(destPath)
      } catch (e: Throwable) {
        promise.reject("save_failed", e.message, e)
      }
    }.start()
  }

  /** Decodifica la foto (reduciendo a mitades hasta `maxSide` de lado) y la gira según su EXIF. */
  private fun decodeUpright(uri: Uri, maxSide: Int): Bitmap {
    val resolver = context.contentResolver
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri).use { BitmapFactory.decodeStream(it, null, bounds) }
    var sample = 1
    while (max(bounds.outWidth, bounds.outHeight) / sample > maxSide) {
      sample *= 2
    }
    val options = BitmapFactory.Options().apply { inSampleSize = sample }
    val bitmap = resolver.openInputStream(uri).use { BitmapFactory.decodeStream(it, null, options) }
      ?: throw IllegalArgumentException("No se pudo abrir la foto")
    val orientation = resolver.openInputStream(uri).use {
      if (it == null) ExifInterface.ORIENTATION_NORMAL
      else ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
    }
    val degrees = when (orientation) {
      ExifInterface.ORIENTATION_ROTATE_90 -> 90f
      ExifInterface.ORIENTATION_ROTATE_180 -> 180f
      ExifInterface.ORIENTATION_ROTATE_270 -> 270f
      else -> 0f
    }
    if (degrees == 0f) {
      return bitmap
    }
    val rotated = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, Matrix().apply { postRotate(degrees) }, true)
    bitmap.recycle()
    return rotated
  }
}
